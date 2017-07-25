var Neuralnet = require('./src/neuralnet'),
    learningRate = 0.3,
    momentum = 0.06,
    iterations = 60000,
    inputSize = 3,
    hiddenSize = 3,
    outputSize = 1,
    trainingData = [
        { r: 1.03, g: 0.7, b: 0.5 },
        { r: 0.16, g: 1.09, b: 0.2 },
        { r: 0.5, g: 0.5, b: 1.0 }
    ],
    trainingOutput = [
        { red: 0 },
        { green: 1 },
        { blue: 0.5 }
    ],
    nn = new Neuralnet().BackpropagationNeuralNetwork(inputSize, hiddenSize, outputSize);


console.log('Training...');
for (var i = 0; i < iterations; i++) {
    for (var j = 0; j < trainingOutput.length; j++) {
        nn.train(trainingData[j], trainingOutput[j], learningRate, momentum);
    }
}
console.log('Done!');
console.log('Num of iterations ', iterations);
console.log('Error ', nn.error);
for (var x = 0; x < trainingOutput.length; x++) {
    var t = trainingData[x];
    if (t) {
        var result = nn.run(t);
        console.log('input: R[' + t['r'] + '], G[' + t['g'] + '], B[' + t['b'] + '] > output: ', result[0]);
        // console.log('input: [' + t[0] + '], [' + t[1] + '] > output: ', result[0]);
    }
}

//TODO
// - pass configuration to the network class
// - implement more neural networks