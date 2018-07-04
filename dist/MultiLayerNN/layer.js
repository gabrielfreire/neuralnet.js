"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const activation_1 = require("../Utils/activation");
const matrix_1 = require("../Utils/matrix");
//Types [FEED_FORWARD, RECURRENT, CONVOLUTIONAL, SUBSAMPLING, RECURSIVE, MULTILAYER, NORMALIZATION]
class Layer {
    constructor(options) {
        this.options = options;
        this.input = new matrix_1.Matrix(options.input, 1);
        this.output = new matrix_1.Matrix(options.output, 1);
        this.weights = new matrix_1.Matrix(options.output, options.input);
        this.weights_delta = new matrix_1.Matrix(options.output, options.input); //change of weights in the previous iterations
        this.bias = new matrix_1.Matrix(options.output, 1);
        this.activation = options.activation ? activation_1.ActivationFunction[options.activation] : activation_1.ActivationFunction['sigmoid'];
        this.weights.randomize();
        this.bias.randomize();
    }
    run(input) {
        if (!(input instanceof matrix_1.Matrix)) {
            this.input = matrix_1.Matrix.fromArray(input);
        }
        else {
            this.input = input;
        }
        // Y = SIGMOID(WX + b)
        this.output = matrix_1.Matrix.multiply(this.weights, this.input).add(this.bias);
        return this.output.map((e, i, j) => this.activation(e));
    }
    optimize(loss, learningRate) {
        let nextLoss = new matrix_1.Matrix(this.options.input, 1);
        // Calculate Gradient
        // OUTPUT_DERIVATIVE = SIGMOID(LAST_OUTPUT)
        // GRADIENT = LEARNING_RATE * LOSS * SIGMOID(OUTPUT_DERIVATIVE)
        let gradients = this.output.map((e, i, j) => this.activation(e, true));
        gradients.multiply(loss);
        gradients.multiply(learningRate);
        //calculate the previous layer loss
        let weight_T = matrix_1.Matrix.transpose(this.weights);
        nextLoss = matrix_1.Matrix.multiply(weight_T, gradients);
        // Update weights
        let input_T = matrix_1.Matrix.transpose(this.input);
        this.weights_delta = matrix_1.Matrix.multiply(gradients, input_T);
        this.weights.add(this.weights_delta);
        // Update bias by the gradient
        this.bias.add(gradients);
        // send loss for previous layer
        return nextLoss;
    }
}
exports.Layer = Layer;
