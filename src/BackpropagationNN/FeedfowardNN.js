'use strict'
//feedfoward backpropagation Neural Network
const Layer = require('./layer');
const zeros = require('../Utils/zeros');
const matrix = require('../Utils/matrix');
const convert = require('../Utils/conversions');

class FeedfowardNeuralNetwork {
    constructor(options) {
        const defaults = {
            inputSize: 3,
            hiddenSize: 2,
            outputSize: 1,
            activation: 'sigmoid',
            learningRate: 0.03,
            iterations: 100,
            momentum: 0.6
        };
        this.options = defaults;
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.layers = [];
        this.error = null;
        //Layer that contains the edges between the input neurons and the hidden neurons
        this.layers.push(new Layer(this.options.inputSize, 3, this.options.activation));
        //Layer that contains the edges between the hidden neurons and the output neurons
        this.layers.push(new Layer(3, this.options.outputSize, this.options.activation));
    }

    getConfiguration() {
        return this.options;
    }

    predict(input) {
        var output = input;
        for (var i = 0; i < this.layers.length; i++) {
            //produce output for each layer based on the input
            output = this.layers[i].run(output);
        }
        //return the normalized output produced by the neural network
        return output;
    }

    train(inputs, outputs) {
        let counter = 0;
        let loss = 0;
        while (counter <= this.options.iterations) {
            for (let i = 0; i < outputs.length; i++) {
                //get output from the neural network
                const prediction = this.predict(inputs[i]);
                loss = this.loss(prediction, outputs[i]);
                loss = this.backward(loss);
            }
            counter++;
            this.error = loss;
            console.log("Step: " + counter + ", Loss: " + Math.abs(this.error[this.error.length - 1]));
        }
        //set the new error to the neural net class
    }

    loss(prediction, y) {
        let loss = zeros(prediction.length);
        for (let x = 0; x < loss.length; x++) {
            loss[x] = y - prediction[x];
        }

        return loss;
    }

    backward(loss) {
        for (var y = this.layers.length - 1; y >= 0; y--) {
            if (this.layers[y]) {
                //train the layers using the calculated error
                loss = this.layers[y].optimize(loss, this.options.learningRate, this.options.momentum);
            }
        }
        return loss;
    }

    getMetrics() {
        return "Loss: " + Math.abs(this.error[this.error.length - 1]);
    }
}

module.exports = FeedfowardNeuralNetwork;