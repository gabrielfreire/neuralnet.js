export class ActivationFunction {
    constructor() {}

    sigmoid(x: number, isDerivative: boolean): number {
        if (!isDerivative) {
            return 1 / (1 + Math.exp(-x));
        }
        return x * (1 - x);
    }

    step(x: number): number {
        if (x >= 1) {
            return 1;
        }
        return 0;
    }

    linear(x: number, derivative: boolean): number {
        if(x < 0) return 0;
        return !derivative ? x : x * (1 - x);
    }
}