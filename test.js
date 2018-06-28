const path = require('path');
const fs = require('fs');
const wa = require('webassembly');
const pyodidejs = require('./src/wasm/pyodide.asm.js');
const wasmPath = path.join(__dirname, '/src/wasm/pyodide.asm.wasm');
const baseURL = path.join(__dirname, '/');
const dataURL = path.join(__dirname, './pyodide.asm.data');
let pyodide;
let deps = 0;
const fetch = require('isomorphic-fetch');
let libs = []
let methodsOverride = (Module) => {
    return {
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
            let fullname = name ? path.resolve(path.join(__dirname, `${parent}/${name}`)) : path.join(__dirname, parent);
            var dep = Module['getUniqueRunDependency']("cp " + fullname);
            libs.push(fullname);
            function processData(byteArray) {
                function finish(byteArray) {
                    if (preFinish) preFinish();
                    if (!dontCreateFile) {
                        try{
                            fs.writeFileSync(fullname, byteArray);
                        }catch(e) {
                            console.log(e);
                        }
                    }
                    if (onload) onload();
                    Module['removeRunDependency'](dep)
                }
                var handled = false;
                if (!handled) finish(byteArray)
            }
            
            if (typeof url == "string") {
                // Browser.asyncLoad(url, (function(byteArray) {
                //     processData(byteArray)
                // }), onerror)
            } else {
                processData(url)
            }
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

function loadLanguage() {
    return new Promise((resolve, reject) => {
        let Module = {};
        fetch_node(wasmPath).then((buffer) => buffer.arrayBuffer()).then((arrayBuffer) => {
            let wasm_promise = WebAssembly.compile(arrayBuffer);
            Module.instantiateWasm = (info, receiveInstance) => {
                wasm_promise
                .then(module => WebAssembly.instantiate(module, info))
                .then(instance => {
                    console.log('1');
                    
                    Module['getUniqueRunDependency'] = methodsOverride(Module)['getUniqueRunDependency'];
                    Module['addRunDependency'] = methodsOverride(Module)['addRunDependency'];
                    Module['removeRunDependency'] = methodsOverride(Module)['removeRunDependency'];
                    Module['FS_createPath'] = methodsOverride(Module)['FS_createPath'];
                    Module['FS_createPreloadedFile'] = methodsOverride(Module)['FS_createPreloadedFile'];
                    process['Module'] = Module;
                    const pyodidedatajs = require('./pyodide.asm.data.js');
                    console.log(pyodidedatajs);
                    return receiveInstance(instance)
                });
                return {};
            };
            Module.filePackagePrefixURL = baseURL;
            Module.postRun = () => {
                Module = null;
                console.log('will resolve'); // never gets here
                resolve();
            };
            // Module.calledRun = true;
            
            pyodide = pyodidejs(Module);


            // pyodidejs();
            // fetch_node(dataURL).then((buffer) => buffer.arrayBuffer()).then((arrayBuffer) => {
            //     // console.log(arrayBuffer);
            // })
        })
    });
}

async function init() {
    await loadLanguage();
    console.log(pyodide.runPython);
    console.log('Python loaded');
}

function fetch_node(file) {
    return new Promise((resolve, reject) => 
    fs.readFile(file, (err, data) => err ? reject(err) : resolve({ arrayBuffer: () => data })));
}
init();