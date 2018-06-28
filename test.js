const path = require('path');
const fs = require('fs');
const wa = require('webassembly');
const wasmJs = require('./src/wasm/pyodide.asm.js');
const wasmPath = path.join(__dirname, '/src/wasm/pyodide.asm.wasm');
const memory = new WebAssembly.Memory({initial:8192, maximum:8192});
const table = new WebAssembly.Table({ initial: 16384, element: "anyfunc" });
const importObj = {
    global: {
        NaN: NaN,
        Infinity: Infinity
    },
    env: {
        memory: memory, 
        table: table, 
        tableBase: 0, 
        memoryBase: 0,
        DYNAMICTOP_PTR: 2042576,
        tempDoublePtr: 2041040,
        STACKTOP: 2042592,
        STACK_MAX: 7285472,
        gb: 1024,
        fb: 0,
        abort: function(cb) {},
        enlargeMemory: function(){},
        getTotalMemory: function(){},
        abortOnCannotGrowMemory: function(){},
        setTempRet0: function(value) {}
    }
};
console.log(wasmJs.env)
// console.log(wasmJs);
// wa.load(wasmPath, {imports: importObj}).then((module) => {
//     console.log(module.exports);
// }).catch((err) => {
//     console.log(`some error: ${err}`);
// });

fetch_node(wasmPath)
    .then(result => result.arrayBuffer())
    .then(buffer => WebAssembly.instantiate(buffer, importObj))
    .then(module => {
        var instance = module.instance;
        instance.imports = imports;
        instance.memory = memory;
        instance.env = env;
        return instance;
    });
function fetch_node(file) {
    return new Promise((resolve, reject) => 
    fs.readFile(file, (err, data) => err ? reject(err) : resolve({ arrayBuffer: () => data })));
}