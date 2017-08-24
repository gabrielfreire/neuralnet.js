const ActivationFunction = require('../Utils/activation');
const zeros = require('../Utils/zeros');
const randomW = require('../Utils/randomWeights');
const toMatrix = require('../Utils/toArray');
var defaults = {
    learningRate: 0.1,
    activation: 'step',
    iterations: 0,
    inputSize: 3,
    outputSize: 1
};

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
        if (!Array.isArray(input)) {
            input = toMatrix.toArray(input);
        }
        //TODO vector multiplication method
        for (var j = 0; j < input.length; j++) {
            sum += this.weights[j] * input[j];
        }
        return ActivationFunction[this.activation](sum);;
    },
    train: function(input, output) {
        var totalError = 1,
            iterations = 0;

        this.input = input;
        this.output = output;

        this.input = toMatrix.toMatrix(this.input);
        this.output = toMatrix.toMatrix(this.output);

        while (totalError !== 0) {
            totalError = 0;
            for (var i = 0; i < this.output.length; i++) {

                var calculatedOutput = this.run(this.input[i]),
                    error = this.output[i][0] - calculatedOutput;

                totalError += error;

                //calculate the weights according to the error and learning rate
                for (var j = 0; j < this.weights.length; j++) {
                    this.weights[j] += this.options.learningRate * this.input[i][j] * error;
                }
            }
            iterations++;
        }
        this.options.iterations = iterations;
        this.error = totalError;
    }
}

Perceptron.prototype = perceptron;

module.exports = Perceptron;