// import * as fs from 'fs';
// import * as path from 'path';
// import * as csv from 'csv-parse';
// import { plot } from '@stdlib/stdlib';
// import { array } from '@stdlib/stdlib';
// import { MultiLayerNeuralNetwork, Perceptron } from './neuralnet';
import * as express from 'express';

// import * as path from 'path';
// import * as wa from 'webassembly';

// const wasmPath = path.join(__dirname, '/wasm/pyodide.asm.wasm');
// const memory = new WebAssembly.Memory({initial:8192, maximum:8192});
// const table = new WebAssembly.Table({ initial: 16384, element: "anyfunc" });
// const importObj = { imports: { i: arg => console.log(arg) }, memory: memory, table: table };
// wa.load(wasmPath, {imports: importObj}).then((module) => {
//     console.log(module.exports);
// }).catch((err) => {
//     console.log(`some error: ${err}`);
// });

// const features: number[][] = [
//     [1.0, 0.7, 0.5],
//     [0.16, 1.0, 0.2],
//     [0.5, 0.5, 1.0],
// ];
// const labels: number[][] = [
//     [0.2],
//     [0.7],
//     [1]
// ];

// function _buildModel (): MultiLayerNeuralNetwork {
//     const nn = new MultiLayerNeuralNetwork({
//         verbose: false,
//         frequency: 100
//     });
//     nn.add(nn.Layer({ input: 3, output: 3, activation: 'sigmoid' }));
//     nn.add(nn.Layer({ input: 3, output: 1, activation: 'sigmoid' }));
//     return nn;
// }

// const nn: MultiLayerNeuralNetwork = _buildModel();

// //Train the neural network
// function train (features: number[][], labels: number[][]): void {
//     const epochs: number = 10000;
//     const learningRate: number = 0.3;
//     const frequency: number = 100;
//     let lossHistory: number[] = [];
//     let iterations: number[] = [];
//     for (let i = 0; i < epochs; i++) {
//         for (let j = 0; j < features.length; j++) {
//             nn.train(features[j], labels[j], learningRate);
//         }
//         // save epoch and current loss
//         if(i % frequency == 0) {
//             console.log("Step ->", i);
//             iterations.push(i);
//             lossHistory.push(nn.getCurrentLoss());
//         }
//     }
//     // plot the loss for each 100 epochs
//     plot([iterations], [lossHistory], { width: 768, height: 512 }).view('browser');
// }

// function predict (features: number[][]): void {
//     for (let i = 0; i < features.length; i++) {
//         const result = nn.predict(features[i]);
//         console.log('input: R[' + features[i][0] + '], G[' + features[i][1] + '], B[' + features[i][2] + '] > output: ', result);
//     }
// }
// http server
const app: any = express();
app.use(express.static('www'));
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
//train
// train(features, labels);
//Predict
// predict(features);