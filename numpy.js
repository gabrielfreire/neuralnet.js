var Module = typeof process.pyodide !== "undefined" ? process.pyodide : {};

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0
}
Module.expectedDataFileDownloads++;
(function() {
  var loadPackage = function(metadata) {
    var PACKAGE_PATH;
    // remove browser dependency
    // if (typeof window === "object") {
    //   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/")
    // } else if (typeof location !== "undefined") {
    //   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/")
    // } else {
    //   throw "using preloaded data can only be done on a web page or in a web worker"
    // }
    var PACKAGE_NAME = "/home/mdboom/Work/builds/compiling/pyodide/packages/numpy/build/numpy.data";
    var REMOTE_PACKAGE_BASE = "numpy.data";
    if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
      Module["locateFile"] = Module["locateFilePackage"];
      Module.printErr("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
    }
    var REMOTE_PACKAGE_NAME = typeof Module["locateFile"] === "function" ? Module["locateFile"](REMOTE_PACKAGE_BASE) : (Module["filePackagePrefixURL"] || "") + REMOTE_PACKAGE_BASE;
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;

    // add support for nodejs
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      if(typeof XMLHttpRequest !== 'undefined') {

        var xhr = new XMLHttpRequest;
        xhr.open("GET", packageName, true);
        xhr.responseType = "arraybuffer";
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
              }
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded
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
            if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")")
          } else if (!Module.dataFileDownloads) {
            if (Module["setStatus"]) Module["setStatus"]("Downloading data...")
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName)
        };
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
            var packageData = xhr.response;
            callback(packageData)
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL)
          }
        };
        xhr.send(null)
      } else { // nodejs fallback
        var fs = require('fs');
        var path = require('path');
        if(!fs) throw 'No fs module was found';
        if(!path) throw 'No path module was found';
        function fetch_node(file) {
            return new Promise((resolve, reject) => 
            fs.readFile(file, (err, data) => err ? reject(err) : resolve({ arrayBuffer: () => data })));
        }
        fetch_node(packageName).then((buffer) => buffer.arrayBuffer()).then((packageData) => {
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
            callback(packageData);
            if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + total + "/" + total + ")");
        }).catch((err) => {
            throw new Error(`Something wrong happened ${err}`);
        })
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
        Module.finishedDataFileDownloads++;
        // assert(arrayBuffer, "Loading data file failed.");
        // assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
        if(!arrayBuffer instanceof ArrayBuffer) arrayBuffer = arrayBuffer.buffer ? arrayBuffer.buffer : arrayBuffer; // <- this is better
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
      end: 5544153,
      filename: "/lib/python3.6/site-packages/numpy/core/multiarray.so"
    }, {
      audio: 0,
      start: 5544153,
      crunched: 0,
      end: 5555585,
      filename: "/lib/python3.6/site-packages/numpy/core/memmap.py"
    }, {
      audio: 0,
      start: 5555585,
      crunched: 0,
      end: 5567925,
      filename: "/lib/python3.6/site-packages/numpy/core/function_base.py"
    }, {
      audio: 0,
      start: 5567925,
      crunched: 0,
      end: 5653656,
      filename: "/lib/python3.6/site-packages/numpy/core/numeric.py"
    }, {
      audio: 0,
      start: 5653656,
      crunched: 0,
      end: 5672078,
      filename: "/lib/python3.6/site-packages/numpy/core/getlimits.py"
    }, {
      audio: 0,
      start: 5672078,
      crunched: 0,
      end: 5785650,
      filename: "/lib/python3.6/site-packages/numpy/core/multiarray_tests.so"
    }, {
      audio: 0,
      start: 5785650,
      crunched: 0,
      end: 5807466,
      filename: "/lib/python3.6/site-packages/numpy/core/_internal.py"
    }, {
      audio: 0,
      start: 5807466,
      crunched: 0,
      end: 5826282,
      filename: "/lib/python3.6/site-packages/numpy/core/shape_base.py"
    }, {
      audio: 0,
      start: 5826282,
      crunched: 0,
      end: 5926919,
      filename: "/lib/python3.6/site-packages/numpy/core/fromnumeric.py"
    }, {
      audio: 0,
      start: 5926919,
      crunched: 0,
      end: 5994288,
      filename: "/lib/python3.6/site-packages/numpy/core/defchararray.py"
    }, {
      audio: 0,
      start: 5994288,
      crunched: 0,
      end: 5994701,
      filename: "/lib/python3.6/site-packages/numpy/core/cversions.py"
    }, {
      audio: 0,
      start: 5994701,
      crunched: 0,
      end: 5999093,
      filename: "/lib/python3.6/site-packages/numpy/core/struct_ufunc_test.so"
    }, {
      audio: 0,
      start: 5999093,
      crunched: 0,
      end: 6003797,
      filename: "/lib/python3.6/site-packages/numpy/core/_methods.py"
    }, {
      audio: 0,
      start: 6003797,
      crunched: 0,
      end: 6019750,
      filename: "/lib/python3.6/site-packages/numpy/core/setup_common.py"
    }, {
      audio: 0,
      start: 6019750,
      crunched: 0,
      end: 6030539,
      filename: "/lib/python3.6/site-packages/numpy/core/machar.py"
    }, {
      audio: 0,
      start: 6030539,
      crunched: 0,
      end: 6087804,
      filename: "/lib/python3.6/site-packages/numpy/core/arrayprint.py"
    }, {
      audio: 0,
      start: 6087804,
      crunched: 0,
      end: 6088493,
      filename: "/lib/python3.6/site-packages/numpy/core/_dummy.so"
    }, {
      audio: 0,
      start: 6088493,
      crunched: 0,
      end: 6117595,
      filename: "/lib/python3.6/site-packages/numpy/core/numerictypes.py"
    }, {
      audio: 0,
      start: 6117595,
      crunched: 0,
      end: 6159072,
      filename: "/lib/python3.6/site-packages/numpy/core/setup.py"
    }, {
      audio: 0,
      start: 6159072,
      crunched: 0,
      end: 6922757,
      filename: "/lib/python3.6/site-packages/numpy/core/umath.so"
    }, {
      audio: 0,
      start: 6922757,
      crunched: 0,
      end: 6934993,
      filename: "/lib/python3.6/site-packages/numpy/core/umath_tests.so"
    }, {
      audio: 0,
      start: 6934993,
      crunched: 0,
      end: 6942499,
      filename: "/lib/python3.6/site-packages/numpy/core/generate_numpy_api.py"
    }, {
      audio: 0,
      start: 6942499,
      crunched: 0,
      end: 6946183,
      filename: "/lib/python3.6/site-packages/numpy/core/operand_flag_tests.so"
    }, {
      audio: 0,
      start: 6946183,
      crunched: 0,
      end: 7003009,
      filename: "/lib/python3.6/site-packages/numpy/core/test_rational.so"
    }, {
      audio: 0,
      start: 7003009,
      crunched: 0,
      end: 7043701,
      filename: "/lib/python3.6/site-packages/numpy/core/einsumfunc.py"
    }, {
      audio: 0,
      start: 7043701,
      crunched: 0,
      end: 7046745,
      filename: "/lib/python3.6/site-packages/numpy/core/__init__.py"
    }, {
      audio: 0,
      start: 7046745,
      crunched: 0,
      end: 7051437,
      filename: "/lib/python3.6/site-packages/numpy/core/info.py"
    }, {
      audio: 0,
      start: 7051437,
      crunched: 0,
      end: 7053490,
      filename: "/lib/python3.6/site-packages/numpy/distutils/line_endings.py"
    }, {
      audio: 0,
      start: 7053490,
      crunched: 0,
      end: 7142991,
      filename: "/lib/python3.6/site-packages/numpy/distutils/system_info.py"
    }, {
      audio: 0,
      start: 7142991,
      crunched: 0,
      end: 7144982,
      filename: "/lib/python3.6/site-packages/numpy/distutils/msvccompiler.py"
    }, {
      audio: 0,
      start: 7144982,
      crunched: 0,
      end: 7147328,
      filename: "/lib/python3.6/site-packages/numpy/distutils/environment.py"
    }, {
      audio: 0,
      start: 7147328,
      crunched: 0,
      end: 7160571,
      filename: "/lib/python3.6/site-packages/numpy/distutils/npy_pkg_config.py"
    }, {
      audio: 0,
      start: 7160571,
      crunched: 0,
      end: 7160789,
      filename: "/lib/python3.6/site-packages/numpy/distutils/compat.py"
    }, {
      audio: 0,
      start: 7160789,
      crunched: 0,
      end: 7163756,
      filename: "/lib/python3.6/site-packages/numpy/distutils/extension.py"
    }, {
      audio: 0,
      start: 7163756,
      crunched: 0,
      end: 7173465,
      filename: "/lib/python3.6/site-packages/numpy/distutils/conv_template.py"
    }, {
      audio: 0,
      start: 7173465,
      crunched: 0,
      end: 7174165,
      filename: "/lib/python3.6/site-packages/numpy/distutils/numpy_distribution.py"
    }, {
      audio: 0,
      start: 7174165,
      crunched: 0,
      end: 7177677,
      filename: "/lib/python3.6/site-packages/numpy/distutils/lib2def.py"
    }, {
      audio: 0,
      start: 7177677,
      crunched: 0,
      end: 7181968,
      filename: "/lib/python3.6/site-packages/numpy/distutils/intelccompiler.py"
    }, {
      audio: 0,
      start: 7181968,
      crunched: 0,
      end: 7184713,
      filename: "/lib/python3.6/site-packages/numpy/distutils/log.py"
    }, {
      audio: 0,
      start: 7184713,
      crunched: 0,
      end: 7189869,
      filename: "/lib/python3.6/site-packages/numpy/distutils/unixccompiler.py"
    }, {
      audio: 0,
      start: 7189869,
      crunched: 0,
      end: 7272148,
      filename: "/lib/python3.6/site-packages/numpy/distutils/misc_util.py"
    }, {
      audio: 0,
      start: 7272148,
      crunched: 0,
      end: 7280331,
      filename: "/lib/python3.6/site-packages/numpy/distutils/core.py"
    }, {
      audio: 0,
      start: 7280331,
      crunched: 0,
      end: 7288161,
      filename: "/lib/python3.6/site-packages/numpy/distutils/from_template.py"
    }, {
      audio: 0,
      start: 7288161,
      crunched: 0,
      end: 7290419,
      filename: "/lib/python3.6/site-packages/numpy/distutils/msvc9compiler.py"
    }, {
      audio: 0,
      start: 7290419,
      crunched: 0,
      end: 7291719,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__config__.py"
    }, {
      audio: 0,
      start: 7291719,
      crunched: 0,
      end: 7291870,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__version__.py"
    }, {
      audio: 0,
      start: 7291870,
      crunched: 0,
      end: 7292481,
      filename: "/lib/python3.6/site-packages/numpy/distutils/setup.py"
    }, {
      audio: 0,
      start: 7292481,
      crunched: 0,
      end: 7315496,
      filename: "/lib/python3.6/site-packages/numpy/distutils/cpuinfo.py"
    }, {
      audio: 0,
      start: 7315496,
      crunched: 0,
      end: 7344043,
      filename: "/lib/python3.6/site-packages/numpy/distutils/ccompiler.py"
    }, {
      audio: 0,
      start: 7344043,
      crunched: 0,
      end: 7369244,
      filename: "/lib/python3.6/site-packages/numpy/distutils/mingw32ccompiler.py"
    }, {
      audio: 0,
      start: 7369244,
      crunched: 0,
      end: 7377907,
      filename: "/lib/python3.6/site-packages/numpy/distutils/exec_command.py"
    }, {
      audio: 0,
      start: 7377907,
      crunched: 0,
      end: 7378995,
      filename: "/lib/python3.6/site-packages/numpy/distutils/__init__.py"
    }, {
      audio: 0,
      start: 7378995,
      crunched: 0,
      end: 7379774,
      filename: "/lib/python3.6/site-packages/numpy/distutils/pathccompiler.py"
    }, {
      audio: 0,
      start: 7379774,
      crunched: 0,
      end: 7379931,
      filename: "/lib/python3.6/site-packages/numpy/distutils/info.py"
    }, {
      audio: 0,
      start: 7379931,
      crunched: 0,
      end: 7397941,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/config.py"
    }, {
      audio: 0,
      start: 7397941,
      crunched: 0,
      end: 7398855,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_data.py"
    }, {
      audio: 0,
      start: 7398855,
      crunched: 0,
      end: 7400065,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_py.py"
    }, {
      audio: 0,
      start: 7400065,
      crunched: 0,
      end: 7401380,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_clib.py"
    }, {
      audio: 0,
      start: 7401380,
      crunched: 0,
      end: 7405759,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/config_compiler.py"
    }, {
      audio: 0,
      start: 7405759,
      crunched: 0,
      end: 7436705,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_src.py"
    }, {
      audio: 0,
      start: 7436705,
      crunched: 0,
      end: 7438436,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_scripts.py"
    }, {
      audio: 0,
      start: 7438436,
      crunched: 0,
      end: 7441563,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install.py"
    }, {
      audio: 0,
      start: 7441563,
      crunched: 0,
      end: 7443611,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/autodist.py"
    }, {
      audio: 0,
      start: 7443611,
      crunched: 0,
      end: 7444598,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/egg_info.py"
    }, {
      audio: 0,
      start: 7444598,
      crunched: 0,
      end: 7446216,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build.py"
    }, {
      audio: 0,
      start: 7446216,
      crunched: 0,
      end: 7459605,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_clib.py"
    }, {
      audio: 0,
      start: 7459605,
      crunched: 0,
      end: 7484869,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/build_ext.py"
    }, {
      audio: 0,
      start: 7484869,
      crunched: 0,
      end: 7485510,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/develop.py"
    }, {
      audio: 0,
      start: 7485510,
      crunched: 0,
      end: 7486495,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/install_headers.py"
    }, {
      audio: 0,
      start: 7486495,
      crunched: 0,
      end: 7487593,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/__init__.py"
    }, {
      audio: 0,
      start: 7487593,
      crunched: 0,
      end: 7488368,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/bdist_rpm.py"
    }, {
      audio: 0,
      start: 7488368,
      crunched: 0,
      end: 7489167,
      filename: "/lib/python3.6/site-packages/numpy/distutils/command/sdist.py"
    }, {
      audio: 0,
      start: 7489167,
      crunched: 0,
      end: 7490947,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/mips.py"
    }, {
      audio: 0,
      start: 7490947,
      crunched: 0,
      end: 7492074,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/pathf95.py"
    }, {
      audio: 0,
      start: 7492074,
      crunched: 0,
      end: 7498847,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/intel.py"
    }, {
      audio: 0,
      start: 7498847,
      crunched: 0,
      end: 7503060,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/pg.py"
    }, {
      audio: 0,
      start: 7503060,
      crunched: 0,
      end: 7508627,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/absoft.py"
    }, {
      audio: 0,
      start: 7508627,
      crunched: 0,
      end: 7509451,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/none.py"
    }, {
      audio: 0,
      start: 7509451,
      crunched: 0,
      end: 7529214,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/gnu.py"
    }, {
      audio: 0,
      start: 7529214,
      crunched: 0,
      end: 7530859,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/sun.py"
    }, {
      audio: 0,
      start: 7530859,
      crunched: 0,
      end: 7532278,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/hpux.py"
    }, {
      audio: 0,
      start: 7532278,
      crunched: 0,
      end: 7535713,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/ibm.py"
    }, {
      audio: 0,
      start: 7535713,
      crunched: 0,
      end: 7537109,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/g95.py"
    }, {
      audio: 0,
      start: 7537109,
      crunched: 0,
      end: 7539717,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/nag.py"
    }, {
      audio: 0,
      start: 7539717,
      crunched: 0,
      end: 7543826,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/compaq.py"
    }, {
      audio: 0,
      start: 7543826,
      crunched: 0,
      end: 7545219,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/lahey.py"
    }, {
      audio: 0,
      start: 7545219,
      crunched: 0,
      end: 7546952,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/vast.py"
    }, {
      audio: 0,
      start: 7546952,
      crunched: 0,
      end: 7586299,
      filename: "/lib/python3.6/site-packages/numpy/distutils/fcompiler/__init__.py"
    }, {
      audio: 0,
      start: 7586299,
      crunched: 0,
      end: 7666736,
      filename: "/lib/python3.6/site-packages/numpy/linalg/linalg.py"
    }, {
      audio: 0,
      start: 7666736,
      crunched: 0,
      end: 7668614,
      filename: "/lib/python3.6/site-packages/numpy/linalg/setup.py"
    }, {
      audio: 0,
      start: 7668614,
      crunched: 0,
      end: 9131048,
      filename: "/lib/python3.6/site-packages/numpy/linalg/_umath_linalg.so"
    }, {
      audio: 0,
      start: 9131048,
      crunched: 0,
      end: 10500766,
      filename: "/lib/python3.6/site-packages/numpy/linalg/lapack_lite.so"
    }, {
      audio: 0,
      start: 10500766,
      crunched: 0,
      end: 10503098,
      filename: "/lib/python3.6/site-packages/numpy/linalg/__init__.py"
    }, {
      audio: 0,
      start: 10503098,
      crunched: 0,
      end: 10504296,
      filename: "/lib/python3.6/site-packages/numpy/linalg/info.py"
    }, {
      audio: 0,
      start: 10504296,
      crunched: 0,
      end: 10504426,
      filename: "/lib/python3.6/site-packages/numpy/testing/noseclasses.py"
    }, {
      audio: 0,
      start: 10504426,
      crunched: 0,
      end: 10507131,
      filename: "/lib/python3.6/site-packages/numpy/testing/print_coercion_tables.py"
    }, {
      audio: 0,
      start: 10507131,
      crunched: 0,
      end: 10507420,
      filename: "/lib/python3.6/site-packages/numpy/testing/nosetester.py"
    }, {
      audio: 0,
      start: 10507420,
      crunched: 0,
      end: 10507548,
      filename: "/lib/python3.6/site-packages/numpy/testing/decorators.py"
    }, {
      audio: 0,
      start: 10507548,
      crunched: 0,
      end: 10508474,
      filename: "/lib/python3.6/site-packages/numpy/testing/utils.py"
    }, {
      audio: 0,
      start: 10508474,
      crunched: 0,
      end: 10509151,
      filename: "/lib/python3.6/site-packages/numpy/testing/setup.py"
    }, {
      audio: 0,
      start: 10509151,
      crunched: 0,
      end: 10509626,
      filename: "/lib/python3.6/site-packages/numpy/testing/__init__.py"
    }, {
      audio: 0,
      start: 10509626,
      crunched: 0,
      end: 10524225,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/noseclasses.py"
    }, {
      audio: 0,
      start: 10524225,
      crunched: 0,
      end: 10544787,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/nosetester.py"
    }, {
      audio: 0,
      start: 10544787,
      crunched: 0,
      end: 10553378,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/decorators.py"
    }, {
      audio: 0,
      start: 10553378,
      crunched: 0,
      end: 10628812,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/utils.py"
    }, {
      audio: 0,
      start: 10628812,
      crunched: 0,
      end: 10647098,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/parameterized.py"
    }, {
      audio: 0,
      start: 10647098,
      crunched: 0,
      end: 10647098,
      filename: "/lib/python3.6/site-packages/numpy/testing/nose_tools/__init__.py"
    }],
    remote_package_size: 10647098,
    package_uuid: "13bb1f37-7d13-4bcb-b70c-51ece3c5f3a4"
  })
})();