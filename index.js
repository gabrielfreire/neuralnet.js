const Neuralnet = require('./src/neuralnet');
const Matrix = require('./src/Utils/matrix');
const nn2 = new Neuralnet().PerceptronNeuralNetwork();
const nn = new Neuralnet().FeedfowardNeuralNetwork({
    inputSize: 3,
    hiddenSize: 3,
    outputSize: 1,
    learningRate: 0.3,
    activation: 'sigmoid',
    iterations: 10000,
    momentum: 0.6,
    verbose: false
});

const features = [
    [1.03, 0.7, 0.5],
    [0.16, 1.09, 0.2],
    [0.5, 0.5, 1.0],
];
const labels = [
    [0],
    [1],
    [0]
];
// console.log(new Matrix(features.length, features[0].length).map((e, i, j) => features[i][j]));
//Train the neural network
const train = (features, labels) => {
    console.log('Training...');
    nn2.train(features, labels);
}

const predict = (features) => {
    // console.log(nn.getMetrics());
    console.log(' ** PREPARING PREDICTION ** ');
    const result = nn2.predict(features, false);
    console.log('--> FINAL RESULT', result.data);
    // for (let i = 0; i < features.length; i++) {
    //     const result = nn.predict(features[i]);
    //     console.log('input: R[' + features[i][0] + '], G[' + features[i][1] + '], B[' + features[i][2] + '] > output: ', result);
    // }
}

// //train
train(features, labels);
// //Predict
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