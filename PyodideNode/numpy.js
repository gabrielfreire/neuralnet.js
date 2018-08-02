var Module = typeof Module !== "undefined" ? Module : typeof process.pyodide !== 'undefined' ? process.pyodide : {};
var fetch = require('isomorphic-fetch'); // <-- for external resources
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0
}
Module.expectedDataFileDownloads++;
(function() {
  var loadPackage = function(metadata) {
    var PACKAGE_PATH;
    var PACKAGE_NAME = "/home/mdboom/Work/builds/compiling/pyodide.tmp/packages/numpy/build/numpy.data";
    var REMOTE_PACKAGE_BASE = "numpy.data";
    if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
      Module["locateFile"] = Module["locateFilePackage"];
      Module.printErr("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
    }
    var REMOTE_PACKAGE_NAME = typeof Module["locateFile"] === "function" ? Module["locateFile"](REMOTE_PACKAGE_BASE) : (Module["filePackagePrefixURL"] || "") + REMOTE_PACKAGE_BASE;
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;

    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      function fetch_node(file) { // <-- for local resources
        var fs = require('fs');
        return new Promise((resolve, reject) => 
        fs.readFile(file, (err, data) => err ? reject(err) : resolve({ arrayBuffer: () => data })));
      }
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
        if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + total + "/" + total + ")");
        callback(packageData);
      }).catch((err) => {
        console.error(`Something wrong happened ${err}`);
        throw new Error(`Something wrong happened ${err}`);
      });
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

      function DataRequest(start, end, crunched, audio) {
        this.start = start;
        this.end = end;
        this.crunched = crunched;
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
            console.error(`Error, creation of preloaded file failed`);
            if (that.audio) {
              Module["removeRunDependency"]("fp " + that.name)
            } else {
              Module.printErr("Preloading file " + that.name + " failed")
            }
          }, false, true);
          this.requests[this.name] = null
        }
      };
      var files = metadata.files;
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open("GET", files[i].filename)
      }

      function processPackageData(arrayBuffer) {
        if(!arrayBuffer) throw "No input to processPackageData";
        Module.finishedDataFileDownloads++;
        if(!arrayBuffer instanceof ArrayBuffer) arrayBuffer = arrayBuffer.buffer ? arrayBuffer.buffer : null; // <- this is better
        if(!arrayBuffer) throw "bad input to processPackageData";
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        if (Module["SPLIT_MEMORY"]) Module.printErr("warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting");
        var ptr = Module["getMemory"](byteArray.length);
        Module["HEAPU8"].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module["HEAPU8"].subarray(ptr, ptr + byteArray.length);
        var files = metadata.files;
        for (var i = 0; i < files.length; ++i) {
          DataRequest.prototype.requests[files[i].filename].onload()
        }
        Module["removeRunDependency"]("datafile_/home/mdboom/Work/builds/compiling/pyodide.tmp/packages/numpy/build/numpy.data")
      }
      Module["addRunDependency"]("datafile_/home/mdboom/Work/builds/compiling/pyodide.tmp/packages/numpy/build/numpy.data");
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
      audio: 0,
      start: 0,
      crunched: 0,
      end: 14730,
      filename: "/lib/python3.6/site-packages/numpy/ctypeslib.py"
    }, {
      audio: 0,
      start: 14730,
      crunched: 0,
      end: 16287,
      filename: "/lib/python3.6/site-packages/numpy/conftest.py"
    }, {
      audio: 0,
      start: 16287,
      crunched: 0,
      end: 17587,
      filename: "/lib/python3.6/site-packages/numpy/__config__.py"
    }, {
      audio: 0,
      start: 17587,
      crunched: 0,
      end: 17918,
      filename: "/lib/python3.6/site-packages/numpy/_distributor_init.py"
    }, {
      audio: 0,
      start: 17918,
      crunched: 0,
      end: 31152,
      filename: "/lib/python3.6/site-packages/numpy/_import_tools.py"
    }, {
      audio: 0,
      start: 31152,
      crunched: 0,
      end: 265899,
      filename: "/lib/python3.6/site-packages/numpy/add_newdocs.py"
    }, {
      audio: 0,
      start: 265899,
      crunched: 0,
      end: 275708,
      filename: "/lib/python3.6/site-packages/numpy/matlib.py"
    }, {
      audio: 0,
      start: 275708,
      crunched: 0,
      end: 276002,
      filename: "/lib/python3.6/site-packages/numpy/version.py"
    }, {
      audio: 0,
      start: 276002,
      crunched: 0,
      end: 276922,
      filename: "/lib/python3.6/site-packages/numpy/setup.py"
    }, {
      audio: 0,
      start: 276922,
      crunched: 0,
      end: 278781,
      filename: "/lib/python3.6/site-packages/numpy/_globals.py"
    }, {
      audio: 0,
      start: 278781,
      crunched: 0,
      end: 285032,
      filename: "/lib/python3.6/site-packages/numpy/__init__.py"
    }, {
      audio: 0,
      start: 285032,
      crunched: 0,
      end: 286896,
      filename: "/lib/python3.6/site-packages/numpy/dual.py"
    }, {
      audio: 0,
      start: 286896,
      crunched: 0,
      end: 344300,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/legendre.py"
    }, {
      audio: 0,
      start: 344300,
      crunched: 0,
      end: 411269,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/chebyshev.py"
    }, {
      audio: 0,
      start: 411269,
      crunched: 0,
      end: 441361,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/_polybase.py"
    }, {
      audio: 0,
      start: 441361,
      crunched: 0,
      end: 452890,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/polyutils.py"
    }, {
      audio: 0,
      start: 452890,
      crunched: 0,
      end: 510976,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/hermite_e.py"
    }, {
      audio: 0,
      start: 510976,
      crunched: 0,
      end: 568872,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/hermite.py"
    }, {
      audio: 0,
      start: 568872,
      crunched: 0,
      end: 625181,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/laguerre.py"
    }, {
      audio: 0,
      start: 625181,
      crunched: 0,
      end: 625566,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/setup.py"
    }, {
      audio: 0,
      start: 625566,
      crunched: 0,
      end: 678374,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/polynomial.py"
    }, {
      audio: 0,
      start: 678374,
      crunched: 0,
      end: 679514,
      filename: "/lib/python3.6/site-packages/numpy/polynomial/__init__.py"
    }, {
      audio: 0,
      start: 679514,
      crunched: 0,
      end: 735477,
      filename: "/lib/python3.6/site-packages/numpy/ma/extras.py"
    }, {
      audio: 0,
      start: 735477,
      crunched: 0,
      end: 762912,
      filename: "/lib/python3.6/site-packages/numpy/ma/mrecords.py"
    }, {
      audio: 0,
      start: 762912,
      crunched: 0,
      end: 1018755,
      filename: "/lib/python3.6/site-packages/numpy/ma/core.py"
    }, {
      audio: 0,
      start: 1018755,
      crunched: 0,
      end: 1029139,
      filename: "/lib/python3.6/site-packages/numpy/ma/testutils.py"
    }, {
      audio: 0,
      start: 1029139,
      crunched: 0,
      end: 1029519,
      filename: "/lib/python3.6/site-packages/numpy/ma/version.py"
    }, {
      audio: 0,
      start: 1029519,
      crunched: 0,
      end: 1029948,
      filename: "/lib/python3.6/site-packages/numpy/ma/setup.py"
    }, {
      audio: 0,
      start: 1029948,
      crunched: 0,
      end: 1045534,
      filename: "/lib/python3.6/site-packages/numpy/ma/timer_comparison.py"
    }, {
      audio: 0,
      start: 1045534,
      crunched: 0,
      end: 1050451,
      filename: "/lib/python3.6/site-packages/numpy/ma/bench.py"
    }, {
      audio: 0,
      start: 1050451,
      crunched: 0,
      end: 1051927,
      filename: "/lib/python3.6/site-packages/numpy/ma/__init__.py"
    }, {
      audio: 0,
      start: 1051927,
      crunched: 0,
      end: 2260468,
      filename: "/lib/python3.6/site-packages/numpy/random/mtrand.so"
    }, {
      audio: 0,
      start: 2260468,
      crunched: 0,
      end: 2262780,
      filename: "/lib/python3.6/site-packages/numpy/random/setup.py"
    }, {
      audio: 0,
      start: 2262780,
      crunched: 0,
      end: 2268261,
      filename: "/lib/python3.6/site-packages/numpy/random/__init__.py"
    }, {
      audio: 0,
      start: 2268261,
      crunched: 0,
      end: 2273460,
      filename: "/lib/python3.6/site-packages/numpy/random/info.py"
    }, {
      audio: 0,
      start: 2273460,
      crunched: 0,
      end: 2294027,
      filename: "/lib/python3.6/site-packages/numpy/lib/arraysetops.py"
    }, {
      audio: 0,
      start: 2294027,
      crunched: 0,
      end: 2298894,
      filename: "/lib/python3.6/site-packages/numpy/lib/_version.py"
    }, {
      audio: 0,
      start: 2298894,
      crunched: 0,
      end: 2468926,
      filename: "/lib/python3.6/site-packages/numpy/lib/function_base.py"
    }, {
      audio: 0,
      start: 2468926,
      crunched: 0,
      end: 2476743,
      filename: "/lib/python3.6/site-packages/numpy/lib/user_array.py"
    }, {
      audio: 0,
      start: 2476743,
      crunched: 0,
      end: 2501238,
      filename: "/lib/python3.6/site-packages/numpy/lib/financial.py"
    }, {
      audio: 0,
      start: 2501238,
      crunched: 0,
      end: 2529906,
      filename: "/lib/python3.6/site-packages/numpy/lib/shape_base.py"
    }, {
      audio: 0,
      start: 2529906,
      crunched: 0,
      end: 2581763,
      filename: "/lib/python3.6/site-packages/numpy/lib/arraypad.py"
    }, {
      audio: 0,
      start: 2581763,
      crunched: 0,
      end: 2598263,
      filename: "/lib/python3.6/site-packages/numpy/lib/type_check.py"
    }, {
      audio: 0,
      start: 2598263,
      crunched: 0,
      end: 2627419,
      filename: "/lib/python3.6/site-packages/numpy/lib/format.py"
    }, {
      audio: 0,
      start: 2627419,
      crunched: 0,
      end: 2634703,
      filename: "/lib/python3.6/site-packages/numpy/lib/mixins.py"
    }, {
      audio: 0,
      start: 2634703,
      crunched: 0,
      end: 2717875,
      filename: "/lib/python3.6/site-packages/numpy/lib/npyio.py"
    }, {
      audio: 0,
      start: 2717875,
      crunched: 0,
      end: 2744555,
      filename: "/lib/python3.6/site-packages/numpy/lib/index_tricks.py"
    }, {
      audio: 0,
      start: 2744555,
      crunched: 0,
      end: 2751746,
      filename: "/lib/python3.6/site-packages/numpy/lib/arrayterator.py"
    }, {
      audio: 0,
      start: 2751746,
      crunched: 0,
      end: 2791420,
      filename: "/lib/python3.6/site-packages/numpy/lib/recfunctions.py"
    }, {
      audio: 0,
      start: 2791420,
      crunched: 0,
      end: 2827760,
      filename: "/lib/python3.6/site-packages/numpy/lib/utils.py"
    }, {
      audio: 0,
      start: 2827760,
      crunched: 0,
      end: 2828139,
      filename: "/lib/python3.6/site-packages/numpy/lib/setup.py"
    }, {
      audio: 0,
      start: 2828139,
      crunched: 0,
      end: 2878993,
      filename: "/lib/python3.6/site-packages/numpy/lib/nanfunctions.py"
    }, {
      audio: 0,
      start: 2878993,
      crunched: 0,
      end: 2887778,
      filename: "/lib/python3.6/site-packages/numpy/lib/stride_tricks.py"
    }, {
      audio: 0,
      start: 2887778,
      crunched: 0,
      end: 2893492,
      filename: "/lib/python3.6/site-packages/numpy/lib/ufunclike.py"
    }, {
      audio: 0,
      start: 2893492,
      crunched: 0,
      end: 2907577,
      filename: "/lib/python3.6/site-packages/numpy/lib/scimath.py"
    }, {
      audio: 0,
      start: 2907577,
      crunched: 0,
      end: 2932888,
      filename: "/lib/python3.6/site-packages/numpy/lib/_datasource.py"
    }, {
      audio: 0,
      start: 2932888,
      crunched: 0,
      end: 2971460,
      filename: "/lib/python3.6/site-packages/numpy/lib/polynomial.py"
    }, {
      audio: 0,
      start: 2971460,
      crunched: 0,
      end: 2972761,
      filename: "/lib/python3.6/site-packages/numpy/lib/__init__.py"
    }, {
      audio: 0,
      start: 2972761,
      crunched: 0,
      end: 2998578,
      filename: "/lib/python3.6/site-packages/numpy/lib/twodim_base.py"
    }, {
      audio: 0,
      start: 2998578,
      crunched: 0,
      end: 3031194,
      filename: "/lib/python3.6/site-packages/numpy/lib/_iotools.py"
    }, {
      audio: 0,
      start: 3031194,
      crunched: 0,
      end: 3037810,
      filename: "/lib/python3.6/site-packages/numpy/lib/info.py"
    }, {
      audio: 0,
      start: 3037810,
      crunched: 0,
      end: 3045364,
      filename: "/lib/python3.6/site-packages/numpy/compat/_inspect.py"
    }, {
      audio: 0,
      start: 3045364,
      crunched: 0,
      end: 3045735,
      filename: "/lib/python3.6/site-packages/numpy/compat/setup.py"
    }, {
      audio: 0,
      start: 3045735,
      crunched: 0,
      end: 3049372,
      filename: "/lib/python3.6/site-packages/numpy/compat/py3k.py"
    }, {
      audio: 0,
      start: 3049372,
      crunched: 0,
      end: 3049870,
      filename: "/lib/python3.6/site-packages/numpy/compat/__init__.py"
    }, {
      audio: 0,
      start: 3049870,
      crunched: 0,
      end: 3082843,
      filename: "/lib/python3.6/site-packages/numpy/matrixlib/defmatrix.py"
    }, {
      audio: 0,
      start: 3082843,
      crunched: 0,
      end: 3083291,
      filename: "/lib/python3.6/site-packages/numpy/matrixlib/setup.py"
    }, {
      audio: 0,
      start: 3083291,
      crunched: 0,
      end: 3083581,
      filename: "/lib/python3.6/site-packages/numpy/matrixlib/__init__.py"
    }, {
      audio: 0,
      start: 3083581,
      crunched: 0,
      end: 3091499,
      filename: "/lib/python3.6/site-packages/numpy/doc/basics.py"
    }, {
      audio: 0,
      start: 3091499,
      crunched: 0,
      end: 3103870,
      filename: "/lib/python3.6/site-packages/numpy/doc/glossary.py"
    }, {
      audio: 0,
      start: 3103870,
      crunched: 0,
      end: 3109371,
      filename: "/lib/python3.6/site-packages/numpy/doc/creation.py"
    }, {
      audio: 0,
      start: 3109371,
      crunched: 0,
      end: 3114936,
      filename: "/lib/python3.6/site-packages/numpy/doc/broadcasting.py"
    }, {
      audio: 0,
      start: 3114936,
      crunched: 0,
      end: 3120282,
      filename: "/lib/python3.6/site-packages/numpy/doc/byteswapping.py"
    }, {
      audio: 0,
      start: 3120282,
      crunched: 0,
      end: 3135951,
      filename: "/lib/python3.6/site-packages/numpy/doc/indexing.py"
    }, {
      audio: 0,
      start: 3135951,
      crunched: 0,
      end: 3142145,
      filename: "/lib/python3.6/site-packages/numpy/doc/misc.py"
    }, {
      audio: 0,
      start: 3142145,
      crunched: 0,
      end: 3147572,
      filename: "/lib/python3.6/site-packages/numpy/doc/ufuncs.py"
    }, {
      audio: 0,
      start: 3147572,
      crunched: 0,
      end: 3176132,
      filename: "/lib/python3.6/site-packages/numpy/doc/subclassing.py"
    }, {
      audio: 0,
      start: 3176132,
      crunched: 0,
      end: 3200575,
      filename: "/lib/python3.6/site-packages/numpy/doc/structured_arrays.py"
    }, {
      audio: 0,
      start: 3200575,
      crunched: 0,
      end: 3209457,
      filename: "/lib/python3.6/site-packages/numpy/doc/constants.py"
    }, {
      audio: 0,
      start: 3209457,
      crunched: 0,
      end: 3219126,
      filename: "/lib/python3.6/site-packages/numpy/doc/internals.py"
    }, {
      audio: 0,
      start: 3219126,
      crunched: 0,
      end: 3219700,
      filename: "/lib/python3.6/site-packages/numpy/doc/__init__.py"
    }, {
      audio: 0,
      start: 3219700,
      crunched: 0,
      end: 3228924,
      filename: "/lib/python3.6/site-packages/numpy/f2py/func2subr.py"
    }, {
      audio: 0,
      start: 3228924,
      crunched: 0,
      end: 3233954,
      filename: "/lib/python3.6/site-packages/numpy/f2py/common_rules.py"
    }, {
      audio: 0,
      start: 3233954,
      crunched: 0,
      end: 3292479,
      filename: "/lib/python3.6/site-packages/numpy/f2py/rules.py"
    }, {
      audio: 0,
      start: 3292479,
      crunched: 0,
      end: 3294002,
      filename: "/lib/python3.6/site-packages/numpy/f2py/f2py_testing.py"
    }, {
      audio: 0,
      start: 3294002,
      crunched: 0,
      end: 3299297,
      filename: "/lib/python3.6/site-packages/numpy/f2py/diagnose.py"
    }, {
      audio: 0,
      start: 3299297,
      crunched: 0,
      end: 3344410,
      filename: "/lib/python3.6/site-packages/numpy/f2py/cfuncs.py"
    }, {
      audio: 0,
      start: 3344410,
      crunched: 0,
      end: 3366236,
      filename: "/lib/python3.6/site-packages/numpy/f2py/auxfuncs.py"
    }, {
      audio: 0,
      start: 3366236,
      crunched: 0,
      end: 3369888,
      filename: "/lib/python3.6/site-packages/numpy/f2py/use_rules.py"
    }, {
      audio: 0,
      start: 3369888,
      crunched: 0,
      end: 3498292,
      filename: "/lib/python3.6/site-packages/numpy/f2py/crackfortran.py"
    }, {
      audio: 0,
      start: 3498292,
      crunched: 0,
      end: 3520648,
      filename: "/lib/python3.6/site-packages/numpy/f2py/cb_rules.py"
    }, {
      audio: 0,
      start: 3520648,
      crunched: 0,
      end: 3520902,
      filename: "/lib/python3.6/site-packages/numpy/f2py/__version__.py"
    }, {
      audio: 0,
      start: 3520902,
      crunched: 0,
      end: 3524827,
      filename: "/lib/python3.6/site-packages/numpy/f2py/setup.py"
    }, {
      audio: 0,
      start: 3524827,
      crunched: 0,
      end: 3534677,
      filename: "/lib/python3.6/site-packages/numpy/f2py/f90mod_rules.py"
    }, {
      audio: 0,
      start: 3534677,
      crunched: 0,
      end: 3566216,
      filename: "/lib/python3.6/site-packages/numpy/f2py/capi_maps.py"
    }, {
      audio: 0,
      start: 3566216,
      crunched: 0,
      end: 3568243,
      filename: "/lib/python3.6/site-packages/numpy/f2py/__init__.py"
    }, {
      audio: 0,
      start: 3568243,
      crunched: 0,
      end: 3591151,
      filename: "/lib/python3.6/site-packages/numpy/f2py/f2py2e.py"
    }, {
      audio: 0,
      start: 3591151,
      crunched: 0,
      end: 3591890,
      filename: "/lib/python3.6/site-packages/numpy/f2py/__main__.py"
    }, {
      audio: 0,
      start: 3591890,
      crunched: 0,
      end: 3592026,
      filename: "/lib/python3.6/site-packages/numpy/f2py/info.py"
    }, {
      audio: 0,
      start: 3592026,
      crunched: 0,
      end: 3629800,
      filename: "/lib/python3.6/site-packages/numpy/fft/fftpack_lite.so"
    }, {
      audio: 0,
      start: 3629800,
      crunched: 0,
      end: 3639392,
      filename: "/lib/python3.6/site-packages/numpy/fft/helper.py"
    }, {
      audio: 0,
      start: 3639392,
      crunched: 0,
      end: 3639942,
      filename: "/lib/python3.6/site-packages/numpy/fft/setup.py"
    }, {
      audio: 0,
      start: 3639942,
      crunched: 0,
      end: 3686001,
      filename: "/lib/python3.6/site-packages/numpy/fft/fftpack.py"
    }, {
      audio: 0,
      start: 3686001,
      crunched: 0,
      end: 3686259,
      filename: "/lib/python3.6/site-packages/numpy/fft/__init__.py"
    }, {
      audio: 0,
      start: 3686259,
      crunched: 0,
      end: 3693494,
      filename: "/lib/python3.6/site-packages/numpy/fft/info.py"
    }, {
      audio: 0,
      start: 3693494,
      crunched: 0,
      end: 3723587,
      filename: "/lib/python3.6/site-packages/numpy/core/records.py"
    }, {
      audio: 0,
      start: 3723587,
      crunched: 0,
      end: 5544151,
      filename: "/lib/python3.6/site-packages/numpy/core/multiarray.so"
    }, {
      audio: 0,
      start: 5544151,
      crunched: 0,
      end: 5555583,
      filename: "/lib/python3.6/site-packages/numpy/core/memmap.py"
    }, {
      audio: 0,
      start: 5555583,
      crunched: 0,
      end: 5567923,
      filename: "/lib/python3.6/site-packages/numpy/core/function_base.py"
    }, {
      audio: 0,
      start: 5567923,
      crunched: 0,
      end: 5653654,
      filename: "/lib/python3.6/site-packages/numpy/core/numeric.py"
    }, {
      audio: 0,
      start: 5653654,
      crunched: 0,
      end: 5672076,
      filename: "/lib/python3.6/site-packages/numpy/core/getlimits.py"
    }, {
      audio: 0,
      start: 5672076,
      crunched: 0,
      end: 5785648,
      filename: "/lib/python3.6/site-packages/numpy/core/multiarray_tests.so"
    }, {
      audio: 0,
      start: 5785648,
      crunched: 0,
      end: 5807464,
      filename: "/lib/python3.6/site-packages/numpy/core/_internal.py"
    }, {
      audio: 0,
      start: 5807464,
      crunched: 0,
      end: 5826280,
      filename: "/lib/python3.6/site-packages/numpy/core/shape_base.py"
    }, {
      audio: 0,
      start: 5826280,
      crunched: 0,
      end: 5926917,
      filename: "/lib/python3.6/site-packages/numpy/core/fromnumeric.py"
    }, {
      audio: 0,
      start: 5926917,
      crunched: 0,
      end: 5994286,
      filename: "/lib/python3.6/site-packages/numpy/core/defchararray.py"
    }, {
      audio: 0,
      start: 5994286,
      crunched: 0,
      end: 5994699,
      filename: "/lib/python3.6/site-packages/numpy/core/cversions.py"
    }, {
      audio: 0,
      start: 5994699,
      crunched: 0,
      end: 5999091,
      filename: "/lib/python3.6/site-packages/numpy/core/struct_ufunc_test.so"
    }, {
      audio: 0,
      start: 5999091,
      crunched: 0,
      end: 6003795,
      filename: "/lib/python3.6/site-packages/numpy/core/_methods.py"
    }, {
      audio: 0,
      start: 6003795,
      crunched: 0,
      end: 6019748,
      filename: "/lib/python3.6/site-packages/numpy/core/setup_common.py"
    }, {
      audio: 0,
      start: 6019748,
      crunched: 0,
      end: 6030537,
      filename: "/lib/python3.6/site-packages/numpy/core/machar.py"
    }, {
      audio: 0,
      start: 6030537,
      crunched: 0,
      end: 6087802,
      filename: "/lib/python3.6/site-packages/numpy/core/arrayprint.py"
    }, {
      audio: 0,
      start: 6087802,
      crunched: 0,
      end: 6088491,
      filename: "/lib/python3.6/site-packages/numpy/core/_dummy.so"
    }, {
      audio: 0,
      start: 6088491,
      crunched: 0,
      end: 6117593,
      filename: "/lib/python3.6/site-packages/numpy/core/numerictypes.py"
    }, {
      audio: 0,
      start: 6117593,
      crunched: 0,
      end: 6159070,
      filename: "/lib/python3.6/site-packages/numpy/core/setup.py"
    }, {
      audio: 0,
      start: 6159070,
      crunched: 0,
      end: 6922755,
      filename: "/lib/python3.6/site-packages/numpy/core/umath.so"
    }, {
      audio: 0,
      start: 6922755,
      crunched: 0,
      end: 6934991,
      filename: "/lib/python3.6/site-packages/numpy/core/umath_tests.so"
    }, {
      audio: 0,
      start: 6934991,
      crunched: 0,
      end: 6942497,
      filename: "/lib/python3.6/site-packages/numpy/core/generate_numpy_api.py"
    }, {
      audio: 0,
      start: 6942497,
      crunched: 0,
      end: 6946181,
      filename: "/lib/python3.6/site-packages/numpy/core/operand_flag_tests.so"
    }, {
      audio: 0,
      start: 6946181,
      crunched: 0,
      end: 7003007,
      filename: "/lib/python3.6/site-packages/numpy/core/test_rational.so"
    }, {
      audio: 0,
      start: 7003007,
      crunched: 0,
      end: 7043699,
      filename: "/lib/python3.6/site-packages/numpy/core/einsumfunc.py"
    }, {
      audio: 0,
      start: 7043699,
      crunched: 0,
      end: 7046743,
      filename: "/lib/python3.6/site-packages/numpy/core/__init__.py"
    }, {
      audio: 0,
      start: 7046743,
      crunched: 0,
      end: 7051435,
      filename: "/lib/python3.6/site-packages/numpy/core/info.py"
    }, {
      audio: 0,
      start: 7051435,
      crunched: 0,
      end: 7053488,
      filename: "/lib/python3.6/site-packages/numpy/distutils/line_endings.py"
    }, {
      audio: 0,
      start: 7053488,
      crunched: 0,
      end: 7142989,
      filename: "/lib/python3.6/site-packages/numpy/distutils/system_info.py"
    }, {
      audio: 0,
      start: 7142989,
      crunched: 0,
      end: 7144980,
      filename: "/lib/python3.6/site-packages/numpy/distutils/msvccompiler.py"
    }, {
      audio: 0,
      start: 7144980,
      crunched: 0,
      end: 7147326,
      filename: "/lib/python3.6/site-packages/numpy/distutils/environment.py"
    }, {
      audio: 0,
      start: 7147326,
      crunched: 0,
      end: 7160569,
      filename: "/lib/python3.6/site-packages/numpy/distutils/npy_pkg_config.py"
    }, {
      audio: 0,
      start: 7160569,
      crunched: 0,
      end: 7160787,
      filename: "/lib/python3.6/site-packages/numpy/distutils/compat.py"
    }, {
      audio: 0,
      start: 7160787,
      crunched: 0,
      end: 7163754,
      filename: "/lib/python3.6/site-packages/numpy/distutils/extension.py"
    }, {
      audio: 0,
      start: 7163754,
      crunched: 0,
      end: 7173463,
      filename: "/lib/python3.6/site-packages/numpy/distutils/conv_template.py"
    }, {
      audio: 0,
      start: 7173463,
      crunched: 0,
      end: 7174163,
      filename: "/lib/python3.6/site-packages/numpy/distutils/numpy_distribution.py"
    }, {
      audio: 0,
      start: 7174163,
      crunched: 0,
      end: 7177675,
      filename: "/lib/python3.6/site-packages/numpy/distutils/lib2def.py"
    }, {
      audio: 0,
      start: 7177675,
      crunched: 0,
      end: 7181966,
      filename: "/lib/python3.6/site-packages/numpy/distutils/intelccompiler.py"
    }, {
      audio: 0,
      start: 7181966,
      crunched: 0,
      end: 7184711,
      filename: "/lib/python3.6/site-packages/numpy/distutils/log.py"
    }, {
      audio: 0,
      start: 7184711,
      crunched: 0,
      end: 7189867,
      filename: "/lib/python3.6/site-packages/numpy/distutils/unixccompiler.py"
    }, {
      audio: 0,
      start: 7189867,
      crunched: 0,
      end: 7272146,
      filename: "/lib/python3.6/site-packages/numpy/distutils/misc_util.py"
    }, {
      audio: 0,
      start: 7272146,
      crunched: 0,
      end: 7280329,
      filename: "/lib/python3.6/site-packages/numpy/distutils/core.py"
    }, {
      audio: 0,
      start: 7280329,
      crunched: 0,
      end: 7288159,
      filename: "/lib/python3.6/site-packages/numpy/distutils/from_template.py"
    }, {
      audio: 0,
      start: 7288159,
      crunched: 0,
      end: 7290417,
      filename: "/lib/python3.6/site-packages/numpy/distutils/msvc9compiler.py"
    }, {
      audio: 0,
      start: 7290417,
      crunched: 0,
      end: 7291717,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__config__.py"
    }, {
      audio: 0,
      start: 7291717,
      crunched: 0,
      end: 7291868,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__version__.py"
    }, {
      audio: 0,
      start: 7291868,
      crunched: 0,
      end: 7292479,
      filename: "/lib/python3.6/site-packages/numpy/distutils/setup.py"
    }, {
      audio: 0,
      start: 7292479,
      crunched: 0,
      end: 7315494,
      filename: "/lib/python3.6/site-packages/numpy/distutils/cpuinfo.py"
    }, {
      audio: 0,
      start: 7315494,
      crunched: 0,
      end: 7344041,
      filename: "/lib/python3.6/site-packages/numpy/distutils/ccompiler.py"
    }, {
      audio: 0,
      start: 7344041,
      crunched: 0,
      end: 7369242,
      filename: "/lib/python3.6/site-packages/numpy/distutils/mingw32ccompiler.py"
    }, {
      audio: 0,
      start: 7369242,
      crunched: 0,
      end: 7377905,
      filename: "/lib/python3.6/site-packages/numpy/distutils/exec_command.py"
    }, {
      audio: 0,
      start: 7377905,
      crunched: 0,
      end: 7378993,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__init__.py"
    }, {
      audio: 0,
      start: 7378993,
      crunched: 0,
      end: 7379772,
      filename: "/lib/python3.6/site-packages/numpy/distutils/pathccompiler.py"
    }, {
      audio: 0,
      start: 7379772,
      crunched: 0,
      end: 7379929,
      filename: "/lib/python3.6/site-packages/numpy/distutils/info.py"
    }, {
      audio: 0,
      start: 7379929,
      crunched: 0,
      end: 7397939,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/config.py"
    }, {
      audio: 0,
      start: 7397939,
      crunched: 0,
      end: 7398853,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_data.py"
    }, {
      audio: 0,
      start: 7398853,
      crunched: 0,
      end: 7400063,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_py.py"
    }, {
      audio: 0,
      start: 7400063,
      crunched: 0,
      end: 7401378,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_clib.py"
    }, {
      audio: 0,
      start: 7401378,
      crunched: 0,
      end: 7405757,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/config_compiler.py"
    }, {
      audio: 0,
      start: 7405757,
      crunched: 0,
      end: 7436703,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_src.py"
    }, {
      audio: 0,
      start: 7436703,
      crunched: 0,
      end: 7438434,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_scripts.py"
    }, {
      audio: 0,
      start: 7438434,
      crunched: 0,
      end: 7441561,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install.py"
    }, {
      audio: 0,
      start: 7441561,
      crunched: 0,
      end: 7443609,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/autodist.py"
    }, {
      audio: 0,
      start: 7443609,
      crunched: 0,
      end: 7444596,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/egg_info.py"
    }, {
      audio: 0,
      start: 7444596,
      crunched: 0,
      end: 7446214,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build.py"
    }, {
      audio: 0,
      start: 7446214,
      crunched: 0,
      end: 7459603,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_clib.py"
    }, {
      audio: 0,
      start: 7459603,
      crunched: 0,
      end: 7484867,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_ext.py"
    }, {
      audio: 0,
      start: 7484867,
      crunched: 0,
      end: 7485508,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/develop.py"
    }, {
      audio: 0,
      start: 7485508,
      crunched: 0,
      end: 7486493,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_headers.py"
    }, {
      audio: 0,
      start: 7486493,
      crunched: 0,
      end: 7487591,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/__init__.py"
    }, {
      audio: 0,
      start: 7487591,
      crunched: 0,
      end: 7488366,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/bdist_rpm.py"
    }, {
      audio: 0,
      start: 7488366,
      crunched: 0,
      end: 7489165,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/sdist.py"
    }, {
      audio: 0,
      start: 7489165,
      crunched: 0,
      end: 7490945,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/mips.py"
    }, {
      audio: 0,
      start: 7490945,
      crunched: 0,
      end: 7492072,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/pathf95.py"
    }, {
      audio: 0,
      start: 7492072,
      crunched: 0,
      end: 7498845,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/intel.py"
    }, {
      audio: 0,
      start: 7498845,
      crunched: 0,
      end: 7503058,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/pg.py"
    }, {
      audio: 0,
      start: 7503058,
      crunched: 0,
      end: 7508625,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/absoft.py"
    }, {
      audio: 0,
      start: 7508625,
      crunched: 0,
      end: 7509449,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/none.py"
    }, {
      audio: 0,
      start: 7509449,
      crunched: 0,
      end: 7529212,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/gnu.py"
    }, {
      audio: 0,
      start: 7529212,
      crunched: 0,
      end: 7530857,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/sun.py"
    }, {
      audio: 0,
      start: 7530857,
      crunched: 0,
      end: 7532276,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/hpux.py"
    }, {
      audio: 0,
      start: 7532276,
      crunched: 0,
      end: 7535711,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/ibm.py"
    }, {
      audio: 0,
      start: 7535711,
      crunched: 0,
      end: 7537107,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/g95.py"
    }, {
      audio: 0,
      start: 7537107,
      crunched: 0,
      end: 7539715,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/nag.py"
    }, {
      audio: 0,
      start: 7539715,
      crunched: 0,
      end: 7543824,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/compaq.py"
    }, {
      audio: 0,
      start: 7543824,
      crunched: 0,
      end: 7545217,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/lahey.py"
    }, {
      audio: 0,
      start: 7545217,
      crunched: 0,
      end: 7546950,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/vast.py"
    }, {
      audio: 0,
      start: 7546950,
      crunched: 0,
      end: 7586297,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/__init__.py"
    }, {
      audio: 0,
      start: 7586297,
      crunched: 0,
      end: 7666734,
      filename: "/lib/python3.6/site-packages/numpy/linalg/linalg.py"
    }, {
      audio: 0,
      start: 7666734,
      crunched: 0,
      end: 7668612,
      filename: "/lib/python3.6/site-packages/numpy/linalg/setup.py"
    }, {
      audio: 0,
      start: 7668612,
      crunched: 0,
      end: 9131046,
      filename: "/lib/python3.6/site-packages/numpy/linalg/_umath_linalg.so"
    }, {
      audio: 0,
      start: 9131046,
      crunched: 0,
      end: 10500764,
      filename: "/lib/python3.6/site-packages/numpy/linalg/lapack_lite.so"
    }, {
      audio: 0,
      start: 10500764,
      crunched: 0,
      end: 10503096,
      filename: "/lib/python3.6/site-packages/numpy/linalg/__init__.py"
    }, {
      audio: 0,
      start: 10503096,
      crunched: 0,
      end: 10504294,
      filename: "/lib/python3.6/site-packages/numpy/linalg/info.py"
    }, {
      audio: 0,
      start: 10504294,
      crunched: 0,
      end: 10504424,
      filename: "/lib/python3.6/site-packages/numpy/testing/noseclasses.py"
    }, {
      audio: 0,
      start: 10504424,
      crunched: 0,
      end: 10507129,
      filename: "/lib/python3.6/site-packages/numpy/testing/print_coercion_tables.py"
    }, {
      audio: 0,
      start: 10507129,
      crunched: 0,
      end: 10507418,
      filename: "/lib/python3.6/site-packages/numpy/testing/nosetester.py"
    }, {
      audio: 0,
      start: 10507418,
      crunched: 0,
      end: 10507546,
      filename: "/lib/python3.6/site-packages/numpy/testing/decorators.py"
    }, {
      audio: 0,
      start: 10507546,
      crunched: 0,
      end: 10508472,
      filename: "/lib/python3.6/site-packages/numpy/testing/utils.py"
    }, {
      audio: 0,
      start: 10508472,
      crunched: 0,
      end: 10509149,
      filename: "/lib/python3.6/site-packages/numpy/testing/setup.py"
    }, {
      audio: 0,
      start: 10509149,
      crunched: 0,
      end: 10509624,
      filename: "/lib/python3.6/site-packages/numpy/testing/__init__.py"
    }, {
      audio: 0,
      start: 10509624,
      crunched: 0,
      end: 10524223,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/noseclasses.py"
    }, {
      audio: 0,
      start: 10524223,
      crunched: 0,
      end: 10544785,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/nosetester.py"
    }, {
      audio: 0,
      start: 10544785,
      crunched: 0,
      end: 10553376,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/decorators.py"
    }, {
      audio: 0,
      start: 10553376,
      crunched: 0,
      end: 10628810,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/utils.py"
    }, {
      audio: 0,
      start: 10628810,
      crunched: 0,
      end: 10647096,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/parameterized.py"
    }, {
      audio: 0,
      start: 10647096,
      crunched: 0,
      end: 10647096,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/__init__.py"
    }],
    remote_package_size: 10647096,
    package_uuid: "99c1a12c-32f2-4139-b1fa-5eb0a000f9bc"
  })
})();