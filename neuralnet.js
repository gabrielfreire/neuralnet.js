//backpropagation Neural Network
var BPNN = require('./BackpropagationNN/BackPropagationNN');

function NeuralNetwork() {}


var nn = {
    BackpropagationNeuralNetwork: function(inputSize, hiddenSize, outputSize) {
        return new BPNN(inputSize, hiddenSize, outputSize);
    }

    /*TODO
    RecurrentNeuralNetwork: function(){},
    LongShortTermMemory: function(){},
    GatedRecurrentUnit: function(){}
    */
}

NeuralNetwork.prototype = nn;

module.exports = NeuralNetwork;