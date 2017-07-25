//backpropagation Neural Network
var Layer = require('./layer');


function BackpropagationNeuralNetwork(options) {
    this.options = defaults;
    if (options) {
        this.options = Object.assign(this.options, options);
    }
    this.layers = [];
    this.error = null;
    //Layer that contains the edges between the input neurons and the hidden neurons
    this.layers.push(new Layer(this.options.inputSize, this.options.hiddenSize));
    //Layer that contains the edges between the hidden neurons and the output neurons
    this.layers.push(new Layer(this.options.hiddenSize, this.options.outputSize));
}

var nn = {
    //return a single layer
    getLayer: function(index) {
        return this.layers[index];
    },
    //Forward process
    run: function(input) {
        var activations = input;
        for (var i = 0; i < this.layers.length; i++) {
            //produce output based on the input
            activations = this.layers[i].run(activations);
        }
        //return the normalized output produced by the neural network
        return activations;
    },
    train: function(input, targetOutput) {
        //get output from the neural network
        var calculatedOutput = this.run(input);
        var error = [];

        for (var i = 0; i < calculatedOutput.length; i++) {
            error.push(0);
        }
        //check wether targetOutput is an object or an array
        if (targetOutput instanceof Array) {
            for (var x = 0; x < error.length; x++) {
                //calculate the error
                error[x] = targetOutput[x] - calculatedOutput[x];
            }
        } else if (targetOutput instanceof Object) {
            var target = [];
            for (var key in targetOutput) {
                target.push(targetOutput[key]);
            }
            for (var x = 0; x < error.length; x++) {
                //calculate the error
                error[x] = target[x] - calculatedOutput[x];
            }
        }
        //backpropagation
        for (var y = this.layers.length - 1; y >= 0; y--) {
            if (this.layers[y]) {
                //train the layers using the calculated error
                error = this.layers[y].train(error, this.options.learningRate, this.options.momentum);
            }
        }
        //set the new error to the neural net class
        this.error = error[error.length - 1];
    }
}

var defaults = {
    inputSize: 3,
    hiddenSize: 2,
    outputSize: 1,
    learningRate: 0.3,
    momentum: 0.6
}
BackpropagationNeuralNetwork.prototype = nn;

module.exports = BackpropagationNeuralNetwork;