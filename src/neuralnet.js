//backpropagation Neural Network
var BPNN = require('./BackpropagationNN/BackPropagationNN');
var Perceptron = require('./PerceptronNN/Perceptron');

function NeuralNetwork() {}


var nn = {
    BackpropagationNeuralNetwork: function(options) {
        return new BPNN(options);
    },
    PerceptronNeuralNetwork: function(options) {
        return new Perceptron(options);
    }

    /*TODO
    RecurrentNeuralNetwork: function(){},
    LongShortTermMemory: function(){},
    GatedRecurrentUnit: function(){},
    ConvolutionNeuralNetwork: function(){},
    */
}

NeuralNetwork.prototype = nn;

module.exports = NeuralNetwork;