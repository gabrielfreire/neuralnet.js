function ActivationFunction() {
    //TODO
    //implement reLu
}

var af = {
    sigmoid: function(x) {
        return 1 / (1 + Math.exp(-x));
    },
    //derivative of the sigmoid
    dSigmoid: function(x) {
        return x * (1 - x);
    }

    //TODO
    //relu: function(){}
    //softmax: function(){}
}
ActivationFunction.prototype = af;

module.exports = new ActivationFunction();