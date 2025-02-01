const { ipcRenderer } = require('electron');

document.getElementById('runPython').addEventListener('click', () => {
    document.getElementById('output').innerText = ""; // Clear output
    ipcRenderer.send('run-python');
});

ipcRenderer.on('python-output', (event, output) => {
    document.getElementById('output').innerText += output;
});
