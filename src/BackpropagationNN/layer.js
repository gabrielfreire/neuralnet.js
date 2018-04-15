'use strict'

const ActivationFunction = require('../Utils/activation');
const zeros = require('../Utils/zeros');
const randomWeights = require('../Utils//randomWeights');
const Matrix = require('../Utils/matrix');
//Types [FEED_FORWARD, RECURRENT, CONVOLUTIONAL, SUBSAMPLING, RECURSIVE, MULTILAYER, NORMALIZATION]
class Layer {
    constructor(options) {
        console.log(options);
        this.options = options;
        this.inputLength = options.input;
        this.input = new Matrix(options.input, 1);
        this.output = new Matrix(options.output, 1);
        this.weights = new Matrix(options.output, options.input);
        this.weights_delta = new Matrix(options.output, options.input); //change of weights in the previous iterations
        this.bias = new Matrix(options.output, 1);
        this.weights.randomize();
        this.bias.randomize();
        // this.dWeights = zeros((options.input + 1) * options.output); //change of weights in the previous iterations
        this.activation = options.activation ? options.activation : 'sigmoid';
    }

    run(input) {
        /**
         * Matrix version
         */
        if(!(input instanceof Matrix)) {
            this.input = Matrix.fromArray(input);
        } else {
            this.input = input;
        }
        this.output = Matrix.multiply(this.weights, this.input);
        this.output.add(this.bias);
        this.output.map((e, i, j) => ActivationFunction[this.activation](e));
        return this.output;
        //the offset variable helps with the distribution of weights for each input
        // this.input = input.slice();
        // let bias = 1;
        // var offset = 0;
        // for (var i = 0; i < this.output.length; i++) {
        //     for (var j = 0; j < this.input.length; j++) {
        //         //calculate the output based on the input and its weights
        //         this.output[i] += (this.weights[offset + j] * this.input[j]) + bias;
        //     }
        //     //normalize the output using the sigmoid activation function
        //     this.output[i] = ActivationFunction[this.activation](this.output[i], false);
        //     offset += this.input.length;
        // }
        // //and return a copy of the output from the neural network
        // return this.output.slice();
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
        this.weights_delta = Matrix.multiply(gradients,input_T);
        this.weights.add(this.weights_delta);
        this.bias.add(gradients);
        return nextLoss;
    }
}

module.exports = Layer;