const Neuralnet = require('./src/neuralnet');
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

function _buildModel () {
    const nn = new Neuralnet().FeedfowardNeuralNetwork({
        verbose: false
    });
    nn.add(nn.Layer({ input: 3, output: 3, activation: 'sigmoid' }));
    nn.add(nn.Layer({ input: 3, output: 1, activation: 'sigmoid' }));
    return nn;
}

const nn = _buildModel();

//Train the neural network
function train (features, labels) {
    console.log('Training...');
    const epochs = 10000;
    const learningRate = 0.3;
    for (let i = 0; i < epochs; i++) {
        for (let j = 0; j < features.length; j++) {
            nn.train(features[j], labels[j], learningRate, epochs);
        }
        console.log("Step ->", i);
    }
}

function predict (features) {
    for (let i = 0; i < features.length; i++) {
        const result = nn.predict(features[i]);
        console.log('input: R[' + features[i][0] + '], G[' + features[i][1] + '], B[' + features[i][2] + '] > output: ', result);
    }
}

//train
train(features, labels);
//Predict
predict(features);