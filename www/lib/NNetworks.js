class Networks {
    constructor (training) {
        this.training = training;
        this.vocab = "PE abcdefghijklmnopqrstuvwxyz'.?";
        this.embedding = 128;
        this.hiddenTextEnc = 256;
        this.dropoutRate = 0.05;
    }
    // Layers
    normalize(inputs) {
        return tf.layers.batchNormalization(inputs, {axis:-1});
    }

    embed(inputs, vocabSize, numUnits, zero_pad=true, scope="embedding", reuse=null) {
        return tf.layers.embedding([vocabSize, numUnits]).apply(inputs);
    }

    conv1d (inputs, size=1, rate=1, dropoutRate, filters=null, padding="same", use_bias=true, activationFn=null, training=true) {
        const params = { inputs: inputs, filters: filters, kernelSize:size, padding: padding, useBias: use_bias, dilationRate: rate };
        let conv1d = tf.layers.conv1d(params);
        conv1d = this.normalize(conv1d);
        if(activationFn) {
            conv1d = tf.layers.activation({activation: activationFn}).apply(conv1d);
        }
        conv1d = tf.layers.dropout(dropoutRate).apply(conv1d);
        return conv1d
    }
    highwayConv (inputs, size=1, rate=1, dropoutRate, filters=null, padding="same", use_bias=true, activationFn=null, training=true) {
        const params = { inputs: inputs, filters: 2 * filters, kernelSize:size, padding: padding, useBias: use_bias, dilationRate: rate };
        let conv1d = tf.layers.conv1d(params);
        const [H1, H2] = tf.split(conv1d, 2, -1);
        H1 = this.normalize(H1);
        H2 = this.normalize(H2);
        H1 =  tf.layers.activation({activation:'sigmoid'}).apply(H1);
        if(activationFn) {
            H2 = tf.layers.activation({activation:activationFn}).apply(H2);
        }
        // conv1d = H1 * H2 + (1.-H2)*inputs;
        conv1d = H1.mul(H2).add(tf.scalar(1).sub(H2)).mul(inputs);
        conv1d = tf.layers.dropout(dropoutRate).apply(conv1d);
        return conv1d
    }

    // N Networks
    textEncoder (input, training=true) {
        let tensor = this.embed(input, this.vocab.length, this.embedding);
        tensor = this.conv1d(tensor, 1, 1, this.dropoutRate, 2*this.hiddenTextEnc, "same", true, 'relu', training);
        tensor = this.conv1d(tensor, 1, 1, this.dropoutRate, null, "same", true, 'relu', training);
        for(let i = 0; i < 2; i++) {
            for(j = 0; j < 4; j++) {
                tensor = this.highwayConv(tensor, 3, 3**j, this.dropoutRate, null, null, true, null, training);
            }
        }
        for(let i = 0; i < 2; i++) {
            tensor = this.highwayConv(tensor, 3, 1, this.dropoutRate, null, null, true, null, training);
        }
        for(let i = 0; i < 2; i++) {
            tensor = this.highwayConv(tensor, 1, 1, this.dropoutRate, null, null, true, null, training);
        }
        const [K, V] = tf.split(tensor, 2, -1);
        return K, V;
    }
}