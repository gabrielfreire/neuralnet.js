const py = (code) => {
    return pyodide.runPython(code);
}
class AudioGenerator {
    constructor(loading) {
        this.uiLoading = loading;
        this.context = new AudioContext();
        this.numpyLoaded = false;
        this.wavDecoder = new WAVDecoder();
        this._init();
    }
    async _init() {
        await pyodide.loadPackage('numpy');
        py('import numpy as np\n' + 
            'from numpy.lib.stride_tricks import as_strided');
        this.spectrogram = this._generatePythonFunction({ code: this._spectrogram(), name: 'spectrogram' });
        this.mfcc = this._generatePythonFunction({ code: this._mfcc(), name: 'mfcc' });
        this.numpyLoaded = true;
        console.log('numpy loaded');
        this.uiLoading.style.display = 'none';
    }
    /**
     * Generate a python function
     * options { code, name }
     */
    _generatePythonFunction(options) {
        let code = options.code;
        let methodName = options.name;
        py(code);
        return pyodide.pyimport(methodName);
    }
    _spectrogram () {
        return 'def spectrogram(audioBuffer, step, wind, sample_rate):\n' +
                '   max_freq = 8000\n' +
                '   eps = 1e-14\n' +
                '   samples = np.array(audioBuffer)\n' +

                '   assert not np.iscomplexobj(samples), "Must not pass in complex numbers"\n' +

                '   hop_length = int(0.001 * step * sample_rate)\n' +
                '   fft_length = int(0.001 * wind * sample_rate)\n' +
                '   window = np.hanning(fft_length)[:, None]\n' +
                '   window_norm = np.sum(window ** 2)\n' +
                '   scale = window_norm * sample_rate\n' +
                '   trunc = (len(samples) - fft_length) % hop_length\n' +
                '   x = samples[:len(samples) - trunc]\n' +
                '   nshape = (fft_length, (len(x) - fft_length) // hop_length + 1)\n' +
                '   nstrides = (x.strides[0], x.strides[0] * hop_length)\n' +
                '   x = as_strided(x, shape=nshape, strides=nstrides)\n' +

                '   assert np.all(x[:, 1] == samples[hop_length:(hop_length + fft_length)])\n' +

                '   x = np.fft.rfft(x * window, axis=0)\n' +
                '   x = np.absolute(x)**2\n' +
                '   x[1:-1, :] *= (2.0 / scale)\n' +
                '   x[(0, -1), :] /= scale\n' +
                '   freqs = float(sample_rate) / fft_length * np.arange(x.shape[0])\n' +
                '   ind = np.where(freqs <= max_freq)[0][-1] + 1\n' +
                '   result = np.transpose(np.log(x[:ind, :] + eps))\n' +
                '   return result';
    }
    _mfcc () {
        return 'def mfcc(audio_buffer, sample_rate):\n' +
                '   # TODO\n' +
                '   return np.ones(10)';
    }
    _mfccFromAudioBuffer (audioBuffer, sampleRate) {
        let mfcc = this.mfcc(audioBuffer, sampleRate);
        return { mfcc: mfcc };
    }

    // http://haythamfayek.com/2016/04/21/speech-processing-for-machine-learning.html
    _spectrogramFromAudioBuffer (audioBuffer, step, wind, sampleRate) {
        let spectrogram = this.spectrogram(audioBuffer, step, wind, sampleRate);
        return { spectrogram: spectrogram };
    }
    spectrogramFromFile (filePath, step, wind) {
        const self = this;
        return new Promise((resolve, reject) => {
            Wav.read(filePath).then((decodedBuffer) => {
                let buffer = decodedBuffer.channelData[0];
                let sampleRate = decodedBuffer.sampleRate;
                if(!this.numpyLoaded) reject({ message: "Numpy was not loaded yet, try again in a few seconds" });
                let spec = this._spectrogramFromAudioBuffer(buffer, step, wind, sampleRate);
                console.log(spec);
                resolve(spec);
            });
        });
    }

    // TODO
    mfccFromFile(filePath) {
        const self = this;
        return new Promise((resolve, reject) => {
            Wav.read(filePath).then((decodedBuffer) => {
                let buffer = decodedBuffer.channelData[0];
                let sampleRate = decodedBuffer.sampleRate;
                if(!this.numpyLoaded) reject({ message: "Numpy was not loaded yet, try again in a few seconds" });
                let mfcc = this._mfccFromAudioBuffer(buffer, sampleRate);
                console.log(mfcc);
                resolve(mfcc);
            });
        });
    }

    plot(spectrogram) {

    }
}

