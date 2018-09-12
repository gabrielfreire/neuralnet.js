const fs = require('fs');
const pyodideNode = require('./PyodideNode/PyodideNode');
async function init() {
    try {
        await pyodideNode.loadLanguage();
        const pyodide = pyodideNode.getModule();

        await pyodide.loadPackage('numpy');

        pyodide.runPython('import numpy as np'); 
        pyodide.runPython(
            'def test():\n'+
            '   a = np.array([1, 2, 3])\n' +
            '   b = np.arange(0, 100, 5)\n' +
            '   c = np.concatenate([b, a])\n' +
            '   print(a)\n' +
            '   print(b)\n' +
            '   return c.tolist()');
        const test = pyodide.pyimport('test');
        const concatenated = test();
        console.log(concatenated);
    } catch (e) {
        console.log(`ERROR: ${e}`);
    };
}

// beautify minified js files
function beaut() {
    var beautify = require('js-beautify').js;
    fs.readFile(__dirname + '/PyodideNode/packages/numpy2.js', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        fs.writeFileSync(__dirname + '/PyodideNode/packages/numpy3.js', beautify(data, { indent_size: 2, space_in_empty_paren: true }));
    });
}
init();
// beaut();