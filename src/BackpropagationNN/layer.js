'use strict'

const ActivationFunction = require('../Utils/activation');
const Matrix = require('../Utils/matrix');
//Types [FEED_FORWARD, RECURRENT, CONVOLUTIONAL, SUBSAMPLING, RECURSIVE, MULTILAYER, NORMALIZATION]
class Layer {
    constructor(options) {
        this.options = options;
        this.inputLength = options.input;
        this.input = new Matrix(options.input, 1);
        this.output = new Matrix(options.output, 1);
        this.weights = new Matrix(options.output, options.input);
        this.weights_delta = new Matrix(options.output, options.input); //change of weights in the previous iterations
        this.bias = new Matrix(options.output, 1);
        this.activation = options.activation ? options.activation : 'sigmoid';
        this.weights.randomize();
        this.bias.randomize();
    }

    run(input) {
        if(!(input instanceof Matrix)) {
            this.input = Matrix.fromArray(input);
        } else {
            this.input = input;
        }
        // Y = SIGMOID(WX + b)
        this.output = Matrix.multiply(this.weights, this.input).add(this.bias);
        return  this.output.map((e, i, j) => ActivationFunction[this.activation](e));
    }

    optimize(loss, learningRate) {
        let nextLoss = new Matrix(this.options.input, 1);
        // Calculate Gradient
        // GRADIENT = LEARNING_RATE * LOSS * SIGMOID(OUTPUT_DERIVATIVE)
        let gradients = this.output.map((e, i, j) => ActivationFunction[this.activation](e, true));
        gradients.multiply(loss);
        gradients.multiply(learningRate);
        //calculate the previous layer loss
        let weight_T = Matrix.transpose(this.weights);
        nextLoss = Matrix.multiply(weight_T, gradients);
        // Update weights
        let input_T = Matrix.transpose(this.input);
        this.weights_delta = Matrix.multiply(gradients, input_T);
        this.weights.add(this.weights_delta);
        // Update bias by the gradient
        this.bias.add(gradients);
        // send loss for previous layer
        return nextLoss;
    }
}

module.exports = Layer;