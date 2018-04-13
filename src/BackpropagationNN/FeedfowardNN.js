'use strict'
//feedfoward backpropagation Neural Network
const Layer = require('./layer');
const zeros = require('../Utils/zeros');
// const Matrix = require('../Utils/matrix');
const convert = require('../Utils/conversions');

class FeedfowardNeuralNetwork {
    constructor(options) {
        const defaults = {
            verbose: true
        };
        this.options = defaults;
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.layers = [];
        this.error = null;
        this.loss = 0;
        //Layer that contains the edges between the input neurons and the hidden neurons
        this.layers.push(new Layer({input: 3, output: 3, activation: 'sigmoid'}));
        // //Layer that contains the edges between the hidden neurons and the output neurons
        this.layers.push(new Layer({input: 3, output: 1, activation: 'sigmoid'}));
    }

    Layer (options) {
        return new Layer(options);
    }
    add(layer) {
        this.layers.push(layer);
    }

    getConfiguration() {
        return this.options;
    }

    predict(input) {
        var lastOutput = input;
        for (var i = 0; i < this.layers.length; i++) {
            //produce output for each layer based on the input
            lastOutput = this.layers[i].run(lastOutput);
        }
        //return the normalized output produced by the neural network
        return lastOutput;
    }

    train(inputs, outputs, learningRate, momentum) {
        // const prediction = this.predict(input);
        // this.error = loss;
        // for (let i = 0; i < outputs.length; i++) {
            //get output from the neural network
            let c = 0;
            let loss = 0;
        while(c < 100) {
            for(let i = 0; i < outputs.length; i++) {
                const prediction = this.predict(inputs[i]);
                loss = this.calculateLoss(prediction, outputs[i]);
                loss = this.backward(loss, learningRate, momentum);
                this.loss = loss;
                // for(let j = 0; j < this.loss.length; j++ ){
                //     this.loss[j] = outputs[i] - prediction[j];
                // }
                // // this.loss = this.calculateLoss(prediction, output);
                // for(var y = this.layers.length - 1; y >= 0; y--){
                //     this.loss = this.layers[y].optimize(this.loss, learningRate, momentum);
                // }
            }
            c++;
            if (this.options.verbose) {
                console.log("Loss: " + Math.abs(this.loss[this.loss.length - 1]));
            }
        }
        // this.loss = this.backward(this.loss,learningRate, momentum);
        // }
        
        //set the new error to the neural net class
    }

    calculateLoss(y, prediction) {
        let loss = zeros(prediction.length);
        for (let x = 0; x < loss.length; x++) {
            loss[x] = y - prediction[x];
        }

        return loss;
    }

    backward(loss, learningRate, momentum) {
        for (var y = this.layers.length - 1; y >= 0; y--) {
            if (this.layers[y]) {
                //train the layers using the calculated error
                loss = this.layers[y].optimize(loss, learningRate, momentum);
            }
        }
        return loss;
    }

    getMetrics() {
        return "Loss: " + Math.abs(this.error[this.error.length - 1]);
    }
}

module.exports = FeedfowardNeuralNetwork;