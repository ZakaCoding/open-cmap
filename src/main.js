/***********
**  
*   Credit : https://github.com/haruncpi
*   Extend : https://github.com/ZakaCoding
**
*******/

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const { app, ipcMain, BrowserWindow, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

app.on('ready', () => {
  createWindow();
});

// config server
const port = 8000;
const host = '127.0.0.1';
const serverUrl = `http://${host}:${port}`;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;
let phpServer;
const setupConfig = path.join(__dirname, 'config', 'setup-status.txt');

let isFirstSetup = () => {
  // // Create the file path for the setup status file within the 'src' directory
  // Check if the setup status file exists
  const data = fs.readFileSync(setupConfig, 'utf8');
  if (data) {
    return data;
  }
  return true;
};

// Prerequisite
function checkInstallation() {
  const request = http.get(serverUrl, (response) => {
    if (response.statusCode === 200) {
      // Connection to the URL is successful
      mainWindow.loadURL(serverUrl);
    } else {
      // Connection failed or received a non-200 status code
      // mainWindow.loadFile('error.html'); // Load an error page or handle the error
      mainWindow.loadURL(`file://${__dirname}/index.html`);
    }
  });

  request.on('error', (err) => {
    // An error occurred while connecting to the URL
    mainWindow.loadFile('error.html'); // Load an error page or handle the error
  });
}

// Logic Function
function createWindow() {
  // Start the PHP server as a child process
  phpServer = spawn('php', ['-S', `${host}:${port}`, '-t', path.join(__dirname, 'www/public')]);

  // Get the primary display's dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load the setup.html file if it's the first setup
  if (isFirstSetup) {
    checkInstallation();
  } else {
    // Load your main application HTML file here
    // For example: mainWindow.loadFile('path/to/your/main-app.html');
    mainWindow.loadURL(serverUrl);
  }

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

function restartApp() {
  app.relaunch(); // Relaunch the app
  app.exit(0);   // Exit the current instance of the app
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

// Handle communication from the renderer process
ipcMain.on('setup-complete', () => {
  // Logic to handle setup completion, e.g., open the main window
  // You can define this logic based on your application's needs
  // For example: mainWindow.loadFile('path/to/your/main-app.html');
  // mainWindow.loadURL(serverUrl);

  // Set to false to indicate that the setup is completed
  isFirstSetup = false;

  // write config/setup-status.txt
  fs.writeFileSync(setupConfig, 'false', 'utf8');

  // Restart an APP
  restartApp();
});