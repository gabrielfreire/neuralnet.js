const ui = () => {
    const loading = document.querySelector('.loading');
    const option1btn = document.querySelector('#opt1');
    const option2btn = document.querySelector('#opt2');
    const audioFileLabel = document.querySelector('span[xid="audioFile"]');
    const screamAudioUrl = 'https://raw.githubusercontent.com/oampo/audiofile.js/master/example/audio/WilhelmScream.wav';
    const exampleAudioUrl = 'data/example.wav';
    option1btn.firstChild.textContent = exampleAudioUrl;
    option2btn.firstChild.textContent = screamAudioUrl;
    option1btn.onclick = (event) => audioFileLabel.textContent = event.target.firstChild.textContent; 
    option2btn.onclick = (event) => audioFileLabel.textContent = event.target.firstChild.textContent; 
    return {
        currentAudio: () => audioFileLabel.textContent,
        showLoading: () => loading.style.display = 'block',
        hideLoading: () => loading.style.display = 'none'
    }
}