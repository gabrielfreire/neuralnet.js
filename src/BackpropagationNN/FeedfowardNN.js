'use strict'
//feedfoward backpropagation Neural Network
const Layer = require('./layer');
const zeros = require('../Utils/zeros');
const Matrix = require('../Utils/matrix');
const convert = require('../Utils/conversions');

class FeedfowardNeuralNetwork {
    constructor(options) {
        const defaults = {
            inputSize: 3,
            hiddenSize: 2,
            outputSize: 1,
            activation: 'sigmoid',
            learningRate: 0.03,
            iterations: 1000,
            momentum: 0.6
        };
        this.options = defaults;
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.layers = [];
        this.error = null;
        this.counter = 0;
        this.loss = [0];
        //Layer that contains the edges between the input neurons and the hidden neurons
        // this.layers.push(new Layer(this.options.inputSize, this.options.hiddenSize, this.options.activation));
        //Layer that contains the edges between the hidden neurons and the output neurons
        // this.layers.push(new Layer(this.options.hiddenSize, this.options.outputSize, this.options.activation));
    }

    Layer(options) {
        return new Layer(options);
    }

    add(layer) {
        this.layers.push(layer);
    }

    getConfiguration() {
        return this.options;
    }

    train(inputs, outputs, learningRate, epochs) {
        //get output from the neural network
        inputs = Matrix.fromArray(inputs);
        outputs = Matrix.fromArray(outputs);
        const prediction = this.feedFoward(inputs);
        this.loss = Matrix.subtract(outputs, prediction);
        this.backPropagate(learningRate);
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

    getMetrics() {
        return "Loss: " + Math.abs(this.loss[this.loss.length - 1]);
    }
}

module.exports = FeedfowardNeuralNetwork;