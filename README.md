# neuralnet.js
Fast Neural Networks for node.js

# Usage
### Code to train a Feedfoward Neural Network with backpropagation algorithm
```js
const Neuralnet = require('./src/neuralnet');
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