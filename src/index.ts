import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse';
import { plot } from '@stdlib/stdlib';
import { array } from '@stdlib/stdlib';
import { MultiLayerNeuralNetwork, Perceptron } from './neuralnet';
import * as express from 'express';
import {getParamsFromFile, arrayToRaw } from 'sound-parameters-extractor';
import * as fft from 'fft-js';

Array.prototype['reshape'] = function(rows, cols) {
    var copy = this.slice(0); // Copy all elements.
    this.length = 0; // Clear out existing array.
    
    for (var r = 0; r < rows; r++) {
        var row = [];
        for (var c = 0; c < cols; c++) {
            var i = r * cols + c;
            if (i < copy.length) {
                row.push(copy[i]);
            }
        }
        this.push(row);
    }
}
Array.prototype['shape'] = function() {
    return [this.length, this[0] ? this[0].length : 1];
}
/**
 * Get fft from WAV sound
 */
const config = {
    fftSize: 512,
    bankCount: 26,
    lowFrequency: 1,
    highFrequency: 8000, // samplerate/2 here
    sampleRate: 16000
};

const filePath = path.join(__dirname, '../www/data/example.wav'); 
// getParamsFromFile(filePath, config, 13).then(params => {
//     // console.log(params);
//     for(let key in params){
//         console.log(key);
//     }
//     console.log(`framedSound shape (${params.framedSound.shape()})`);
//     let audio = params.arrayDecoded;
//     let step = 10;
//     let sampleRate = 16000;
//     let window = 20;
//     let hopLength = 0.001 * step * sampleRate;
//     let fftLength = 0.001 * window * sampleRate;
//     let freqs = spectrogram(audio, fftLength, hopLength, sampleRate);
//     console.log(hopLength);
//     console.log(fftLength);
//     // console.log(params.framedSound);
//     // console.log('FFT', params.fft);
//     console.log(`mfcc start  (${params.mfcc.slice(0, 2)})`);
//     console.log(`fft shape  (${params.fft.shape()})`);
//     console.log(`mfcc shape  (${params.mfcc.shape()})`);
//     // arrayToRaw(params.mfcc, 'sound.raw');
// });
function spectrogram(audio, fftLength, hopLength, sampleRate) {
    let window = hanning(fftLength);
    let window_norm = sum(window, 2);
    let scale = window_norm * sampleRate;
    // truncate
    let trunc = (audio.length - fftLength) % hopLength;
    let x = audio.slice(0, audio.length - trunc);
    // reshape trick to include overlap
    var nshape = [fftLength, (x.length - fftLength) / hopLength + 1]
    x.reshape(nshape[0], nshape[1]);
    
    // TODO implement rfft like numpy
    x = matMul(x, window);
    console.log(`${x.shape()}, ${x.slice(0, 3)}`)
    return x;
}

function matMul(x, y) {
    let z = [];
    var rows = x.length;
    var cols = x[0].length;
    for(let i = 0; i < rows; i++) {
        z.push([]);
        for(let j = 0; j < cols; j++) {
            if(y[i][j]) z[i].push(x[i][j] * y[i][j]);
            else z[i].push(x[i][j] * 1);
        }
    }
    return z;
}
function sum(arr, exp) {
    if(!exp) exp = 1;
    let ar = arr.slice();
    let sum = 0;
    for(let i = 0; i < ar.length; i++) {
        let newN = Math.pow(ar[i], 2);
        sum += newN;
    }
    return sum;
}
function rfft(a, n, axis=0, norm) {
    let ar = a.slice();
    for(let i = 0; i < ar.length; i++) {
        ar[i] *= 1 / Math.sqrt(ar[i]);
    }
    return ar;
}
function hanning (m) {
    let n = [];
    let sum = 0;
    for(var i = 0; i < m; i++) {
        let num = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (m - 1));
        n.push([num]);
    }
    // let hanw = 0.5 - 0.5 * Math.cos((sum / m - 1));
    return n;
}

// const filePath = path.join(__dirname, '../data/iris.data.csv');

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
        verbose: false,
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
    // plot the loss for each 100 epochs
    plot([iterations], [lossHistory], { width: 768, height: 512 }).view('browser');
}

function predict (features: number[][]): void {
    for (let i = 0; i < features.length; i++) {
        const result = nn.predict(features[i]);
        console.log('input: R[' + features[i][0] + '], G[' + features[i][1] + '], B[' + features[i][2] + '] > output: ', result);
    }
}
// http server
const app = express();
app.use(express.static('www'));
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
//train
// train(features, labels);
//Predict
// predict(features);