"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdlib_1 = require("@stdlib/stdlib");
const neuralnet_1 = require("./neuralnet");
const features = [
    [1.0, 0.7, 0.5],
    [0.16, 1.0, 0.2],
    [0.5, 0.5, 1.0],
];
const labels = [
    [0.2],
    [0.7],
    [1]
];
function _buildModel() {
    const nn = new neuralnet_1.MultiLayerNeuralNetwork({
        verbose: true,
        frequency: 100
    });
    nn.add(nn.Layer({ input: 3, output: 3, activation: 'sigmoid' }));
    nn.add(nn.Layer({ input: 3, output: 1, activation: 'sigmoid' }));
    return nn;
}
const nn = _buildModel();
//Train the neural network
function train(features, labels) {
    const epochs = 10000;
    const learningRate = 0.3;
    const frequency = 100;
    let lossHistory = [];
    let iterations = [];
    for (let i = 0; i < epochs; i++) {
        for (let j = 0; j < features.length; j++) {
            nn.train(features[j], labels[j], learningRate);
        }
        // save epoch and current loss
        if (i % frequency == 0) {
            console.log("Step ->", i);
            iterations.push(i);
            lossHistory.push(nn.getCurrentLoss());
        }
    }
    // plot the loss in each 100 epochs
    stdlib_1.plot([iterations], [lossHistory], { width: 768, height: 512 }).view('browser');
}
function predict(features) {
    for (let i = 0; i < features.length; i++) {
        const result = nn.predict(features[i]);
        console.log('input: R[' + features[i][0] + '], G[' + features[i][1] + '], B[' + features[i][2] + '] > output: ', result);
    }
}
//train
train(features, labels);
//Predict
predict(features);
