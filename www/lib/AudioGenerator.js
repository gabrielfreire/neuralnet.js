const py = (code) => {
    return pyodide.runPython(code);
}
class AudioGenerator {
    constructor() {
        this.context = new AudioContext();
        this.numpyLoaded = false;
        pyodide.loadPackage('numpy').then(() => {
            py(`import numpy as np\nfrom numpy.lib.stride_tricks import as_strided`);
            py(this._spectrogram());
            this.pySpectrogram = pyodide.pyimport('spectrogram');
            // this.pyPlotSpectrogramFeature = pyodide.pyimport('plot_spectrogram_feature');
            this.numpyLoaded = true;
            console.log('numpy loaded');
        });
        
        this.wavDecoder = new WAVDecoder();
    }
    _soundFile(filePath) {
        return new Promise((resolve, reject) => {
            console.info('_soundFile()');
            const request = new XMLHttpRequest();
            request.open('GET', filePath, true);
            request.responseType = 'arraybuffer';
            request.onreadystatechange = function(event) {
              if (request.readyState == 4) {
                if (request.status == 200 || request.status == 0) {
                  resolve(request.response); 
                } else {
                  reject({error: '404 Not found'});
                }
              }
            };
            request.send(null);
          });
    }
    _spectrogram () {
        return `def spectrogram(audioBuffer, step, wind, sample_rate):
        max_freq = 8000
        eps = 1e-14
        samples = np.fromstring(audioBuffer, dtype='float32', sep=',')

        assert not np.iscomplexobj(samples), "Must not pass in complex numbers"

        hop_length = int(0.001 * step * sample_rate)
        fft_length = int(0.001 * wind * sample_rate)
        window = np.hanning(fft_length)[:, None]
        window_norm = np.sum(window ** 2)
        scale = window_norm * sample_rate
        trunc = (len(samples) - fft_length) % hop_length
        x = samples[:len(samples) - trunc]
        nshape = (fft_length, (len(x) - fft_length) // hop_length + 1)
        nstrides = (x.strides[0], x.strides[0] * hop_length)
        x = as_strided(x, shape=nshape, strides=nstrides)

        assert np.all(x[:, 1] == samples[hop_length:(hop_length + fft_length)])

        x = np.fft.rfft(x * window, axis=0)
        x = np.absolute(x)**2
        x[1:-1, :] *= (2.0 / scale)
        x[(0, -1), :] /= scale
        freqs = float(sample_rate) / fft_length * np.arange(x.shape[0])
        ind = np.where(freqs <= max_freq)[0][-1] + 1
        result = np.transpose(np.log(x[:ind, :] + eps))
        
        return result`
    }

    // http://haythamfayek.com/2016/04/21/speech-processing-for-machine-learning.html
    _spectrogramFromAudioBuffer (audioBuffer, step, wind, sampleRate) {
        let buff = audioBuffer.toString();
        let spectrogram = this.pySpectrogram(buff, step, wind, sampleRate);
        return { spectrogram: spectrogram };
    }
    spectrogramFromFile (filePath, step, wind) {
        const self = this;
        let spec = null;
        return new Promise((resolve, reject) => {
            this._soundFile(filePath).then((arrayBuffer) => {
                let audioBuffer = this.wavDecoder.decode(arrayBuffer);
                console.log(audioBuffer);
                let buffer = audioBuffer.channelData[0];
                let sampleRate = audioBuffer.sampleRate;
                if(!this.numpyLoaded) reject({ message: "Numpy was not loaded yet, try again in a few seconds" });
                spec = this._spectrogramFromAudioBuffer(buffer, step, wind, sampleRate);
                console.log(spec);
                resolve(spec);
                
            });
            
        });
    }

    plot(spectrogram) {

    }
    

      
}

