//backpropagation Neural Network
var FFNN = require('./BackpropagationNN/FeedfowardNN');
var Perceptron = require('./PerceptronNN/Perceptron');

function NeuralNetwork() {}


var nn = {
    FeedfowardNeuralNetwork: function(options) {
        return new FFNN(options);
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