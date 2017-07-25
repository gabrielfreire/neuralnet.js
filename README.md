# neuralnet.js
Fast Neural Network for node.js

# Usage
Code
```js
var Neuralnet = require('./neuralnet')
var nn = new Neuralnet().BackpropagationNeuralNetwork(inputSize, hiddenSize, outputSize);


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