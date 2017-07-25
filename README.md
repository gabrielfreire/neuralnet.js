# neuralnet.js
Fast Neural Network for node.js

# Usage
Code
```js
var Neuralnet = require('./neuralnet'),
    learningRate = 0.3,
    momentum = 0.06,
    iterations = 60000,
    inputSize = 3,
    hiddenSize = 3,
    outputSize = 1,
    nn = new Neuralnet().BackpropagationNeuralNetwork(input3Size, hiddenSize, outputSize),
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
    }
}
```
Output
```
Training...
Done!
Num of iterations  60000
Error  -0.00006940641977120696
input: R[1.03], G[0.7], B[0.5] > output:  0.005852680044926707
input: R[0.16], G[1.09], B[0.2] > output:  0.9946055536273819
input: R[0.5], G[0.5], B[1] > output:  0.49998682870432254
```

# Neural Network Types
- [x] neuralnet.BackpropagationNeuralNetwork - Feedforward Neural Network with backpropagation
- [ ] neuralnet.RecurrentNeuralNetwork - Recurrent Neural Network

Being developed for study purposes
# Useful links

http://www.wildml.com/2015/09/recurrent-neural-networks-tutorial-part-1-introduction-to-rnns/
http://neuralnetworksanddeeplearning.com/chap2.html