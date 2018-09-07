var Module = typeof Module !== "undefined" ? Module : typeof process.pyodide !== 'undefined' ? process.pyodide : {};
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0
}
Module.expectedDataFileDownloads++;
(function() {
  var loadPackage = function(metadata) {
    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      console.warn('Browser environment'); // BROWSER
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      console.warn('Web worker environment'); // WEB WORKER
    } else if (typeof process === "object" && typeof require === "function") {
      console.warn('Node environment'); // NODE
    } else {
      throw 'using preloaded data can only be done on a web page, web worker or in nodejs';
    }
    var PACKAGE_NAME = "/home/mdboom/Work/builds/compiling/pyodide/packages/numpy/build/numpy.data";
    var REMOTE_PACKAGE_BASE = "numpy.data";
    if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
      Module["locateFile"] = Module["locateFilePackage"];
      err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
    }
    var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;

    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      if (typeof XMLHttpRequest !== 'undefined') { // BROWSER
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
            var url = packageName;
            var size = packageSize;
            if (event.total) size = event.total;
            if (event.loaded) {
            if (!xhr.addedTotal) {
                xhr.addedTotal = true;
                if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
                Module.dataFileDownloads[url] = {
                  loaded: event.loaded,
                  total: size
                };
            } else {
                Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
                total += data.total;
                loaded += data.loaded;
                num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
            } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
            }
        };
        xhr.onerror = function(event) {
            throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
            if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
            } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
            }
        };
        xhr.send(null);
      } else {
        function fetch_node(file) { // <-- for local resources
          var fs = require('fs');
          return new Promise((resolve, reject) => 
          fs.readFile(file, (err, data) => err ? reject(err) : resolve({ buffer: () => data })));
        }
        var fetch = packageName.indexOf('http') > -1 ? require('isomorphic-fetch') : fetch_node; // NODE
        fetch(packageName).then((buffer) => buffer.buffer()).then((packageData) => {
          if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
          Module.dataFileDownloads[packageName] = {
              loaded: packageSize,
              total: packageSize
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
              var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads / num);
          console.log(`Downloaded ${packageName} data... (${total}/${total})`);
          callback(packageData);
          if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + total + "/" + total + ")");
        }).catch((err) => {
            console.error(`Something wrong happened ${err}`);
            throw new Error(`Something wrong happened ${err}`);
        });
      }
    }

    function handleError(error) {
      console.error("package error:", error)
    }
    var fetchedCallback = null;
    var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
    if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
      if (fetchedCallback) {
        fetchedCallback(data);
        fetchedCallback = null
      } else {
        fetched = data
      }
    }, handleError);

    function runWithFS() {
      function assert(check, msg) {
        if (!check) throw msg + (new Error).stack
      }
      Module["FS_createPath"]("/", "lib", true, true);
      Module["FS_createPath"]("/lib", "python3.6", true, true);
      Module["FS_createPath"]("/lib/python3.6", "site-packages", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages", "numpy", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "polynomial", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "ma", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "random", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "lib", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "compat", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "matrixlib", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "doc", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "f2py", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "fft", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "core", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "distutils", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy/distutils", "command", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy/distutils", "fcompiler", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "linalg", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy", "testing", true, true);
      Module["FS_createPath"]("/lib/python3.6/site-packages/numpy/testing", "nose_tools", true, true);

      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module["addRunDependency"]("fp " + this.name)
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray)
        },
        finish: function(byteArray) {
          var that = this;
          Module["FS_createPreloadedFile"](this.name, null, byteArray, true, true, function() {
            Module["removeRunDependency"]("fp " + that.name)
          }, function() {
            if (that.audio) {
              Module["removeRunDependency"]("fp " + that.name)
            } else {
              err("Preloading file " + that.name + " failed")
            }
          }, false, true);
          this.requests[this.name] = null
        }
      };
      var files = metadata.files;
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i].start, files[i].end, files[i].audio).open("GET", files[i].filename)
      }

      function processPackageData(arrayBuffer) {
        if(!arrayBuffer) throw "No input to processPackageData";
        Module.finishedDataFileDownloads++;
        assert(arrayBuffer, 'Loading data file failed.');
        assert((arrayBuffer instanceof ArrayBuffer || arrayBuffer.buffer instanceof ArrayBuffer), 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        if (Module["SPLIT_MEMORY"]) err("warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting");
        var ptr = Module["getMemory"](byteArray.length);
        Module["HEAPU8"].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module["HEAPU8"].subarray(ptr, ptr + byteArray.length);
        var files = metadata.files;
        for (var i = 0; i < files.length; ++i) {
          DataRequest.prototype.requests[files[i].filename].onload()
        }
        Module["removeRunDependency"]("datafile_/home/mdboom/Work/builds/compiling/pyodide/packages/numpy/build/numpy.data")
      }
      Module["addRunDependency"]("datafile_/home/mdboom/Work/builds/compiling/pyodide/packages/numpy/build/numpy.data");
      if (!Module.preloadResults) Module.preloadResults = {};
      Module.preloadResults[PACKAGE_NAME] = {
        fromCache: false
      };
      if (fetched) {
        processPackageData(fetched);
        fetched = null
      } else {
        fetchedCallback = processPackageData
      }
    }
    if (Module["calledRun"]) {
      runWithFS()
    } else {
      if (!Module["preRun"]) Module["preRun"] = [];
      Module["preRun"].push(runWithFS)
    }
  };
  loadPackage({
    files: [{
      start: 0,
      audio: 0,
      end: 14730,
      filename: "/lib/python3.6/site-packages/numpy/ctypeslib.py"
    }, {
      start: 14730,
      audio: 0,
      end: 16287,
      filename: "/lib/python3.6/site-packages/numpy/conftest.py"
    }, {
      start: 16287,
      audio: 0,
      end: 17587,
      filename: "/lib/python3.6/site-packages/numpy/__config__.py"
    }, {
      start: 17587,
      audio: 0,
      end: 17918,
      filename: "/lib/python3.6/site-packages/numpy/_distributor_init.py"
    }, {
      start: 17918,
      audio: 0,
      end: 31152,
      filename: "/lib/python3.6/site-packages/numpy/_import_tools.py"
    }, {
      start: 31152,
      audio: 0,
      end: 265899,
      filename: "/lib/python3.6/site-packages/numpy/add_newdocs.py"
    }, {
      start: 265899,
      audio: 0,
      end: 275708,
      filename: "/lib/python3.6/site-packages/numpy/matlib.py"
    }, {
      start: 275708,
      audio: 0,
      end: 276002,
      filename: "/lib/python3.6/site-packages/numpy/version.py"
    }, {
      start: 276002,
      audio: 0,
      end: 276922,
      filename: "/lib/python3.6/site-packages/numpy/setup.py"
    }, {
      start: 276922,
      audio: 0,
      end: 278781,
      filename: "/lib/python3.6/site-packages/numpy/_globals.py"
    }, {
      start: 278781,
      audio: 0,
      end: 285032,
      filename: "/lib/python3.6/site-packages/numpy/__init__.py"
    }, {
      start: 285032,
      audio: 0,
      end: 286896,
      filename: "/lib/python3.6/site-packages/numpy/dual.py"
    }, {
      start: 286896,
      audio: 0,
      end: 344300,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/legendre.py"
    }, {
      start: 344300,
      audio: 0,
      end: 411269,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/chebyshev.py"
    }, {
      start: 411269,
      audio: 0,
      end: 441361,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/_polybase.py"
    }, {
      start: 441361,
      audio: 0,
      end: 452890,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/polyutils.py"
    }, {
      start: 452890,
      audio: 0,
      end: 510976,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/hermite_e.py"
    }, {
      start: 510976,
      audio: 0,
      end: 568872,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/hermite.py"
    }, {
      start: 568872,
      audio: 0,
      end: 625181,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/laguerre.py"
    }, {
      start: 625181,
      audio: 0,
      end: 625566,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/setup.py"
    }, {
      start: 625566,
      audio: 0,
      end: 678374,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/polynomial.py"
    }, {
      start: 678374,
      audio: 0,
      end: 679514,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/__init__.py"
    }, {
      start: 679514,
      audio: 0,
      end: 735477,
      filename: "/lib/python3.6/site-packages/numpy/ma/extras.py"
    }, {
      start: 735477,
      audio: 0,
      end: 762912,
      filename: "/lib/python3.6/site-packages/numpy/ma/mrecords.py"
    }, {
      start: 762912,
      audio: 0,
      end: 1018755,
      filename: "/lib/python3.6/site-packages/numpy/ma/core.py"
    }, {
      start: 1018755,
      audio: 0,
      end: 1029139,
      filename: "/lib/python3.6/site-packages/numpy/ma/testutils.py"
    }, {
      start: 1029139,
      audio: 0,
      end: 1029519,
      filename: "/lib/python3.6/site-packages/numpy/ma/version.py"
    }, {
      start: 1029519,
      audio: 0,
      end: 1029948,
      filename: "/lib/python3.6/site-packages/numpy/ma/setup.py"
    }, {
      start: 1029948,
      audio: 0,
      end: 1045534,
      filename: "/lib/python3.6/site-packages/numpy/ma/timer_comparison.py"
    }, {
      start: 1045534,
      audio: 0,
      end: 1050451,
      filename: "/lib/python3.6/site-packages/numpy/ma/bench.py"
    }, {
      start: 1050451,
      audio: 0,
      end: 1051927,
      filename: "/lib/python3.6/site-packages/numpy/ma/__init__.py"
    }, {
      start: 1051927,
      audio: 0,
      end: 2261251,
      filename: "/lib/python3.6/site-packages/numpy/random/mtrand.so"
    }, {
      start: 2261251,
      audio: 0,
      end: 2263563,
      filename: "/lib/python3.6/site-packages/numpy/random/setup.py"
    }, {
      start: 2263563,
      audio: 0,
      end: 2269044,
      filename: "/lib/python3.6/site-packages/numpy/random/__init__.py"
    }, {
      start: 2269044,
      audio: 0,
      end: 2274243,
      filename: "/lib/python3.6/site-packages/numpy/random/info.py"
    }, {
      start: 2274243,
      audio: 0,
      end: 2294810,
      filename: "/lib/python3.6/site-packages/numpy/lib/arraysetops.py"
    }, {
      start: 2294810,
      audio: 0,
      end: 2299677,
      filename: "/lib/python3.6/site-packages/numpy/lib/_version.py"
    }, {
      start: 2299677,
      audio: 0,
      end: 2469709,
      filename: "/lib/python3.6/site-packages/numpy/lib/function_base.py"
    }, {
      start: 2469709,
      audio: 0,
      end: 2477526,
      filename: "/lib/python3.6/site-packages/numpy/lib/user_array.py"
    }, {
      start: 2477526,
      audio: 0,
      end: 2502021,
      filename: "/lib/python3.6/site-packages/numpy/lib/financial.py"
    }, {
      start: 2502021,
      audio: 0,
      end: 2530689,
      filename: "/lib/python3.6/site-packages/numpy/lib/shape_base.py"
    }, {
      start: 2530689,
      audio: 0,
      end: 2582546,
      filename: "/lib/python3.6/site-packages/numpy/lib/arraypad.py"
    }, {
      start: 2582546,
      audio: 0,
      end: 2599046,
      filename: "/lib/python3.6/site-packages/numpy/lib/type_check.py"
    }, {
      start: 2599046,
      audio: 0,
      end: 2628202,
      filename: "/lib/python3.6/site-packages/numpy/lib/format.py"
    }, {
      start: 2628202,
      audio: 0,
      end: 2635486,
      filename: "/lib/python3.6/site-packages/numpy/lib/mixins.py"
    }, {
      start: 2635486,
      audio: 0,
      end: 2718658,
      filename: "/lib/python3.6/site-packages/numpy/lib/npyio.py"
    }, {
      start: 2718658,
      audio: 0,
      end: 2745338,
      filename: "/lib/python3.6/site-packages/numpy/lib/index_tricks.py"
    }, {
      start: 2745338,
      audio: 0,
      end: 2752529,
      filename: "/lib/python3.6/site-packages/numpy/lib/arrayterator.py"
    }, {
      start: 2752529,
      audio: 0,
      end: 2792203,
      filename: "/lib/python3.6/site-packages/numpy/lib/recfunctions.py"
    }, {
      start: 2792203,
      audio: 0,
      end: 2828543,
      filename: "/lib/python3.6/site-packages/numpy/lib/utils.py"
    }, {
      start: 2828543,
      audio: 0,
      end: 2828922,
      filename: "/lib/python3.6/site-packages/numpy/lib/setup.py"
    }, {
      start: 2828922,
      audio: 0,
      end: 2879776,
      filename: "/lib/python3.6/site-packages/numpy/lib/nanfunctions.py"
    }, {
      start: 2879776,
      audio: 0,
      end: 2888561,
      filename: "/lib/python3.6/site-packages/numpy/lib/stride_tricks.py"
    }, {
      start: 2888561,
      audio: 0,
      end: 2894275,
      filename: "/lib/python3.6/site-packages/numpy/lib/ufunclike.py"
    }, {
      start: 2894275,
      audio: 0,
      end: 2908360,
      filename: "/lib/python3.6/site-packages/numpy/lib/scimath.py"
    }, {
      start: 2908360,
      audio: 0,
      end: 2933671,
      filename: "/lib/python3.6/site-packages/numpy/lib/_datasource.py"
    }, {
      start: 2933671,
      audio: 0,
      end: 2972243,
      filename: "/lib/python3.6/site-packages/numpy/lib/polynomial.py"
    }, {
      start: 2972243,
      audio: 0,
      end: 2973544,
      filename: "/lib/python3.6/site-packages/numpy/lib/__init__.py"
    }, {
      start: 2973544,
      audio: 0,
      end: 2999361,
      filename: "/lib/python3.6/site-packages/numpy/lib/twodim_base.py"
    }, {
      start: 2999361,
      audio: 0,
      end: 3031977,
      filename: "/lib/python3.6/site-packages/numpy/lib/_iotools.py"
    }, {
      start: 3031977,
      audio: 0,
      end: 3038593,
      filename: "/lib/python3.6/site-packages/numpy/lib/info.py"
    }, {
      start: 3038593,
      audio: 0,
      end: 3046147,
      filename: "/lib/python3.6/site-packages/numpy/compat/_inspect.py"
    }, {
      start: 3046147,
      audio: 0,
      end: 3046518,
      filename: "/lib/python3.6/site-packages/numpy/compat/setup.py"
    }, {
      start: 3046518,
      audio: 0,
      end: 3050155,
      filename: "/lib/python3.6/site-packages/numpy/compat/py3k.py"
    }, {
      start: 3050155,
      audio: 0,
      end: 3050653,
      filename: "/lib/python3.6/site-packages/numpy/compat/__init__.py"
    }, {
      start: 3050653,
      audio: 0,
      end: 3083626,
      filename: "/lib/python3.6/site-packages/numpy/matrixlib/defmatrix.py"
    }, {
      start: 3083626,
      audio: 0,
      end: 3084074,
      filename: "/lib/python3.6/site-packages/numpy/matrixlib/setup.py"
    }, {
      start: 3084074,
      audio: 0,
      end: 3084364,
      filename: "/lib/python3.6/site-packages/numpy/matrixlib/__init__.py"
    }, {
      start: 3084364,
      audio: 0,
      end: 3092282,
      filename: "/lib/python3.6/site-packages/numpy/doc/basics.py"
    }, {
      start: 3092282,
      audio: 0,
      end: 3104653,
      filename: "/lib/python3.6/site-packages/numpy/doc/glossary.py"
    }, {
      start: 3104653,
      audio: 0,
      end: 3110154,
      filename: "/lib/python3.6/site-packages/numpy/doc/creation.py"
    }, {
      start: 3110154,
      audio: 0,
      end: 3115719,
      filename: "/lib/python3.6/site-packages/numpy/doc/broadcasting.py"
    }, {
      start: 3115719,
      audio: 0,
      end: 3121065,
      filename: "/lib/python3.6/site-packages/numpy/doc/byteswapping.py"
    }, {
      start: 3121065,
      audio: 0,
      end: 3136734,
      filename: "/lib/python3.6/site-packages/numpy/doc/indexing.py"
    }, {
      start: 3136734,
      audio: 0,
      end: 3142928,
      filename: "/lib/python3.6/site-packages/numpy/doc/misc.py"
    }, {
      start: 3142928,
      audio: 0,
      end: 3148355,
      filename: "/lib/python3.6/site-packages/numpy/doc/ufuncs.py"
    }, {
      start: 3148355,
      audio: 0,
      end: 3176915,
      filename: "/lib/python3.6/site-packages/numpy/doc/subclassing.py"
    }, {
      start: 3176915,
      audio: 0,
      end: 3201358,
      filename: "/lib/python3.6/site-packages/numpy/doc/structured_arrays.py"
    }, {
      start: 3201358,
      audio: 0,
      end: 3210240,
      filename: "/lib/python3.6/site-packages/numpy/doc/constants.py"
    }, {
      start: 3210240,
      audio: 0,
      end: 3219909,
      filename: "/lib/python3.6/site-packages/numpy/doc/internals.py"
    }, {
      start: 3219909,
      audio: 0,
      end: 3220483,
      filename: "/lib/python3.6/site-packages/numpy/doc/__init__.py"
    }, {
      start: 3220483,
      audio: 0,
      end: 3229707,
      filename: "/lib/python3.6/site-packages/numpy/f2py/func2subr.py"
    }, {
      start: 3229707,
      audio: 0,
      end: 3234737,
      filename: "/lib/python3.6/site-packages/numpy/f2py/common_rules.py"
    }, {
      start: 3234737,
      audio: 0,
      end: 3293262,
      filename: "/lib/python3.6/site-packages/numpy/f2py/rules.py"
    }, {
      start: 3293262,
      audio: 0,
      end: 3294785,
      filename: "/lib/python3.6/site-packages/numpy/f2py/f2py_testing.py"
    }, {
      start: 3294785,
      audio: 0,
      end: 3300080,
      filename: "/lib/python3.6/site-packages/numpy/f2py/diagnose.py"
    }, {
      start: 3300080,
      audio: 0,
      end: 3345193,
      filename: "/lib/python3.6/site-packages/numpy/f2py/cfuncs.py"
    }, {
      start: 3345193,
      audio: 0,
      end: 3367019,
      filename: "/lib/python3.6/site-packages/numpy/f2py/auxfuncs.py"
    }, {
      start: 3367019,
      audio: 0,
      end: 3370671,
      filename: "/lib/python3.6/site-packages/numpy/f2py/use_rules.py"
    }, {
      start: 3370671,
      audio: 0,
      end: 3499075,
      filename: "/lib/python3.6/site-packages/numpy/f2py/crackfortran.py"
    }, {
      start: 3499075,
      audio: 0,
      end: 3521431,
      filename: "/lib/python3.6/site-packages/numpy/f2py/cb_rules.py"
    }, {
      start: 3521431,
      audio: 0,
      end: 3521685,
      filename: "/lib/python3.6/site-packages/numpy/f2py/__version__.py"
    }, {
      start: 3521685,
      audio: 0,
      end: 3525610,
      filename: "/lib/python3.6/site-packages/numpy/f2py/setup.py"
    }, {
      start: 3525610,
      audio: 0,
      end: 3535460,
      filename: "/lib/python3.6/site-packages/numpy/f2py/f90mod_rules.py"
    }, {
      start: 3535460,
      audio: 0,
      end: 3566999,
      filename: "/lib/python3.6/site-packages/numpy/f2py/capi_maps.py"
    }, {
      start: 3566999,
      audio: 0,
      end: 3569026,
      filename: "/lib/python3.6/site-packages/numpy/f2py/__init__.py"
    }, {
      start: 3569026,
      audio: 0,
      end: 3591934,
      filename: "/lib/python3.6/site-packages/numpy/f2py/f2py2e.py"
    }, {
      start: 3591934,
      audio: 0,
      end: 3592673,
      filename: "/lib/python3.6/site-packages/numpy/f2py/__main__.py"
    }, {
      start: 3592673,
      audio: 0,
      end: 3592809,
      filename: "/lib/python3.6/site-packages/numpy/f2py/info.py"
    }, {
      start: 3592809,
      audio: 0,
      end: 3630576,
      filename: "/lib/python3.6/site-packages/numpy/fft/fftpack_lite.so"
    }, {
      start: 3630576,
      audio: 0,
      end: 3640168,
      filename: "/lib/python3.6/site-packages/numpy/fft/helper.py"
    }, {
      start: 3640168,
      audio: 0,
      end: 3640718,
      filename: "/lib/python3.6/site-packages/numpy/fft/setup.py"
    }, {
      start: 3640718,
      audio: 0,
      end: 3686777,
      filename: "/lib/python3.6/site-packages/numpy/fft/fftpack.py"
    }, {
      start: 3686777,
      audio: 0,
      end: 3687035,
      filename: "/lib/python3.6/site-packages/numpy/fft/__init__.py"
    }, {
      start: 3687035,
      audio: 0,
      end: 3694270,
      filename: "/lib/python3.6/site-packages/numpy/fft/info.py"
    }, {
      start: 3694270,
      audio: 0,
      end: 3724363,
      filename: "/lib/python3.6/site-packages/numpy/core/records.py"
    }, {
      start: 3724363,
      audio: 0,
      end: 5546454,
      filename: "/lib/python3.6/site-packages/numpy/core/multiarray.so"
    }, {
      start: 5546454,
      audio: 0,
      end: 5557886,
      filename: "/lib/python3.6/site-packages/numpy/core/memmap.py"
    }, {
      start: 5557886,
      audio: 0,
      end: 5570226,
      filename: "/lib/python3.6/site-packages/numpy/core/function_base.py"
    }, {
      start: 5570226,
      audio: 0,
      end: 5655957,
      filename: "/lib/python3.6/site-packages/numpy/core/numeric.py"
    }, {
      start: 5655957,
      audio: 0,
      end: 5674379,
      filename: "/lib/python3.6/site-packages/numpy/core/getlimits.py"
    }, {
      start: 5674379,
      audio: 0,
      end: 5787912,
      filename: "/lib/python3.6/site-packages/numpy/core/multiarray_tests.so"
    }, {
      start: 5787912,
      audio: 0,
      end: 5809728,
      filename: "/lib/python3.6/site-packages/numpy/core/_internal.py"
    }, {
      start: 5809728,
      audio: 0,
      end: 5828544,
      filename: "/lib/python3.6/site-packages/numpy/core/shape_base.py"
    }, {
      start: 5828544,
      audio: 0,
      end: 5929181,
      filename: "/lib/python3.6/site-packages/numpy/core/fromnumeric.py"
    }, {
      start: 5929181,
      audio: 0,
      end: 5996550,
      filename: "/lib/python3.6/site-packages/numpy/core/defchararray.py"
    }, {
      start: 5996550,
      audio: 0,
      end: 5996963,
      filename: "/lib/python3.6/site-packages/numpy/core/cversions.py"
    }, {
      start: 5996963,
      audio: 0,
      end: 6001351,
      filename: "/lib/python3.6/site-packages/numpy/core/struct_ufunc_test.so"
    }, {
      start: 6001351,
      audio: 0,
      end: 6006055,
      filename: "/lib/python3.6/site-packages/numpy/core/_methods.py"
    }, {
      start: 6006055,
      audio: 0,
      end: 6022008,
      filename: "/lib/python3.6/site-packages/numpy/core/setup_common.py"
    }, {
      start: 6022008,
      audio: 0,
      end: 6032797,
      filename: "/lib/python3.6/site-packages/numpy/core/machar.py"
    }, {
      start: 6032797,
      audio: 0,
      end: 6090062,
      filename: "/lib/python3.6/site-packages/numpy/core/arrayprint.py"
    }, {
      start: 6090062,
      audio: 0,
      end: 6090746,
      filename: "/lib/python3.6/site-packages/numpy/core/_dummy.so"
    }, {
      start: 6090746,
      audio: 0,
      end: 6119848,
      filename: "/lib/python3.6/site-packages/numpy/core/numerictypes.py"
    }, {
      start: 6119848,
      audio: 0,
      end: 6161325,
      filename: "/lib/python3.6/site-packages/numpy/core/setup.py"
    }, {
      start: 6161325,
      audio: 0,
      end: 6925939,
      filename: "/lib/python3.6/site-packages/numpy/core/umath.so"
    }, {
      start: 6925939,
      audio: 0,
      end: 6938171,
      filename: "/lib/python3.6/site-packages/numpy/core/umath_tests.so"
    }, {
      start: 6938171,
      audio: 0,
      end: 6945677,
      filename: "/lib/python3.6/site-packages/numpy/core/generate_numpy_api.py"
    }, {
      start: 6945677,
      audio: 0,
      end: 6949359,
      filename: "/lib/python3.6/site-packages/numpy/core/operand_flag_tests.so"
    }, {
      start: 6949359,
      audio: 0,
      end: 7006200,
      filename: "/lib/python3.6/site-packages/numpy/core/test_rational.so"
    }, {
      start: 7006200,
      audio: 0,
      end: 7046892,
      filename: "/lib/python3.6/site-packages/numpy/core/einsumfunc.py"
    }, {
      start: 7046892,
      audio: 0,
      end: 7049936,
      filename: "/lib/python3.6/site-packages/numpy/core/__init__.py"
    }, {
      start: 7049936,
      audio: 0,
      end: 7054628,
      filename: "/lib/python3.6/site-packages/numpy/core/info.py"
    }, {
      start: 7054628,
      audio: 0,
      end: 7056681,
      filename: "/lib/python3.6/site-packages/numpy/distutils/line_endings.py"
    }, {
      start: 7056681,
      audio: 0,
      end: 7146182,
      filename: "/lib/python3.6/site-packages/numpy/distutils/system_info.py"
    }, {
      start: 7146182,
      audio: 0,
      end: 7148173,
      filename: "/lib/python3.6/site-packages/numpy/distutils/msvccompiler.py"
    }, {
      start: 7148173,
      audio: 0,
      end: 7150519,
      filename: "/lib/python3.6/site-packages/numpy/distutils/environment.py"
    }, {
      start: 7150519,
      audio: 0,
      end: 7163762,
      filename: "/lib/python3.6/site-packages/numpy/distutils/npy_pkg_config.py"
    }, {
      start: 7163762,
      audio: 0,
      end: 7163980,
      filename: "/lib/python3.6/site-packages/numpy/distutils/compat.py"
    }, {
      start: 7163980,
      audio: 0,
      end: 7166947,
      filename: "/lib/python3.6/site-packages/numpy/distutils/extension.py"
    }, {
      start: 7166947,
      audio: 0,
      end: 7176656,
      filename: "/lib/python3.6/site-packages/numpy/distutils/conv_template.py"
    }, {
      start: 7176656,
      audio: 0,
      end: 7177356,
      filename: "/lib/python3.6/site-packages/numpy/distutils/numpy_distribution.py"
    }, {
      start: 7177356,
      audio: 0,
      end: 7180868,
      filename: "/lib/python3.6/site-packages/numpy/distutils/lib2def.py"
    }, {
      start: 7180868,
      audio: 0,
      end: 7185159,
      filename: "/lib/python3.6/site-packages/numpy/distutils/intelccompiler.py"
    }, {
      start: 7185159,
      audio: 0,
      end: 7187904,
      filename: "/lib/python3.6/site-packages/numpy/distutils/log.py"
    }, {
      start: 7187904,
      audio: 0,
      end: 7193060,
      filename: "/lib/python3.6/site-packages/numpy/distutils/unixccompiler.py"
    }, {
      start: 7193060,
      audio: 0,
      end: 7275339,
      filename: "/lib/python3.6/site-packages/numpy/distutils/misc_util.py"
    }, {
      start: 7275339,
      audio: 0,
      end: 7283522,
      filename: "/lib/python3.6/site-packages/numpy/distutils/core.py"
    }, {
      start: 7283522,
      audio: 0,
      end: 7291352,
      filename: "/lib/python3.6/site-packages/numpy/distutils/from_template.py"
    }, {
      start: 7291352,
      audio: 0,
      end: 7293610,
      filename: "/lib/python3.6/site-packages/numpy/distutils/msvc9compiler.py"
    }, {
      start: 7293610,
      audio: 0,
      end: 7294910,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__config__.py"
    }, {
      start: 7294910,
      audio: 0,
      end: 7295061,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__version__.py"
    }, {
      start: 7295061,
      audio: 0,
      end: 7295672,
      filename: "/lib/python3.6/site-packages/numpy/distutils/setup.py"
    }, {
      start: 7295672,
      audio: 0,
      end: 7318687,
      filename: "/lib/python3.6/site-packages/numpy/distutils/cpuinfo.py"
    }, {
      start: 7318687,
      audio: 0,
      end: 7347234,
      filename: "/lib/python3.6/site-packages/numpy/distutils/ccompiler.py"
    }, {
      start: 7347234,
      audio: 0,
      end: 7372435,
      filename: "/lib/python3.6/site-packages/numpy/distutils/mingw32ccompiler.py"
    }, {
      start: 7372435,
      audio: 0,
      end: 7381098,
      filename: "/lib/python3.6/site-packages/numpy/distutils/exec_command.py"
    }, {
      start: 7381098,
      audio: 0,
      end: 7382186,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__init__.py"
    }, {
      start: 7382186,
      audio: 0,
      end: 7382965,
      filename: "/lib/python3.6/site-packages/numpy/distutils/pathccompiler.py"
    }, {
      start: 7382965,
      audio: 0,
      end: 7383122,
      filename: "/lib/python3.6/site-packages/numpy/distutils/info.py"
    }, {
      start: 7383122,
      audio: 0,
      end: 7401132,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/config.py"
    }, {
      start: 7401132,
      audio: 0,
      end: 7402046,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_data.py"
    }, {
      start: 7402046,
      audio: 0,
      end: 7403256,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_py.py"
    }, {
      start: 7403256,
      audio: 0,
      end: 7404571,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_clib.py"
    }, {
      start: 7404571,
      audio: 0,
      end: 7408950,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/config_compiler.py"
    }, {
      start: 7408950,
      audio: 0,
      end: 7439896,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_src.py"
    }, {
      start: 7439896,
      audio: 0,
      end: 7441627,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_scripts.py"
    }, {
      start: 7441627,
      audio: 0,
      end: 7444754,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install.py"
    }, {
      start: 7444754,
      audio: 0,
      end: 7446802,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/autodist.py"
    }, {
      start: 7446802,
      audio: 0,
      end: 7447789,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/egg_info.py"
    }, {
      start: 7447789,
      audio: 0,
      end: 7449407,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build.py"
    }, {
      start: 7449407,
      audio: 0,
      end: 7462796,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_clib.py"
    }, {
      start: 7462796,
      audio: 0,
      end: 7488060,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_ext.py"
    }, {
      start: 7488060,
      audio: 0,
      end: 7488701,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/develop.py"
    }, {
      start: 7488701,
      audio: 0,
      end: 7489686,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_headers.py"
    }, {
      start: 7489686,
      audio: 0,
      end: 7490784,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/__init__.py"
    }, {
      start: 7490784,
      audio: 0,
      end: 7491559,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/bdist_rpm.py"
    }, {
      start: 7491559,
      audio: 0,
      end: 7492358,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/sdist.py"
    }, {
      start: 7492358,
      audio: 0,
      end: 7494138,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/mips.py"
    }, {
      start: 7494138,
      audio: 0,
      end: 7495265,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/pathf95.py"
    }, {
      start: 7495265,
      audio: 0,
      end: 7502038,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/intel.py"
    }, {
      start: 7502038,
      audio: 0,
      end: 7506251,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/pg.py"
    }, {
      start: 7506251,
      audio: 0,
      end: 7511818,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/absoft.py"
    }, {
      start: 7511818,
      audio: 0,
      end: 7512642,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/none.py"
    }, {
      start: 7512642,
      audio: 0,
      end: 7532405,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/gnu.py"
    }, {
      start: 7532405,
      audio: 0,
      end: 7534050,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/sun.py"
    }, {
      start: 7534050,
      audio: 0,
      end: 7535469,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/hpux.py"
    }, {
      start: 7535469,
      audio: 0,
      end: 7538904,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/ibm.py"
    }, {
      start: 7538904,
      audio: 0,
      end: 7540300,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/g95.py"
    }, {
      start: 7540300,
      audio: 0,
      end: 7542908,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/nag.py"
    }, {
      start: 7542908,
      audio: 0,
      end: 7547017,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/compaq.py"
    }, {
      start: 7547017,
      audio: 0,
      end: 7548410,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/lahey.py"
    }, {
      start: 7548410,
      audio: 0,
      end: 7550143,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/vast.py"
    }, {
      start: 7550143,
      audio: 0,
      end: 7589490,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/__init__.py"
    }, {
      start: 7589490,
      audio: 0,
      end: 7669927,
      filename: "/lib/python3.6/site-packages/numpy/linalg/linalg.py"
    }, {
      start: 7669927,
      audio: 0,
      end: 7671805,
      filename: "/lib/python3.6/site-packages/numpy/linalg/setup.py"
    }, {
      start: 7671805,
      audio: 0,
      end: 9134428,
      filename: "/lib/python3.6/site-packages/numpy/linalg/_umath_linalg.so"
    }, {
      start: 9134428,
      audio: 0,
      end: 10504378,
      filename: "/lib/python3.6/site-packages/numpy/linalg/lapack_lite.so"
    }, {
      start: 10504378,
      audio: 0,
      end: 10506710,
      filename: "/lib/python3.6/site-packages/numpy/linalg/__init__.py"
    }, {
      start: 10506710,
      audio: 0,
      end: 10507908,
      filename: "/lib/python3.6/site-packages/numpy/linalg/info.py"
    }, {
      start: 10507908,
      audio: 0,
      end: 10508038,
      filename: "/lib/python3.6/site-packages/numpy/testing/noseclasses.py"
    }, {
      start: 10508038,
      audio: 0,
      end: 10510743,
      filename: "/lib/python3.6/site-packages/numpy/testing/print_coercion_tables.py"
    }, {
      start: 10510743,
      audio: 0,
      end: 10511032,
      filename: "/lib/python3.6/site-packages/numpy/testing/nosetester.py"
    }, {
      start: 10511032,
      audio: 0,
      end: 10511160,
      filename: "/lib/python3.6/site-packages/numpy/testing/decorators.py"
    }, {
      start: 10511160,
      audio: 0,
      end: 10512086,
      filename: "/lib/python3.6/site-packages/numpy/testing/utils.py"
    }, {
      start: 10512086,
      audio: 0,
      end: 10512763,
      filename: "/lib/python3.6/site-packages/numpy/testing/setup.py"
    }, {
      start: 10512763,
      audio: 0,
      end: 10513238,
      filename: "/lib/python3.6/site-packages/numpy/testing/__init__.py"
    }, {
      start: 10513238,
      audio: 0,
      end: 10527837,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/noseclasses.py"
    }, {
      start: 10527837,
      audio: 0,
      end: 10548399,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/nosetester.py"
    }, {
      start: 10548399,
      audio: 0,
      end: 10556990,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/decorators.py"
    }, {
      start: 10556990,
      audio: 0,
      end: 10632424,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/utils.py"
    }, {
      start: 10632424,
      audio: 0,
      end: 10650710,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/parameterized.py"
    }, {
      start: 10650710,
      audio: 0,
      end: 10650710,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/__init__.py"
    }],
    remote_package_size: 10650710,
    package_uuid: "c82e3089-8f52-4fdd-91a4-9be0c0d857d4"
  })
})();