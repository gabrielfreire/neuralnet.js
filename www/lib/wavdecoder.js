const data_decoders = {
    pcm8: (buffer, offset, output, channels, samples) => {
      let input = new Uint8Array(buffer, offset);
      let pos = 0;
      for (let i = 0; i < samples; ++i) {
        for (let ch = 0; ch < channels; ++ch) {
          let data = input[pos++] - 128;
          output[ch][i] = data < 0 ? data / 128 : data / 127;
        }
      }
    },
    pcm16: (buffer, offset, output, channels, samples) => {
      let input = new Int16Array(buffer, offset);
      let pos = 0;
      for (let i = 0; i < samples; ++i) {
        for (let ch = 0; ch < channels; ++ch) {
          let data = input[pos++];
          output[ch][i] = data < 0 ? data / 32768 : data / 32767;
        }
      }
    },
    pcm24: (buffer, offset, output, channels, samples) => {
      let input = new Uint8Array(buffer, offset);
      let pos = 0;
      for (let i = 0; i < samples; ++i) {
        for (let ch = 0; ch < channels; ++ch) {
          let x0 = input[pos++];
          let x1 = input[pos++];
          let x2 = input[pos++];
          let xx = (x0 + (x1 << 8) + (x2 << 16));
          let data = xx > 0x800000 ? xx - 0x1000000 : xx;
          output[ch][i] = data < 0 ? data / 8388608 : data / 8388607;
        }
      }
    },
    pcm32: (buffer, offset, output, channels, samples) => {
      let input = new Int32Array(buffer, offset);
      let pos = 0;
      for (let i = 0; i < samples; ++i) {
        for (let ch = 0; ch < channels; ++ch) {
          let data = input[pos++];
          output[ch][i] = data < 0 ? data / 2147483648 : data / 2147483647;
        }
      }
    },
    pcm32f: (buffer, offset, output, channels, samples) => {
      let input = new Float32Array(buffer, offset);
      let pos = 0;
      for (let i = 0; i < samples; ++i) {
        for (let ch = 0; ch < channels; ++ch)
          output[ch][i] = input[pos++];
      }
    },
    pcm64f: (buffer, offset, output, channels, samples) => {
      let input = new Float64Array(buffer, offset);
      let pos = 0;
      for (let i = 0; i < samples; ++i) {
        for (let ch = 0; ch < channels; ++ch)
          output[ch][i] = input[pos++];
      }
    },
};
class WAVDecoder {
    constructor(){}

    decode(buffer) {
        let pos = 0, end = 0;
        if (buffer.buffer) {
          // If we are handed a typed array or a buffer, then we have to consider the
          // offset and length into the underlying array buffer.
          pos = buffer.byteOffset;
          end = buffer.length;
          buffer = buffer.buffer;
        } else {
          // If we are handed a straight up array buffer, start at offset 0 and use
          // the full length of the buffer.
          pos = 0;
          end = buffer.byteLength;
        }
      
        let v = new DataView(buffer);
      
        function u8() {
          let x = v.getUint8(pos);
          pos++;
          return x;
        }
      
        function u16() {
          let x = v.getUint16(pos, true);
          pos += 2;
          return x;
        }
      
        function u32() {
          let x = v.getUint32(pos, true);
          pos += 4;
          return x;
        }
      
        function string(len) {
          let str = '';
          for (let i = 0; i < len; ++i)
            str += String.fromCharCode(u8());
          return str;
        }
      
        if (string(4) !== 'RIFF')
          throw new TypeError('Invalid WAV file');
        u32();
        if (string(4) !== 'WAVE')
          throw new TypeError('Invalid WAV file');
      
        let fmt;
        
        while (pos < end) {
          let type = string(4);
          let size = u32();
          let next = pos + size;
          switch (type) {
          case 'fmt ':
            let formatId = u16();
            if (formatId !== 0x0001 && formatId !== 0x0003)
              throw new TypeError('Unsupported format in WAV file: ' + formatId.toString(16));
            fmt = {
              format: 'lpcm',
              floatingPoint: formatId === 0x0003,
              channels: u16(),
              sampleRate: u32(),
              byteRate: u32(),
              blockSize: u16(),
              bitDepth: u16(),
            };
            break;
          case 'data':
            if (!fmt)
              throw new TypeError('Missing "fmt " chunk.');
            let samples = Math.floor(size / fmt.blockSize);
            let channels = fmt.channels;
            let sampleRate = fmt.sampleRate;
            let channelData = [];
            for (let ch = 0; ch < channels; ++ch)
              channelData[ch] = new Float32Array(samples);
            this._lookup(data_decoders, fmt.bitDepth, fmt.floatingPoint)(buffer, pos, channelData, channels, samples);
            return {
              sampleRate: sampleRate,
              channelData: channelData
            };
            break;
          }
          pos = next;
        }
      }
      _lookup(table, bitDepth, floatingPoint) {
        let name = 'pcm' + bitDepth + (floatingPoint ? 'f' : '');
        let fn = table[name];
        if (!fn)
          throw new TypeError('Unsupported data format: ' + name);
        return fn;
      }
}