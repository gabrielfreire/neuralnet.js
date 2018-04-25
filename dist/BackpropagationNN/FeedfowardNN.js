"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//feedfoward backpropagation Neural Network
const layer_1 = require("./layer");
const matrix_1 = require("../Utils/matrix");
class FeedfowardNeuralNetwork {
    constructor(options) {
        const defaults = {
            verbose: false
        };
        this.options = defaults;
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.layers = [];
    }
    Layer(options) {
        return new layer_1.Layer(options);
    }
    add(layer) {
        this.layers.push(layer);
    }
    getConfiguration() {
        return this.options;
    }
    train(inputs, outputs, learningRate) {
        //get output from the neural network
        let inputs_m = matrix_1.Matrix.fromArray(inputs);
        let outputs_m = matrix_1.Matrix.fromArray(outputs);
        const prediction = this.feedFoward(inputs_m);
        this.loss = matrix_1.Matrix.subtract(outputs_m, prediction);
        this.backPropagate(learningRate);
        if (this.options.verbose)
            console.info(this.getMetrics());
    }
    predict(input) {
        return this.feedFoward(input).toArray();
    }
    feedFoward(input) {
        var output = input;
        for (var i = 0; i < this.layers.length; i++) {
            //produce output for each layer based on the input
            output = this.layers[i].run(output);
        }
        //return the normalized output produced by the neural network
        return output;
    }
    backPropagate(learningRate) {
        for (var y = this.layers.length - 1; y >= 0; y--) {
            if (this.layers[y]) {
                //train the layers using the calculated error
                this.loss = this.layers[y].optimize(this.loss, learningRate);
            }
        }
    }
    getCurrentLoss() {
        return this.loss.data[this.loss.data.length - 1][0];
    }
    getMetrics() {
        return "Loss: " + this.loss.data[this.loss.data.length - 1];
    }
}
exports.FeedfowardNeuralNetwork = FeedfowardNeuralNetwork;
