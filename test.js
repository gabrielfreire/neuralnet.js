const fs = require('fs');
const pyodideNode = require('./PyodideNode/PyodideNode');
async function init() {
    try {
        await pyodideNode.loadLanguage();
        console.log('Python loaded');

        const pyodide = pyodideNode.getModule();

        pyodide.runPython('pa = 123 + 3231');
        pyodide.runPython('print(pa)');
        await pyodide.loadPackage('numpy')
        console.log('numpy loaded');
        pyodide.runPython('import numpy as np'); 
        pyodide.runPython(`def test():
        a = np.array([1, 2, 3])
        b = np.arange(0, 100, 5)
        print(a)
        print(b)`);
        const test = pyodide.pyimport('test');
        test();
    } catch (e) {
        console.log(`ERROR: ${e}`);
    };
}

init();

// beautify minified js files
function beaut() {
    var beautify = require('js-beautify').js;
    fs.readFile('pyodide.asm.data2.js', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        fs.writeFileSync('pyodide.asm.data3.js', beautify(data, { indent_size: 2, space_in_empty_paren: true }));
    });
}
// beaut();