const path = require('path');
const fs = require('fs');
const fetch  = require('isomorphic-fetch');
const externalPackagesURL = 'https://iodide.io/pyodide-demo/';
const externalPyodideModuleInitializer = `${externalPackagesURL}pyodide.asm.js`;
const externalPyodideWasmURL = `${externalPackagesURL}pyodide.asm.wasm`;
const pyodidePackagesURL = path.join(__dirname, '/packages');
const packages = {
    'dateutil': [],
    'matplotlib': ['numpy', 'dateutil', 'pytz'],
    'numpy': [],
    'pandas': ['numpy', 'dateutil', 'pytz'],
    'pytz': [],
};
const loadedPackages = new Set();
function PyodideNode () {
    this.env = 'node';
    this._setEnvironment();
}

PyodideNode.prototype._setEnvironment = function() {
    if (typeof process !== 'undefined') {
        this.env = 'node';
    } else if (typeof window !== 'undefined') {
        this.env = 'browser';
    } else {
        this.env = 'none';
    }
}
PyodideNode.prototype.getModule = function() {
    if(!process.pyodide) throw "Pyodide wasn't loaded yet"
    return process.pyodide;
}

PyodideNode.prototype.loadLanguage = function() {
    return new Promise((resolve, reject) => {
        let self = this;
        let Module = {};
        let pyodide = {};
        self._fetch_node(externalPyodideWasmURL).then(function (buffer) { return buffer.buffer(); }).then(async (arrayBuffer) => {
            Module['noImageDecoding'] = true;
            Module['noAudioDecoding'] = true;
            Module['noWasmDecoding'] = true;
            Module['filePackagePrefixURL'] = externalPackagesURL;
            Module['locateFile'] = (path) => externalPackagesURL + path;
            Module['instantiateWasm'] = (info, receiveInstance) => {
                WebAssembly.compile(arrayBuffer).then(async module => {
                    // add Module to the process
                    process['Module'] = Module;
                    // load pyodide.asm.data.js (python standard libraries)
                    let pckgUrl = await self._fetch_node(path.join(__dirname, '/pyodide.asm.data.js'));
                    eval(pckgUrl && pckgUrl.buffer() ? pckgUrl.buffer().toString() : '');
                    return WebAssembly.instantiate(module, info)
                })
                .then(instance => receiveInstance(instance))
                .catch((err) => console.log(`ERROR: ${err}`));
                return {};
            };
            Module['postRun'] = () => {
                // remove module from the process
                Module = null;
                // setup pyodide and add to the process
                pyodide['filePackagePrefixURL'] = externalPackagesURL
                pyodide['loadPackage'] = self._loadPackage;
                pyodide['locateFile'] = (path) => externalPackagesURL + path;
                process['Module'] = null;
                process['pyodide'] = pyodide;
                console.log('Loaded Python');
                resolve();
            };
            // get module from remote location
            const fetchedFile = await self._fetch_node(externalPyodideModuleInitializer);
            const buffer = await fetchedFile.buffer();
            if(!buffer) reject('There is no buffer');
            // eval module code
            let pyodideModuleInitializer = eval(buffer.toString());
            // load module
            pyodide = pyodideModuleInitializer(Module);
        }).catch((e) => {
            reject(e);
        });
    });
}

PyodideNode.prototype._loadPackage = function(names) {
    // DFS to find all dependencies of the requested packages
    let queue = [].concat(names || []);
    let toLoad = new Set();
    let self = this;
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

        process.pyodide['monitorRunDependencies'] = (n) => {
            if (n === 0) {
                toLoad.forEach((pckg) => loadedPackages.add(pckg));
                delete process.pyodide.monitorRunDependencies;
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
                const file = await self._fetch_node(pckgExternalURL);
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
        process.pyodide.runPython(
            'import importlib as _importlib\n' +
                '_importlib.invalidate_caches()\n');
    });
}

PyodideNode.prototype._fetch_node = function(file) {
    return new Promise((resolve, reject) => {
        if(file.indexOf('http') == -1) {
            fs.readFile(file, (err, data) => err ? reject(err) : resolve({ buffer: () => data }));
        } else {
            fetch(file).then((buff) => resolve({ buffer: () => buff.buffer()}));
        }
    });
}

module.exports = new PyodideNode();