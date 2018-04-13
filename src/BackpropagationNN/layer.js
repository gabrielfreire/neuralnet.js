'use strict'

const ActivationFunction = require('../Utils/activation');
const zeros = require('../Utils/zeros');
const randomWeights = require('../Utils//randomWeights');
// const Matrix = require('../Utils/matrix');

//Types [FEED_FORWARD, RECURRENT, CONVOLUTIONAL, SUBSAMPLING, RECURSIVE, MULTILAYER, NORMALIZATION]
class Layer {
    constructor(options) {
        this.input = zeros(options.input + 1);
        this.output = zeros(options.output);
        this.weights = randomWeights((options.input + 1) * options.output);
        this.dWeights = zeros(this.weights.length);
        this.bias = 1;
        this.activation = options.activation ? options.activation : 'sigmoid';
    }

    run(input) {
        this.input = input.slice();
        // let bias = 1;
        //the offset variable helps with the distribution of weights for each input
        let offset = 0;
        // this.output = Matrix.multiply(this.weights, this.input);
        for (var i = 0; i < this.output.length; i++) {
            for (var j = 0; j < this.input.length; j++) {
                //calculate the output based on the input and its weights
                this.output[i] += (this.weights[offset + j] * this.input[j]) + 1;
            }
            //normalize the output using the sigmoid activation function
            this.output[i] = ActivationFunction[this.activation](this.output[i], false);
            offset += this.input.length;
        }
        return this.output.slice();
        //and return a copy of the output from the neural network
        // return this.output.slice();
    }

    optimize(loss, learningRate, momentum) {
        //the offset variable helps with the distribution of weights for each input
        var offset = 0;
        var nextLoss = zeros(this.input.length);
        for (var i = 0; i < this.output.length; i++) {
            //calculate the delta parameter
            var delta = loss[i] * ActivationFunction[this.activation](this.output[i], true)
            for (var j = 0; j < this.input.length; j++) {
                var weightIndex = offset + j;
                //calculate the next loss
                nextLoss[j] += this.weights[weightIndex] * delta;
                /**
                 * --------------------------
                 * Mathematical representation of weight adjustments
                 * --------------------------
                 * Δw(t): current weight
                 * α: learningRate
                 * (Δ*input): gradient
                 * μ: momentum
                 * Δw(t - 1): previous weight
                 * --------------------------
                 *  adjust the weights
                 * Δw(t) = α * (Δ*input) + μ * Δw(t - 1) < the following code represents this formula 
                 */
                let dw = this.input[j] * delta * learningRate;
                this.weights[weightIndex] += this.dWeights[weightIndex] * momentum + dw;
                this.dWeights[weightIndex] = dw;

            }
            offset += this.input.length;
        }

        //return the next loss
        return nextLoss;
    }
}

module.exports = Layer;