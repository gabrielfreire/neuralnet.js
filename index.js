const Neuralnet = require('./src/neuralnet');
const Matrix = require('./src/Utils/matrix');
const nn2 = new Neuralnet().PerceptronNeuralNetwork();
const nn = new Neuralnet().FeedfowardNeuralNetwork({
    verbose: true
});

const features = [
    [1.03, 0.7, 0.5],
    [0.16, 1.09, 0.2],
    [0.5, 0.5, 1.0],
];
const labels = [
    [0.4],
    [0.7],
    [0.1]
];
// console.log(new Matrix(features.length, features[0].length).map((e, i, j) => features[i][j]));
//Train the neural network
const train = (features, labels) => {
    // nn.add(nn.Layer({input: 3, output: 2, activation: 'sigmoid'}));
    // nn.add(nn.Layer({input: 2, output: 1, activation: 'sigmoid'}));
    console.log('Training...');
    let epochs = 100;
    // console.log(nn);
    // for(var i = 0; i < epochs; i++) {
        nn.train(features, labels, 0.03, 0.6);
    // }
}

const predict = (features) => {
    // console.log(nn.getMetrics());
    console.log(' ** PREPARING PREDICTION ** ');
    for (let i = 0; i < features.length; i++) {
        const result = nn.predict(features[i]);
        console.log('input: R[' + features[i][0] + '], G[' + features[i][1] + '], B[' + features[i][2] + '] > output: ', result);
    }
    // console.log('--> FINAL RESULT', result.data);
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