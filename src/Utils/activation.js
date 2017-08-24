class ActivationFunction {
    constructor() {}

    sigmoid(x, isDerivative) {
        if (!isDerivative) {
            return 1 / (1 + Math.exp(-x));
        }
        return x * (1 - x);
    }

    step(x) {
        if (x >= 1) {
            return 1;
        }
        return 0;
    }
}

module.exports = new ActivationFunction();