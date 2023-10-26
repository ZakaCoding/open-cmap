/***********
**  
*   Credit : https://github.com/haruncpi
*   Extend : https://github.com/ZakaCoding
**
*******/

const electron = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const BrowserWindow = electron.BrowserWindow;
const app = electron.app;

app.on('ready', () => {
  createWindow();
});

const port = 8000;
const host = '127.0.0.1';
const serverUrl = `http://${host}:${port}`;

let phpServer;

function createWindow() {
  // Start the PHP server as a child process
  phpServer = spawn('php', ['-S', `${host}:${port}`, '-t', path.join(__dirname, 'www/public')]);

  // Create the browser window.
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(serverUrl);

  mainWindow.webContents.once('dom-ready', function () {
    mainWindow.show();
    mainWindow.maximize();
    // mainWindow.webContents.openDevTools()
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Stop the PHP server
    if (phpServer) {
      phpServer.kill();
    }
    mainWindow = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});