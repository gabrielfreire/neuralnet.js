const Neuralnet = require('./src/neuralnet');
const nn2 = new Neuralnet().PerceptronNeuralNetwork();
const nn = new Neuralnet().FeedfowardNeuralNetwork({
    inputSize: 3,
    hiddenSize: 3,
    outputSize: 1,
    learningRate: 0.3,
    activation: 'sigmoid',
    iterations: 10000,
    momentum: 0.6
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

//Train the neural network
const train = (features, labels) => {
    console.log('Training...');
    nn.train(features, labels);
}

const predict = (features) => {
    console.log('Num of iterations ', nn.getConfiguration().iterations);
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





/* *************************** */
//TODO
// - pass configuration to the network class
// - implement more neural networks

//add option to build layer achitecture
// **********
// nn.buildLayer({
//     neurons: 100,
//     algorithm: 'LINE_GRADIENT_DESCENT',
//     learningRate:0.06,
// }).buildLayer({
//     neurons: 100,
//     algorithm: 'CONJUGATE_GRADIENT',
//     learningRate:0.06,
// }).buildLayer({
//     neurons: 100,
//     algorithm: 'STOCHASTIC_GRADIENT_DESCENT',
//     learningRate:0.06,
// });