var matrix = require('./matrix');


function toMatrix(objArray) {
    var _matrix, propCount = 0,
        objCount = objArray.length;

    //count the properties of the first object assuming all are the same size
    for (var key in objArray[0]) {
        ++propCount;
    }
    //check matrix proportionality
    if (propCount === objCount) {
        _matrix = matrix(objCount); //matrix is proportional
        for (var i = 0; i < _matrix.length; i++) {
            var offset = 0;
            for (var key in objArray[i]) {
                _matrix[i][offset] = objArray[i][key];
                offset++;
            }
        }
    } else {
        _matrix = matrix(objCount, propCount); //matrix is not proportional
        for (var i = 0; i < _matrix.length; i++) {
            var offset = 0;
            for (var key in objArray[i]) {
                _matrix[i][offset] = objArray[i][key];
                offset++;
            }
        }
    }
    return _matrix;
}

module.exports = toMatrix;