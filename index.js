var Neuralnet = require('./src/neuralnet'),
    trainingData = [
        { r: 1.03, g: 0.7, b: 0.5 },
        { r: 0.16, g: 1.09, b: 0.2 },
        { r: 0.5, g: 0.5, b: 1.0 }
    ],
    trainingOutput = [
        { red: 1 },
        { green: 1 },
        { blue: 0 }
    ],
    nn = new Neuralnet().FeedfowardNeuralNetwork({
        inputSize: 3,
        hiddenSize: 3,
        outputSize: 1,
        learningRate: 0.3,
        activation: 'sigmoid',
        iterations: 100000,
        momentum: 0.6
    });
nn2 = new Neuralnet().PerceptronNeuralNetwork();

// nn2.train(trainingData, trainingOutput);

console.log('Training...');
nn2.train(trainingData, trainingOutput);

console.log('Done!');
console.log('Num of iterations ', nn2.getConfiguration().iterations);
console.log('Error ', nn2.error);
for (var x = 0; x < trainingOutput.length; x++) {
    var t = trainingData[x];
    if (t) {
        var result = nn2.run(t);
        // var result = nn2.run(t);
        console.log('input: R[' + t['r'] + '], G[' + t['g'] + '], B[' + t['b'] + '] > output: ', result);
        // console.log('input: [' + t[0] + '], [' + t[1] + '] > output: ', result[0]);
    }
}


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