var ActivationFunction = require('./activation');

function Layer(inputSize, outputSize) {
    this.input = [];
    this.output = [];
    this.weights = [];
    this.dWeights = [];
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    var length = (inputSize + 1) * outputSize;

    for (var i = 0; i < outputSize; i++) {
        this.output.push(0);
    }
    for (var i = 0; i < length; i++) {
        this.weights[i] = (Math.random() - 0.5) * 4; // [-2, 2]
        this.dWeights[i] = 0; // [-2, 2]
    }
}


Layer.prototype = {
    run: function(inputArray) {
        //check if inputArray is an object or an array
        if (inputArray instanceof Array) {
            this.input = inputArray.slice(); //copy the array
        } else if (inputArray instanceof Object) {
            this.input = Object.assign(inputArray); //copy the object
            var input = [];
            for (var key in this.input) {
                input.push(this.input[key]);
            }

            this.input = input.slice();
        }
        // add 1 more for bias / anchor value / helps with fitting the data
        this.input.push(1);

        var offset = 0,
            newOutput;
        for (var i = 0; i < this.output.length; i++) {
            for (var j = 0; j < this.input.length; j++) {
                //calculate the output based on the input and the weights
                this.output[i] += this.weights[offset + j] * this.input[j];
            }
            //normalize the output using the sigmoid activation function
            this.output[i] = ActivationFunction.sigmoid(this.output[i]);
            offset += this.input.length;
        }
        //make a copy
        newOutput = this.output.slice();
        //and return the newOutput from the neural network
        return newOutput;
    },

    train: function(error, learningRate, momentum) {
        var offset = 0;
        var nextError = [];

        for (var i = 0; i < this.output.length; i++) {
            //calculate the delta
            var delta = error[i] * ActivationFunction.dSigmoid(this.output[i]);

            for (var j = 0; j < this.input.length; j++) {

                nextError.push(0);
                var weightIndex = offset + j;
                //calculate the next error
                nextError[j] += this.weights[weightIndex] * delta;

                //adjust the weights
                var dw = this.input[j] * delta * learningRate;
                this.weights[weightIndex] += this.dWeights[weightIndex] * momentum + dw;
                this.dWeights[weightIndex] = dw;


            }
            offset += this.input.length;

        }
        //return the next error
        return nextError;
    }
}

module.exports = Layer;