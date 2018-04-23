'use strict'
//feedfoward backpropagation Neural Network
const Layer = require('./layer');
const Matrix = require('../Utils/matrix');

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
        this.loss = [0];
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
        if(this.options.verbose) console.info(this.getMetrics());
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

    getMetrics() {
        return "Loss: " + this.loss.data[this.loss.data.length - 1];
    }
}

module.exports = FeedfowardNeuralNetwork;