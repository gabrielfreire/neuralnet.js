function WAVDecoder(data) {
}

WAVDecoder.prototype.__proto__ = Decoder.prototype;

WAVDecoder.prototype.decode = function(data) {
    var decoded = {};
    var offset = 0;
    // Header
    var chunk = this.readChunkHeaderL(data, offset);
    offset += 8;
    if (chunk.name != 'RIFF') {
        console.error('File is not a WAV');
        return null;
    }

    var fileLength = chunk.length;
    fileLength += 8;

    var wave = this.readString(data, offset, 4);
    offset += 4;
    if (wave != 'WAVE') {
        console.error('File is not a WAV');
        return null;
    }

    while (offset < fileLength) {
        var chunk = this.readChunkHeaderL(data, offset);
        offset += 8;
        if (chunk.name == 'fmt ') {
            // File encoding
            var encoding = this.readIntL(data, offset, 2);
            offset += 2;

            if (encoding != 0x0001) {
                // Only support PCM
                console.error('Cannot decode non-PCM encoded WAV file');
                return null;
            }

            // Number of channels
            var numberOfChannels = this.readIntL(data, offset, 2);
            offset += 2;

            // Sample rate
            var sampleRate = this.readIntL(data, offset, 4);
            offset += 4;

            // Ignore bytes/sec - 4 bytes
            offset += 4;

            // Ignore block align - 2 bytes
            offset += 2;

            // Bit depth
            var bitDepth = this.readIntL(data, offset, 2);
            var bytesPerSample = bitDepth / 8;
            offset += 2;
        }

        else if (chunk.name == 'data') {
            // Data must come after fmt, so we are okay to use it's variables
            // here
            var length = chunk.length / (bytesPerSample * numberOfChannels);
            var channels = [];
            for (var i = 0; i < numberOfChannels; i++) {
                channels.push(new Float32Array(length));
            }

            for (var i = 0; i < numberOfChannels; i++) {
                var channel = channels[i];
                for (var j = 0; j < length; j++) {
                    var index = offset;
                    index += (j * numberOfChannels + i) * bytesPerSample;
                    // Sample
                    var value = this.readIntL(data, index, bytesPerSample);
                    // Scale range from 0 to 2**bitDepth -> -2**(bitDepth-1) to
                    // 2**(bitDepth-1)
                    var range = 1 << bitDepth - 1;
                    if (value >= range) {
                        value |= ~(range - 1);
                    }
                    // Scale range to -1 to 1
                    channel[j] = value / range;
                }
            }
            offset += chunk.length;
        }
        else {
            offset += chunk.length;
        }
    }
    decoded.sampleRate = sampleRate;
    decoded.bitDepth = bitDepth;
    decoded.channels = channels;
    decoded.length = length;
    return decoded;
};