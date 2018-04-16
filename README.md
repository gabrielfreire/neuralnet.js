# neuralnet.js
Fast Neural Networks for node.js

# Usage
### Train a simple Neural Network using Back-propagation and Gradient Descent
```js
const Neuralnet = require('./src/neuralnet');
const Matrix = require('./src/Utils/matrix');
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
    let learningRate = 0.3;
    for (let i = 0; i < epochs; i++) {
        for (let j = 0; j < features.length; j++) {
            nn.train(features[j], labels[j], learningRate, epochs);
        }
    }
    console.log('Done!');
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
```


#### Output
```
Training...
Done!
Num of iterations  10000
Loss: 0.000003377864751484763
input: R[1.03], G[0.7], B[0.5] > output:  [ 0.20124280374743347 ]
input: R[0.16], G[1.09], B[0.2] > output:  [ 0.700076276624251 ]
input: R[0.5], G[0.5], B[1] > output:  [ 0.9833677371274795 ]
```

# Neural Network Types
- [x] neuralnet.BackpropagationNeuralNetwork - Feedforward Neural Network with backpropagation
- [x] neuralnet.Perceptron - Basic Perceptron Neural Network
- [ ] neuralnet.RecurrentNeuralNetwork - Recurrent Neural Network
- [ ] neuralnet.RecurrentNeuralNetworkLTSM - Recurrent Neural Network Long term short memory
- [ ] neuralnet.ConvolutionalNeuralNetwork - Convolutional Neural Network

# TODO
- [ ] Add support for GPU

# Useful links

http://www.wildml.com/2015/09/recurrent-neural-networks-tutorial-part-1-introduction-to-rnns/
http://neuralnetworksanddeeplearning.com/chap2.html
https://www.youtube.com/watch?v=d14TUNcbn1k
https://www.youtube.com/watch?v=bNb2fEVKeEo
https://www.youtube.com/channel/UCdKG2JnvPu6mY1NDXYFfN0g

This library was not npm published and is being developed for study purposes, feel free to contribute