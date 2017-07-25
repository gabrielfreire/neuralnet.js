//backpropagation Neural Network
var Layer = require('./layer');


function BackpropagationNeuralNetwork(inputSize, hiddenSize, outputSize) {
    this.layers = [];
    this.error = null;

    this.layers.push(new Layer(inputSize, hiddenSize));
    this.layers.push(new Layer(hiddenSize, outputSize));
}

var nn = {

    getLayer: function(index) {
        return this.layers[index];
    },
    run: function(input) {
        var activations = input;
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i]) {
                //produce output based on the input
                activations = this.layers[i].run(activations);
            }
        }
        //return the output produced by the neural network
        return activations;
    },
    train: function(input, targetOutput, learningRate, momentum) {
        //get output from the neural network
        var outputFromNN = this.run(input);
        var error = [];

        // console.log(outputFromNN);
        for (var i = 0; i < outputFromNN.length; i++) {
            error.push(0);
        }
        //check if targetoutput is an object or an array
        if (targetOutput instanceof Array) {
            for (var x = 0; x < error.length; x++) {
                //calculate the error
                error[x] = targetOutput[x] - outputFromNN[x];
            }
        } else if (targetOutput instanceof Object) {
            var target = [];
            for (var key in targetOutput) {
                target.push(targetOutput[key]);
            }
            for (var x = 0; x < error.length; x++) {
                //calculate the error
                error[x] = target[x] - outputFromNN[x];
            }
        }
        for (var y = this.layers.length - 1; y >= 0; y--) {
            if (this.layers[y]) {
                //train the layers using the calculated error
                error = this.layers[y].train(error, learningRate, momentum);
            }
        }
        //set the new error to the neural net class
        this.error = error[0];
    }
}

BackpropagationNeuralNetwork.prototype = nn;

module.exports = BackpropagationNeuralNetwork;