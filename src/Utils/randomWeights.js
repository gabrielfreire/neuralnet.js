function randomW(size) {
    var weights = [];
    for (var i = 0; i < size; i++) {
        weights[i] = Math.random() * 2 - 2 + 2
    }
    return weights;
}

module.exports = randomW;