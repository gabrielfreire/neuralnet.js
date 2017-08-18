# neuralnet.js
Fast Neural Network for node.js

# Usage
### Code to train a Feedfoward Neural Network with backpropagation algorithm
```js
const Neuralnet = require('./src/neuralnet');
const trainingData = [
    { r: 1.03, g: 0.7, b: 0.5 },
    { r: 0.16, g: 1.09, b: 0.2 },
    { r: 0.5, g: 0.5, b: 1.0 }
];
const trainingOutput = [
    { red: 1 },
    { green: 1 },
    { blue: 0 }
];
const nn = new Neuralnet().FeedfowardNeuralNetwork({
    inputSize: 3,
    hiddenSize: 3,
    outputSize: 1,
    learningRate: 0.3,
    activation: 'sigmoid',
    iterations: 100000,
    momentum: 0.6
});

console.log('Training...');
nn.train(trainingData, trainingOutput);

console.log('Done!');
console.log('Num of iterations ', nn.getConfiguration().iterations);
console.log('Error ', nn.error);
for (var x = 0; x < trainingOutput.length; x++) {
    var t = trainingData[x];
    if (t) {
        var result = nn.run(t);
        console.log('input: R[' + t['r'] + '], G[' + t['g'] + '], B[' + t['b'] + '] > output: ', result[0]);
    }
}
```


#### Output
```
Training...
Done!
Num of iterations  60000
Error  0
input: R[1.03], G[0.7], B[0.5] > output:  0.005852680044926707
input: R[0.16], G[1.09], B[0.2] > output:  0.9946055536273819
input: R[0.5], G[0.5], B[1] > output:  0.49998682870432254
```

### Code to train a Perceptron Neural Network
```js
const Neuralnet = require('./src/neuralnet');
const trainingData = [
    { r: 1.03, g: 0.7, b: 0.5 },
    { r: 0.16, g: 1.09, b: 0.2 },
    { r: 0.5, g: 0.5, b: 1.0 }
];
const trainingOutput = [
    { red: 1 },
    { green: 1 },
    { blue: 0 }
];
const nn = new Neuralnet().PerceptronNeuralNetwork({
        inputSize: 3,
        outputSize: 1,
        learningRate: 0.1,
        activation: 'step',
    });

console.log('Training...');
nn.train(trainingData, trainingOutput);

console.log('Done!');
console.log('Num of iterations ', nn.getConfiguration().iterations);
console.log('Error ', nn.error);
for (var x = 0; x < trainingOutput.length; x++) {
    var t = trainingData[x];
    if (t) {
        var result = nn.run(t);
        console.log('input: R[' + t['r'] + '], G[' + t['g'] + '], B[' + t['b'] + '] > output: ', result);
    }
}
```
#### Output
```
Training...
Done!
Num of iterations  6
Error  0
input: R[1.03], G[0.7], B[0.5] > output:  1
input: R[0.16], G[1.09], B[0.2] > output:  1
input: R[0.5], G[0.5], B[1] > output:  0
```

# Neural Network Types
- [x] neuralnet.BackpropagationNeuralNetwork - Feedforward Neural Network with backpropagation
- [x] neuralnet.Perceptron - Basic Perceptron Neural Network
- [ ] neuralnet.RecurrentNeuralNetwork - Recurrent Neural Network
- [ ] neuralnet.RecurrentNeuralNetworkLTSM - Recurrent Neural Network Long term short memory
- [ ] neuralnet.RecurrentNeuralNetworkGRU - Recurrent Neural Network Gated Recurrent Unit

# TODO
- [ ] Add support for gpu.js

# Useful links

http://www.wildml.com/2015/09/recurrent-neural-networks-tutorial-part-1-introduction-to-rnns/
http://neuralnetworksanddeeplearning.com/chap2.html

This library was not npm published and is being developed for study purposes, feel free to contribute