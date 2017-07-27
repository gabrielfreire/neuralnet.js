function ActivationFunction() {
    //TODO
    //implement reLu
}

var af = {
    sigmoid: function(x, isDerivative) {
        if (!isDerivative) {
            return 1 / (1 + Math.exp(-x));
        }
        return x * (1 - x);
    },

    //TODO
    //relu: function(){}
    //softmax: function(){}
}
ActivationFunction.prototype = af;

module.exports = new ActivationFunction();