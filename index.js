const Neuralnet = require('./src/neuralnet');
const Matrix = require('./src/Utils/matrix');
const nn2 = new Neuralnet().PerceptronNeuralNetwork();
const nn = new Neuralnet().FeedfowardNeuralNetwork({
    verbose: false
});

const features = [
    [1.03, 0.7, 0.5],
    [0.16, 1.09, 0.2],
    [0.5, 0.5, 1.0],
];
const labels = [
    [0.2],
    [0.7],
    [1]
];
// console.log(new Matrix(features.length, features[0].length).map((e, i, j) => features[i][j]));
//Train the neural network
nn.add(nn.Layer({ input: 3, output: 3, activation: 'sigmoid' }));
nn.add(nn.Layer({ input: 3, output: 1, activation: 'sigmoid' }));
const train = (features, labels) => {
    console.log('Training...');
    let epochs = 10000;
    for (let i = 0; i < epochs; i++) {
        for (let j = 0; j < features.length; j++) {
            nn.train(features[j], labels[j], 0.3, epochs);
        }
    }
}

const predict = (features) => {
    console.log(nn.getMetrics());
    for (let i = 0; i < features.length; i++) {
        const result = nn.predict(features[i]);
        console.log('input: R[' + features[i][0] + '], G[' + features[i][1] + '], B[' + features[i][2] + '] > output: ', result);
    }
}

//train
train(features, labels);
//Predict
predict(features);