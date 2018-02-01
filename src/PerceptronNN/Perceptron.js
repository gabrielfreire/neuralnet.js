const ActivationFunction = require('../Utils/activation');
const zeros = require('../Utils/zeros');
const randomW = require('../Utils/randomWeights');
const convert = require('../Utils/conversions');


class Perceptron {
    constructor(options) {
        const defaults = {
            learningRate: 0.1,
            activation: 'step',
            iterations: 0,
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
        this.weights = zeros(this.options.inputSize);
        this.activation = this.options.activation ? this.options.activation : 'step';
    }

    getConfiguration() {
        return this.options;
    }

    predict(input) {
        let sum = 0;
        if (!Array.isArray(input)) {
            input = convert.toArray(input);
        }
        //TODO vector multiplication method
        for (var j = 0; j < input.length; j++) {
            sum += this.weights[j] * input[j];
        }
        return ActivationFunction[this.activation](sum);
    }

    train(input, output) {
        var totalError = 1;
        var iterations = 0;

        this.input = input;
        this.output = output;

        this.input = convert.toMatrix(this.input);
        this.output = convert.toMatrix(this.output);

        while (totalError !== 0) {
            totalError = 0;
            for (var i = 0; i < this.output.length; i++) {

                var prediction = this.predict(this.input[i]);
                var loss = this.output[i][0] - prediction;

                totalLoss += loss;

                //calculate the weights according to the loss and learning rate
                for (var j = 0; j < this.weights.length; j++) {
                    this.weights[j] += this.options.learningRate * this.input[i][j] * loss;
                }
            }
            iterations++;
        }
        this.options.iterations = iterations;
        this.error = Math.abs(totalLoss);
    }
}

module.exports = Perceptron;