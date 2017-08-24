const ActivationFunction = require('../Utils/activation');
const zeros = require('../Utils/zeros');
const randomW = require('../Utils/randomWeights');
const toMatrix = require('../Utils/toArray');


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

    run(input) {
        let sum = 0;
        if (!Array.isArray(input)) {
            input = toMatrix.toArray(input);
        }
        for (let j = 0; j < input.length; j++) {

            sum += this.weights[j] * input[j];

        }
        return ActivationFunction[this.activation](sum);
    }

    train(input, output) {
        let totalError = 1;
        let iterations = 0;

        this.input = input;
        this.output = output;

        this.input = toMatrix.toMatrix(this.input);
        this.output = toMatrix.toMatrix(this.output);

        while (totalError !== 0) {
            totalError = 0;
            for (let i = 0; i < this.output.length; i++) {

                let calculatedOutput = this.run(this.input[i]);
                let error = this.output[i][0] - calculatedOutput;

                totalError += error;

                //calculate the weights according to the error and learning rate
                for (let j = 0; j < this.weights.length; j++) {
                    this.weights[j] += this.options.learningRate * this.input[i][j] * error;
                }
            }
            iterations++;
        }
        this.options.iterations = iterations;
        this.error = Math.abs(totalError);
    }
}

module.exports = Perceptron;