const { app, BrowserWindow, ipcMain, screen } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.whenReady().then(() => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: Math.floor(width),
        height: Math.floor(height),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
});

ipcMain.on('run-python', (event) => {
    const scriptsPath = path.join(__dirname, 'scripts.json');
    
    // Read the scripts.json file
    fs.readFile(scriptsPath, 'utf8', (err, data) => {
        if (err) {
            event.reply('python-output', `Error: ${err.message}`);
            return;
        }

        const scripts = JSON.parse(data).scripts;

        // Function to run scripts sequentially
        let scriptIndex = 0;
        const runNextScript = () => {
            if (scriptIndex < scripts.length) {
                const script = scripts[scriptIndex];
                const scriptPath = path.join(__dirname, script.name);
                
                // Run the current script
                const process = spawn('python', [scriptPath]);

                process.stdout.on('data', (data) => {
                    event.reply('python-output', `Output from ${script.name}: \n${data.toString()}`);
                });

                process.stderr.on('data', (data) => {
                    event.reply('python-output', `Error in ${script.name}: ${data.toString()}`);
                });

                process.on('close', () => {
                    scriptIndex++;
                    runNextScript(); // Run the next script after the current one finishes
                });
            } else {
                event.reply('python-output', 'All scripts executed successfully.');
            }
        };

        runNextScript(); // Start running scripts sequentially
    });
});
