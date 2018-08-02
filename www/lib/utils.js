
const bufferToWavBlob = function (audioBuffer) {
    let dataView = new DataView(audioBuffer);
    let blob = new Blob([dataView], {type: 'audio/wav'});
    return blob;
}

const blobToBuffer = function (wavBlob, callback) {
    let reader = new FileReader();
    reader.readAsArrayBuffer(wavBlob);
    reader.onload = function() {
        callback(reader.result);
    }
}