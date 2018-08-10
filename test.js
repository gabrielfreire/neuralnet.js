const fs = require('fs');
const pyodideNode = require('./PyodideNode/PyodideNode');
async function init() {
    try {
        await pyodideNode.loadLanguage();
        console.log('Python loaded');
        const pyodide = pyodideNode.getModule();

        await pyodide.loadPackage('numpy')
        console.log('numpy loaded');

        pyodide.runPython('import numpy as np'); 
        pyodide.runPython(
            'def test():\n'+
            '   a = np.array([1, 2, 3])\n' +
            '   b = np.arange(0, 100, 5)\n' +
            '   print(a)\n' +
            '   print(b)');
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
    fs.readFile(__dirname + '/PyodideNode/numpy2.js', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        fs.writeFileSync(__dirname + '/PyodideNode/numpy3.js', beautify(data, { indent_size: 2, space_in_empty_paren: true }));
    });
}
// beaut();