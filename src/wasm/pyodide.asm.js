var pyodide = function(pyodide) {
  pyodide = pyodide || {};
  





  return pyodide;
};
if (typeof exports === 'object' && typeof module === 'object')
    module.exports = pyodide;
  else if (typeof define === 'function' && define['amd'])
    define([], function() { return pyodide; });
  else if (typeof exports === 'object')
    exports["pyodide"] = pyodide;
  