# neuralnet.js
Fast Neural Networks for node.js

# Usage
### Train a simple Neural Network using Back-propagation and Gradient Descent
```js
import { plot } from '@stdlib/stdlib';
import { MultiLayerNeuralNetwork, Perceptron } from './neuralnet';
const features: number[][] = [
    [1.0, 0.7, 0.5],
    [0.16, 1.0, 0.2],
    [0.5, 0.5, 1.0],
];
const labels: number[][] = [
    [0.2],
    [0.7],
    [1]
];

function _buildModel (): MultiLayerNeuralNetwork {
    const nn = new MultiLayerNeuralNetwork({
        verbose: true,
        frequency: 100
    });
    nn.add(nn.Layer({ input: 3, output: 3, activation: 'sigmoid' }));
    nn.add(nn.Layer({ input: 3, output: 1, activation: 'sigmoid' }));
    return nn;
}

const nn: MultiLayerNeuralNetwork = _buildModel();

//Train the neural network
function train (features: number[][], labels: number[][]): void {
    const epochs: number = 10000;
    const learningRate: number = 0.3;
    const frequency: number = 100;
    let lossHistory: number[] = [];
    let iterations: number[] = [];
    for (let i = 0; i < epochs; i++) {
        for (let j = 0; j < features.length; j++) {
            nn.train(features[j], labels[j], learningRate);
        }
        // save epoch and current loss
        if(i % frequency == 0) {
            console.log("Step ->", i);
            iterations.push(i);
            lossHistory.push(nn.getCurrentLoss());
        }
    }
    // plot the loss in each 100 epochs
    plot([iterations], [lossHistory], { width: 768, height: 512 }).view('browser');
}

function predict (features: number[][]): void {
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
# Run
- `git clone https://github.com/gabrielfreire/neuralnet.js.git`
- `cd neuralnet.js`
- `npm install`
- `npm run tsc`
- `npm start`


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