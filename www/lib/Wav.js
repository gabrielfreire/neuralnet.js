class Wav {

    constructor(){}

    static read(file) {
        return new Promise((resolve, reject) => {
            console.info('read wav');
            const request = new XMLHttpRequest();
            request.open('GET', file, true);
            request.responseType = 'arraybuffer';
            request.onreadystatechange = function(event) {
                if (request.readyState == 4) {
                if (request.status == 200 || request.status == 0) {
                    resolve(Wav.decode(request.response)); 
                } else {
                    reject({error: '404 Not found'});
                }
                }
            };
            request.send(null);
        });
    }

    static decode(buffer) {
        return WAVDecoder.decode(buffer);
    }
}