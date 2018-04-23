const ActivationFunction = require('../Utils/activation');
const Matrix = require('../Utils/matrix');


class Perceptron {
    constructor(options) {
        const defaults = {
            learningRate: 0.1,
            activation: 'step',
            iterations: 300,
            inputSize: 3,
            outputSize: 1
        };
        this.options = defaults;
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.error = null;
        this.input = null;
        this.output = null;
        this.weights = new Matrix(this.options.inputSize, this.options.outputSize);
        this.weights.randomize();
        console.log('STARTING WEIGHTS', this.weights.data)
        this.activation = this.options.activation ? this.options.activation : 'sigmoid';
    }

    getConfiguration() {
        return this.options;
    }

    predict(input, training) {
        let output;
        if(!(input instanceof Matrix)) {
            input = new Matrix(input.length, input[0].length).map((_, i, j) => input[i][j]);
        }
        output = Matrix.multiply(input, this.weights);
        return Matrix.map(output, (e, i, j) => ActivationFunction['sigmoid'](e) );
    }

    train(input, output) {
        var epoch = 0;
        this.input = new Matrix(input.length, input[0].length).map((e, i, j) => input[i][j]);
        this.output = new Matrix(output.length, output[0].length).map((e, i, j) => output[i][j]);
        while (epoch < this.options.iterations) {
            var predictions = Matrix.multiply(this.input, this.weights)
                                    .map((e, i, j) => ActivationFunction['sigmoid'](e));
            var loss = Matrix.subtract(this.output, predictions);
            // get gradient
            var gradients = Matrix.multiply(this.input, loss)
                                .multiply(this.options.learningRate);
            // update the weights
            this.weights.add(gradients);
            // this.error = Math.abs(loss);
            epoch++;
        }
    }
}

module.exports = Perceptron;