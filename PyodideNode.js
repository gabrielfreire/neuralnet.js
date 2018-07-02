const path = require('path');
const fs = require('fs');
const pyodideModuleInitializer = require('./pyodide.asm.js');
const pyodideWasmURL = path.join(__dirname, '/pyodide.asm.wasm');
const pyodideBaseURL = path.join(__dirname, '/');
const pyodidePackagesURL = path.join(__dirname, '/');
const fetch = require('isomorphic-fetch');
let pyodide;
const packagesURL = 'https://iodide.io/pyodide-demo/';
const packages = {
    'dateutil': [],
    'matplotlib': ['numpy', 'dateutil', 'pytz'],
    'numpy': [],
    'pandas': ['numpy', 'dateutil', 'pytz'],
    'pytz': [],
};
let loadedPackages = new Set();

class PyodideNode {
    constructor() {}
    loadLanguage() {
        return new Promise((resolve, reject) => {
            let Module = {};
            this._fetch_node(pyodideWasmURL).then((buffer) => buffer.arrayBuffer()).then((arrayBuffer) => {
                let wasm_promise = WebAssembly.compile(arrayBuffer);
                Module.instantiateWasm = (info, receiveInstance) => {
                    wasm_promise
                    .then(module => {
                        // add Module to the process so pyodide.asm.data.js can access
                        process['Module'] = Module;
                        // Load packages
                        require('./pyodide.asm.data.js');
                        return WebAssembly.instantiate(module, info)
                    }).then(instance => {
                        return receiveInstance(instance)
                    });
                    return {};
                };
                Module.filePackagePrefixURL = pyodideBaseURL;
                Module.postRun = () => {
                    Module = null;
                    resolve();
                };
                pyodide = pyodideModuleInitializer(Module);
                pyodide.loadPackage = (names) => {
                    if (Array.isArray(names)) {
                        names = [names];
                    }
                    // DFS to find all dependencies of the requested packages
                    let queue = new Array(names);
                    let toLoad = new Set();
                    while (queue.length) {
                        const pckg = queue.pop();
                        if (!packages.hasOwnProperty(pckg)) {
                            throw `Unknown package '${pckg}'`;
                        }
                        if (!loadedPackages.has(pckg)) {
                            toLoad.add(pckg);
                            packages[pckg].forEach((subpackage) => {
                                if (!loadedPackages.has(subpackage) &&
                                    !toLoad.has(subpackage)) {
                                    queue.push(subpackage);
                                }
                            });
                        }
                    }

                    let promise = new Promise((resolve, reject) => {
                        if (toLoad.size === 0) {
                            resolve('No new packages to load');
                        }

                        pyodide.monitorRunDependencies = (n) => {
                            if (n === 0) {
                                toLoad.forEach((pckg) => loadedPackages.add(pckg));
                                delete pyodide.monitorRunDependencies;
                                const packageList = Array.from(toLoad.keys()).join(', ');
                                resolve(`Loaded ${packageList}`);
                            }
                        };

                        toLoad.forEach((pckg) => {
                            let necessaryTypes = [`${pckg}.js`, `${pckg}.data`];
                            for(let i = 0; i < necessaryTypes.length; i++) {
                                (async function(fileType, idx) {
                                    let p = path.join(pyodidePackagesURL, `/${fileType}`);
                                    if(fs.existsSync(p)){
                                        resolve({ path: path.join(pyodidePackagesURL, `/${pckg}.js`) });
                                    }
                                    if(!fs.existsSync(pyodidePackagesURL)) {
                                        fs.mkdirSync(pyodidePackagesURL);
                                    }
                                    let file = await fetch(`${packagesURL}${fileType}`);
                                    let buffer = await file.buffer();
                                    if(!buffer) reject();
                                    fs.writeFileSync(p, buffer);
                                    if(idx == necessaryTypes.length - 1) {
                                        console.log('will resolve');
                                        resolve({ path: path.join(pyodidePackagesURL, `/${pckg}.js`)});
                                    }
                                })(necessaryTypes[i], i);
                            }
                        });

                        // We have to invalidate Python's import caches, or it won't
                        // see the new files. This is done here so it happens in parallel
                        // with the fetching over the network.
                        pyodide.runPython(
                            'import importlib as _importlib\n' +
                                '_importlib.invalidate_caches()\n');
                    });
                    return promise;
                }
                // add pyodide to the process so the packages .data.js files can access in the future
                process['pyodide'] = pyodide;
            });
        });
    }
    getPyodide() {
        if(!pyodide) throw "Pyodide wasn't loaded yet"
        return pyodide;
    }
    _fetch_node(file) {
        return new Promise((resolve, reject) => 
        fs.readFile(file, (err, data) => err ? reject(err) : resolve({ arrayBuffer: () => data })));
    }
}
module.exports = new PyodideNode();