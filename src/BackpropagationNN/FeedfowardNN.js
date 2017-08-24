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
            learningRate: 0.3,
            iterations: 50000,
            momentum: 0.6
        };
        this.options = defaults;
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.layers = [];
        this.error = null;
        //Layer that contains the edges between the input neurons and the hidden neurons
        this.layers.push(new Layer(this.options.inputSize, this.options.hiddenSize, this.options.activation));
        //Layer that contains the edges between the hidden neurons and the output neurons
        this.layers.push(new Layer(this.options.hiddenSize, this.options.outputSize, this.options.activation));
    }

    getConfiguration() {
        return this.options;
    }

    getLayer(index) {
        return this.layers[index];
    }

    run(input) {
        var activations = input;
        for (var i = 0; i < this.layers.length; i++) {
            //produce output for each layer based on the input
            activations = this.layers[i].run(activations);
        }
        //return the normalized output produced by the neural network
        return activations;
    }

    train(trainingData) {
        var counter = 0;
        var error = 0;
        var processedData = this.processData(trainingData);
        var outputs = processedData.output;
        var inputs = processedData.input;

        while (counter <= this.options.iterations) {
            for (var i = 0; i < outputs.length; i++) {
                //get output from the neural network
                var calculatedOutput = this.run(inputs[i]);
                error = zeros(calculatedOutput.length);

                for (var x = 0; x < error.length; x++) {
                    //calculate the error
                    error[x] = outputs[i] - calculatedOutput[x];
                }

                //backpropagation <<<<
                for (var y = this.layers.length - 1; y >= 0; y--) {
                    if (this.layers[y]) {
                        //train the layers using the calculated error
                        error = this.layers[y].train(error, this.options.learningRate, this.options.momentum);
                    }
                }
            }

            counter++;
        }
        //set the new error to the neural net class
        this.error = Math.abs(error[error.length - 1]);
    }

    processData(data) {
        var outputs = [];
        var inputs = [];
        var out = [];
        var inp = [];
        for (let i = 0; i < data.length; i++) {
            outputs.push(data[i]['output']);
            inputs.push(data[i]['input']);
        }

        inp = convert.toMatrix(inputs);

        for (let i = 0; i < outputs.length; i++) {
            for (var key in outputs[i]) {
                out.push(outputs[i][key]);
            }
        }

        return {
            output: out,
            input: inp
        };
    }
}

module.exports = FeedfowardNeuralNetwork;