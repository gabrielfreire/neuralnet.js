const fs = require('fs');
const pyodideNode = require('./PyodideNode.js');
async function init() {
    await pyodideNode.loadLanguage();
    let pyodide = pyodideNode.getModule();
    pyodide.runPython('pa = 123 + 3231');
    pyodide.runPython('print(pa)');
    pyodide.loadPackage('numpy').then((packagePath) => {
        pyodide.runPython('import numpy as np'); 
        console.log('numpy loaded');
        pyodide.runPython('a = np.array([1, 2, 3])');
        pyodide.runPython('b = np.arange(0, 100, 5)');
        pyodide.runPython('print(a)');
        pyodide.runPython('print(b)');
    });
    console.log('Python loaded');
}

init();

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
// beaut();