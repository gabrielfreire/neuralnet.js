"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matrix_1 = require("../Utils/matrix");
const activation_1 = require("./../Utils/activation");
class Perceptron {
    constructor(options) {
        const defaults = {
            learningRate: 0.1,
            activation: 'step',
            iterations: 300,
            inputSize: 3,
            outputSize: 1
        };
        this.options = defaults;
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.error = null;
        this.input = null;
        this.output = null;
        this.weights = new matrix_1.Matrix(this.options.inputSize, this.options.outputSize);
        this.weights.randomize();
        console.log('STARTING WEIGHTS', this.weights.data);
        const acvt = new activation_1.ActivationFunction();
        this.activation = this.options.activation ? acvt[this.options.activation] : acvt['sigmoid'];
    }
    getConfiguration() {
        return this.options;
    }
    predict(input, training) {
        let output;
        if (!(input instanceof matrix_1.Matrix)) {
            input = new matrix_1.Matrix(input.length, input[0].length).map((_, i, j) => input[i][j]);
        }
        output = matrix_1.Matrix.multiply(input, this.weights);
        return matrix_1.Matrix.map(output, (e, i, j) => this.activation['sigmoid'](e));
    }
    train(input, output) {
        var epoch = 0;
        this.input = new matrix_1.Matrix(input.length, input[0].length).map((e, i, j) => input[i][j]);
        this.output = new matrix_1.Matrix(output.length, output[0].length).map((e, i, j) => output[i][j]);
        while (epoch < this.options.iterations) {
            var predictions = matrix_1.Matrix.multiply(this.input, this.weights)
                .map((e, i, j) => this.activation['sigmoid'](e));
            var loss = matrix_1.Matrix.subtract(this.output, predictions);
            // get gradient
            var gradients = matrix_1.Matrix.multiply(this.input, loss)
                .multiply(this.options.learningRate);
            // update the weights
            this.weights.add(gradients);
            // this.error = Math.abs(loss);
            epoch++;
        }
    }
}
exports.Perceptron = Perceptron;
