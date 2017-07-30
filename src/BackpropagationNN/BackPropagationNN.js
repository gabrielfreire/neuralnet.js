//feedfoward backpropagation Neural Network
var Layer = require('./layer'),
    zeros = require('../Utils/zeros');


function BackpropagationNeuralNetwork(options) {
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

var nn = {
    getConfiguration: function() {
        return this.options;
    },
    //return a single layer
    getLayer: function(index) {
        return this.layers[index];
    },
    //Forward process
    run: function(input) {
        var activations = input;
        for (var i = 0; i < this.layers.length; i++) {
            //produce output for each layer based on the input
            activations = this.layers[i].run(activations);
        }
        //return the normalized output produced by the neural network
        return activations;
    },
    train: function(inputs, targetOutputs) {
        var counter = 0;
        while (counter <= this.options.iterations) {
            for (var i = 0; i < targetOutputs.length; i++) {
                //get output from the neural network
                var calculatedOutput = this.run(inputs[i]);
                var error = zeros(calculatedOutput.length);

                //check wether targetOutput is an object or an array
                if (Array.isArray(targetOutputs[i])) {
                    for (var x = 0; x < error.length; x++) {
                        //calculate the error
                        error[x] = targetOutputs[i] - calculatedOutput[x];
                    }
                } else if (targetOutputs[i] instanceof Object) {
                    var target = [];
                    for (var key in targetOutputs[i]) {
                        target.push(targetOutputs[i][key]);
                    }
                    for (var x = 0; x < error.length; x++) {
                        //calculate the error
                        error[x] = target[x] - calculatedOutput[x];
                    }
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
        this.error = error[error.length - 1];
    }
}

var defaults = {
    inputSize: 3,
    hiddenSize: 2,
    outputSize: 1,
    activation: 'sigmoid',
    learningRate: 0.3,
    iterations: 50000,
    momentum: 0.6
}
BackpropagationNeuralNetwork.prototype = nn;

module.exports = BackpropagationNeuralNetwork;