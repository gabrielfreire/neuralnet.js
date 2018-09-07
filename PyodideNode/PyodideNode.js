const path = require('path');
const fs = require('fs');
const externalPackagesURL = 'https://iodide.io/pyodide-demo/';
let pyodideModuleInitializer = require('./pyodide.asm.js'); // TODO: use the remote asm.js below when it's fixed
const externalPyodideModuleInitializer = `${externalPackagesURL}pyodide.asm.js`;
const externalPyodideWasmURL = `${externalPackagesURL}pyodide.asm.wasm`;;
const pyodidePackagesURL = path.join(__dirname, '/packages');
const fetch = require('isomorphic-fetch');
let pyodide = null;
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

    getModule() {
        if(!pyodide) throw "Pyodide wasn't loaded yet"
        return pyodide;
    }
    
    loadLanguage() {
        let self = this;
        return new Promise((resolve, reject) => {
            let Module = {};
            pyodide = {};
            self._fetch_node(externalPyodideWasmURL).then((buffer) => buffer.buffer()).then(async (arrayBuffer) => {
                Module.instantiateWasm = (info, receiveInstance) => {
                    WebAssembly.compile(arrayBuffer).then(module => {
                        // add Module to the process
                        process['Module'] = Module;
                        // load pyodide.asm.data.js (python standard libraries)
                        require('./pyodide.asm.data.js');
                        return WebAssembly.instantiate(module, info)
                    })
                    .then(instance => receiveInstance(instance))
                    .catch((err) => console.log(`ERROR: ${err}`));
                    return {};
                };
                Module.filePackagePrefixURL = externalPackagesURL;
                Module.locateFile = (path) => externalPackagesURL + path;
                Module.postRun = () => {
                    // remove module from the process
                    Module = null;
                    process['Module'] = null;
                    // setup pyodide and add to the process
                    pyodide.filePackagePrefixURL = externalPackagesURL
                    pyodide.loadPackage = self._loadPackage;
                    process['pyodide'] = pyodide;
                    console.log('Loaded Python');
                    resolve();
                };
                // get module from remote location 
                // TODO: uncomment this when the remote one is fixed
                
                // let fileDest = path.join(__dirname, '/pyodide2.asm.js');
                // const moduleBuffer = await self._fetch_node(externalPyodideModuleInitializer);
                // const buffer = await moduleBuffer.buffer();
                // if(!buffer) reject('There is no buffer');
                // fs.writeFileSync(fileDest, buffer);
                // pyodideModuleInitializer = require('./pyodide2.asm.js');
                
                // load module
                pyodide = pyodideModuleInitializer(Module);

                // delete module file
                // fs.unlinkSync(fileDest);
            }).catch((e) => {
                reject(e);
            });
        });
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
            toLoad.forEach(async (pckg) => {                   
                const pckgLocalURL = path.join(pyodidePackagesURL, `/${pckg}.js`);
                const pckgExternalURL = `${externalPackagesURL}${pckg}.js`;
                if(!fs.existsSync(pckgLocalURL)){
                    // fetch
                    const file = await fetch(pckgExternalURL);
                    if(!file) reject(`ERROR 404, package ${pckg} was not found`);
                    const buffer = await file.buffer();
                    if(!buffer) reject();
                    fs.writeFileSync(pckgLocalURL, buffer);
                }
                // load dependency
                try {
                    require(pckgLocalURL);
                } catch (e) {
                    reject (`${pckg}.js file does not support NodeJS, please write the support by hand`);
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
        return new Promise((resolve, reject) => {
            if(file.indexOf('http') == -1) {
                fs.readFile(file, (err, data) => err ? reject(err) : resolve({ buffer: () => data }));
            } else {
                fetch(file).then((buff) => resolve({ buffer: () => buff.buffer()}));
            }
        });
    }
}
module.exports = new PyodideNode();