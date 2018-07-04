const path = require('path');
const fs = require('fs');
const wa = require('webassembly');
const pyodidejs = require('./pyodide.asm.js');
const wasmPath = path.join(__dirname, '/pyodide.asm.wasm');
const baseURL = path.join(__dirname, '/');
const libsPath = path.join(__dirname, '/');
const fetch = require('isomorphic-fetch');
let pyodide;
let deps = 0;
const packagesURL = 'https://iodide.io/pyodide-demo/';
const packages = {
    'dateutil': [],
    'matplotlib': ['numpy', 'dateutil', 'pytz'],
    'numpy': [],
    'pandas': ['numpy', 'dateutil', 'pytz'],
    'pytz': [],
};
let loadedPackages = new Set();
/**
 * Add support to NodeJS
 */
let methodsOverride = (Module) => {
    return {
        dynamicLibraries: [],
        getUniqueRunDependency:(id) => {
            return id
        },
        FS_createPath: (p, part, canWrite, canRead) => {
            let _p = path.join(__dirname, `${p}/${part}`);
            try{
                fs.mkdirSync(_p);
            }catch(e) {
                console.log(`error: ${e}`);
            }
        },
        FS_createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
            console.log("FS_createPreloadedFile()");
            let fullname = name ? path.resolve(path.join(__dirname, `${parent}/${name}`)) : path.join(__dirname, parent);
            var dep = Module['getUniqueRunDependency']("cp " + fullname);
            function processData(byteArray) {
                function finish(byteArray) {
                    if (preFinish) preFinish();
                    if (!dontCreateFile) {
                        try{
                            Module['dynamicLibraries'].push(fullname);
                            fs.writeFileSync(fullname, byteArray);
                        }catch(e) {
                            console.log(e);
                        }
                    }
                    if (onload) onload();
                    Module['removeRunDependency'](dep)
                }
                finish(byteArray)
            }
            processData(url)
            
        },
        addRunDependency: (name) => {
            deps++;
            if (Module["monitorRunDependencies"]) {
                Module["monitorRunDependencies"](name)
            }
        },
        removeRunDependency: (name) => {
            deps--;
            if (Module["monitorRunDependencies"]) {
                Module["monitorRunDependencies"](name)
            }
        }
    }
}

async function loadLanguage(willDownloadFiles) {
    return new Promise((resolve, reject) => {
        let Module = {};
        fetch_node(wasmPath).then((buffer) => buffer.arrayBuffer()).then((arrayBuffer) => {
            let wasm_promise = WebAssembly.compile(arrayBuffer);
            Module.instantiateWasm = (info, receiveInstance) => {
                wasm_promise
                .then(module => {
                    Module['dynamicLibraries'] = [];
                    if(willDownloadFiles) {
                        Module['getUniqueRunDependency'] = methodsOverride(Module)['getUniqueRunDependency'];
                        Module['addRunDependency'] = methodsOverride(Module)['addRunDependency'];
                        Module['removeRunDependency'] = methodsOverride(Module)['removeRunDependency'];
                        Module['FS_createPath'] = methodsOverride(Module)['FS_createPath'];
                        Module['FS_createPreloadedFile'] = methodsOverride(Module)['FS_createPreloadedFile'];
                        Module['calledRun'] = true;
                    }
                    process['Module'] = Module;
                    
                    // Load packages
                    require('./pyodide.asm.data.js');
                    return WebAssembly.instantiate(module, info)
                }).then(instance => {
                    return receiveInstance(instance)
                });
                return {};
            };
            Module.filePackagePrefixURL = baseURL;
            Module.postRun = () => {
                Module = null;
                resolve();
            };
            pyodide = pyodidejs(Module);
            pyodide.loadPackage = (names) => {
                if (Array.isArray(names)) {
                    names = [names];
                }
        
                // DFS to find all dependencies of the requested packages
                let queue = new Array(names);
                let toLoad = new Set();
                while (queue.length) {
                    const package = queue.pop();
                    if (!packages.hasOwnProperty(package)) {
                        throw `Unknown package '${package}'`;
                    }
                    if (!loadedPackages.has(package)) {
                        toLoad.add(package);
                        packages[package].forEach((subpackage) => {
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
                            toLoad.forEach((package) => loadedPackages.add(package));
                            delete pyodide.monitorRunDependencies;
                            const packageList = Array.from(toLoad.keys()).join(', ');
                            resolve(`Loaded ${packageList}`);
                        }
                    };
        
                    toLoad.forEach((package) => {
                        let necessaryTypes = [`${package}.js`, `${package}.data`];
                        for(let i = 0; i < necessaryTypes.length; i++) {
                            (async function(fileType, idx) {
                                let p = path.join(libsPath, `/${fileType}`);
                                if(fs.existsSync(p)){
                                    resolve({ path: path.join(libsPath, `/${package}.js`) });
                                }
                                if(!fs.existsSync(libsPath)) {
                                    fs.mkdirSync(libsPath);
                                }
                                let file = await fetch(`${packagesURL}${fileType}`);
                                let buffer = await file.buffer();
                                if(!buffer) reject();
                                fs.writeFileSync(p, buffer);
                                if(idx == necessaryTypes.length - 1) {
                                    console.log('will resolve');
                                    resolve({ path: path.join(libsPath, `/${package}.js`)});
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
            process['pyodide'] = pyodide;
        })
    });
}

async function init() {
    await loadLanguage(false);
    pyodide.runPython('pa = 123 + 3231');
    pyodide.runPython('print(pa)');
    pyodide.loadPackage('numpy').then((packagePath) => {
        if(packagePath.path) {
            require(packagePath.path);
            pyodide.runPython('import numpy as np'); 
            console.log('numpy loaded');
            pyodide.runPython('a = np.array([1, 2, 3])');
            pyodide.runPython('print(a)');
        }
    })
    console.log('Python loaded');
}

// beautify minified js files
function beaut() {
    var beautify = require('js-beautify').js;
    fs.readFile('lib/numpy.js', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        fs.writeFileSync('lib/numpy2.js', beautify(data, { indent_size: 2, space_in_empty_paren: true }));
    });
}

// fetch utility
function fetch_node(file) {
    return new Promise((resolve, reject) => 
    fs.readFile(file, (err, data) => err ? reject(err) : resolve({ arrayBuffer: () => data })));
}
init();
// beaut();