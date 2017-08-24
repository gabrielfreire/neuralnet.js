//backpropagation Neural Network
const FFNN = require('./BackpropagationNN/FeedfowardNN');
const Perceptron = require('./PerceptronNN/Perceptron');

class NeuralNetwork {
    constructor() {}

    FeedfowardNeuralNetwork(options) {
        return new FFNN(options);
    }

    PerceptronNeuralNetwork(options) {
        return new Perceptron(options);
    }
}
module.exports = NeuralNetwork;