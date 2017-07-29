var ActivationFunction = require('../Utils/activation');
var zeros = require('../Utils/zeros');
var randomW = require('../Utils/randomWeights');
var toMatrixArray = require('../Utils/toArray');

function Perceptron(options) {
    this.options = defaults;
    if (options) {
        this.options = Object.assign(this.options, options);
    }
    this.error = null;
    this.input = null;
    this.output = null;
    this.weights = zeros(this.options.inputSize);
    this.activation = this.options.activation ? this.options.activation : 'step';

}

var perceptron = {
    getConfiguration: function() {
        return this.options;
    },
    run: function(input) {
        var sum = 0;
        for (var j = 0; j < input.length; j++) {
            sum += this.weights[j] * input[j];
        }
        sum = ActivationFunction[this.activation](sum, false);
        return sum;
    },
    train: function(input, output) {
        var totalError = 1;
        this.input = input;
        this.output = output;

        this.input = toMatrix(this.input);
        this.output = toMatrix(this.output);
        while (totalError !== 0) {
            for (var i = 0; i < this.output.length; i++) {

                var calculatedOutput = this.run(this.input[i]);
                var error = this.output[i] - calculatedOutput;
                totalError = error;

                //calculate the weights according to the error and learning rate
                for (var j = 0; j < this.weights.length; j++) {
                    this.weights[j] += this.options.learningRate * this.input[i][j] * error;
                }
            }
        }
        this.error = totalError;
    }
}

Perceptron.prototype = perceptron;

var defaults = {
    learningRate: 0.1,
    activation: 'step',
    iterations: 200000,
    inputSize: 3,
    outputSize: 1
}

module.exports = Perceptron;