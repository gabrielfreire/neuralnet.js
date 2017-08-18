//backpropagation Neural Network
const FFNN = require('./BackpropagationNN/FeedfowardNN');
const Perceptron = require('./PerceptronNN/Perceptron');

function NeuralNetwork() {}


var nn = {
    FeedfowardNeuralNetwork: (options) => {
        return new FFNN(options);
    },
    PerceptronNeuralNetwork: (options) => {
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