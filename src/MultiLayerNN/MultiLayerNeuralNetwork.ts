//feedfoward backpropagation Neural Network
import { Layer } from './layer';
import { Matrix } from '../Utils/matrix';

export class MultiLayerNeuralNetwork {
    options: any;
    layers: Layer[];
    loss: Matrix;
    steps: number;
    frequency: number;
    constructor(options) {
        const defaults = {
            verbose: false,
            frequency: 1
        };
        this.options = defaults;
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.layers = [];
        this.steps = 0;
        this.frequency = this.options.frequency;
    }

    Layer(options: any): Layer {
        return new Layer(options);
    }

    add(layer: Layer): void {
        this.layers.push(layer);
    }

    getConfiguration(): any {
        return this.options;
    }

    train(inputs: number[], outputs: number[], learningRate: number): void {
        //get output from the neural network
        this.steps++;
        let inputs_m: Matrix = Matrix.fromArray(inputs);
        let outputs_m: Matrix = Matrix.fromArray(outputs);
        const prediction = this.feedFoward(inputs_m);
        this.loss = Matrix.subtract(outputs_m, prediction);
        this.backPropagate(learningRate);
        if(this.options.verbose) {
            if(this.steps % this.frequency == 0){
                console.info(this.getMetrics());
            }
        }
    }

    predict(input: number[]): number[] {
        return this.feedFoward(input).toArray();
    }

    feedFoward(input: Matrix|number[]): Matrix {
        var output = input;
        for (var i = 0; i < this.layers.length; i++) {
            //produce output for each layer based on the input
            output = this.layers[i].run(output);
        }
        //return the normalized output produced by the neural network
        return <Matrix>output;
    }

    backPropagate(learningRate: number): void {
        for (var y = this.layers.length - 1; y >= 0; y--) {
            if (this.layers[y]) {
                //train the layers using the calculated error
                this.loss = this.layers[y].optimize(this.loss, learningRate);
            }
        }
    }

    getCurrentLoss(): number {
        return this.loss.data[this.loss.data.length - 1][0];
    }

    getMetrics(): string {
        return "Loss: " + this.getCurrentLoss();
    }
}