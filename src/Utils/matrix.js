/**
 * Create a Matrix with 0s
 * @param {Number} rowSize 
 * @param {Number} colSize
 * @return [ [0, 0, 0], [0, 0, 0], [0, 0, 0] ] Matrix 
 */
//Create a Matrix with 0s
function matrix(rowSize, colSize) {
    var colSize = colSize;
    if (!colSize) {
        colSize = rowSize;
    }
    //Declare the matrix
    var matrix = new Array(rowSize);
    for (var i = 0; i < rowSize; i++) {
        matrix[i] = new Array(colSize);
    }
    //Add 0s
    for (var i = 0; i < rowSize; i++) {
        for (var j = 0; j < colSize; j++) {
            matrix[i][j] = 0;
        }
    }

    return matrix;
}
//TODO better performance solution
module.exports = matrix;