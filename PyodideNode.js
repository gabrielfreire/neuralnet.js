const path = require('path');
const fs = require('fs');
const pyodideModuleInitializer = require('./pyodide.asm.js');
const pyodideWasmURL = path.join(__dirname, '/pyodide.asm.wasm');
const pyodideBaseURL = path.join(__dirname, '/');
const pyodidePackagesURL = path.join(__dirname, '/');
const fetch = require('isomorphic-fetch');
let pyodide = null;
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
        let self = this;
        return new Promise((resolve, reject) => {
            let Module = {};
            pyodide = {};
            this._fetch_node(pyodideWasmURL).then((buffer) => buffer.arrayBuffer()).then((arrayBuffer) => {
                let wasm_promise = WebAssembly.compile(arrayBuffer);
                Module.instantiateWasm = (info, receiveInstance) => {
                    wasm_promise
                    .then(module => {
                        // add Module to the process
                        process['Module'] = Module;
                        // load pyodide.asm.data.js (python standard libraries)
                        require('./pyodide.asm.data.js');
                        return WebAssembly.instantiate(module, info)
                    }).then(instance => {
                        return receiveInstance(instance)
                    });
                    return {};
                };
                Module.filePackagePrefixURL = pyodideBaseURL;
                Module.postRun = () => {
                    // remove module from the process
                    Module = null;
                    process['Module'] = null;
                    // setup pyodide and add to the process
                    pyodide.filePackagePrefixURL = pyodideBaseURL
                    pyodide.loadPackage = self._loadPackage;
                    process['pyodide'] = pyodide;
                    resolve();
                };
                pyodide = pyodideModuleInitializer(Module);
            }).catch((e) => {
                reject(e);
            });
        });
    }
    getModule() {
        if(!pyodide) throw "Pyodide wasn't loaded yet"
        return pyodide;
    }
    _loadPackage(names) {
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

        return new Promise((resolve, reject) => {
            console.log('Loading packages...');
            if (toLoad.size === 0) {
                resolve('No new packages to load');
            }

            pyodide.monitorRunDependencies = (n) => {
                if (n === 0) {
                    toLoad.forEach((pckg) => loadedPackages.add(pckg));
                    delete pyodide.monitorRunDependencies;
                    const packageList = Array.from(toLoad.keys()).join(', ');
                    console.log(`Loaded ${packageList}`);
                    resolve(`Loaded ${packageList}`);
                }
            };

            toLoad.forEach((pckg) => {
                let necessaryTypes = [`${pckg}.js`, `${pckg}.data`];
                // async for loop
                for(let i = 0; i < necessaryTypes.length; i++) {
                    (async function(fileType, idx) {
                        let p = path.join(pyodidePackagesURL, `/${fileType}`);
                        let pckgURL = path.join(pyodidePackagesURL, `/${pckg}.js`);
                        if(!fs.existsSync(p)){
                            // fetch
                            let file = await fetch(`${packagesURL}${fileType}`);
                            let buffer = await file.buffer();
                            if(!buffer) reject();
                            fs.writeFileSync(p, buffer);
                        } else {
                            // load dependencies
                            require(pckgURL);
                        }
                        if(idx == necessaryTypes.length - 1) {
                            console.warn(`Warning: Finished loading all ${toLoad.length} modules`);
                            // load dependencies
                            require(pckgURL);
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
    }
    _fetch_node(file) {
        return new Promise((resolve, reject) => 
        fs.readFile(file, (err, data) => err ? reject(err) : resolve({ arrayBuffer: () => data })));
    }
}
module.exports = new PyodideNode();