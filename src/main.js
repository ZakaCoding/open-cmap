/***********
**  
*   Credit : https://github.com/haruncpi
*   Extend : https://github.com/ZakaCoding
**
*******/

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const { app, ipcMain, BrowserWindow, screen, net } = require('electron');
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
    // checkInstallation();
    mainWindow.loadURL(`file://${__dirname}/index.html`);
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


/**
 * Handle communication from the renderer process
 */

// Check setup process
ipcMain.on('setup-complete', () => {
  // Logic to handle setup completion, e.g., open the main window
  // You can define this logic based on your application's needs
  // For example: mainWindow.loadFile('path/to/your/main-app.html');
  mainWindow.loadURL(serverUrl);

  // Set to false to indicate that the setup is completed
  isFirstSetup = false;

  // write config/setup-status.txt
  fs.writeFileSync(setupConfig, 'false', 'utf8');

  // Restart an APP
  // restartApp();
});

// Start installation
ipcMain.on('start-installation', (event) => {
  // Trigger the execution of the batch file
  const installer = path.join(__dirname, '..', 'installation.bat');
  const installationProcess = spawn('cmd.exe', ['/c', installer]);

  /**
   * Just for development check
   */
  // installationProcess.stdout.on('data', (data) => {
  //   event.reply('installation-process', `stdout: ${data}`, true);
  // });

  // installationProcess.stderr.on('data', (data) => {
  //   event.reply('installation-status', `stderr: ${data}`, false); // mean error
  // });

  installationProcess.on('close', (code) => {
    event.reply('installation-status', `child process exited with code ${code}`, true);
  });
});

// Setup database on env files
ipcMain.on('setup-database', (event, formData) => {
  // Now, you have access to the formData object sent from the renderer process
  const { DB_CONNECTION, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = formData;

  // Assuming the .env file path is 'path/to/your/.env'
  const envFilePath = path.join(__dirname, 'www', '.env');

  // Read the content of the .env file
  let content = fs.readFileSync(envFilePath, 'utf8');

  // Update the content based on the configuration received
  content = content.replace(/DB_CONNECTION=.*/, `DB_CONNECTION=${DB_CONNECTION}`);
  content = content.replace(/DB_PORT=.*/, `DB_PORT=${DB_PORT}`);
  content = content.replace(/DB_DATABASE=.*/, `DB_DATABASE=${DB_DATABASE}`);
  content = content.replace(/DB_USERNAME=.*/, `DB_USERNAME=${DB_USERNAME}`);
  content = content.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${DB_PASSWORD}`);

  // Write the modified content back to the .env file
  fs.writeFileSync(envFilePath, content, 'utf8');

  event.reply('database-status', true);
});

// Migration database
ipcMain.on('start-migration', (event) => {
  // Trigger the execution of the batch file
  const installer = path.join(__dirname, '..', 'migration.bat');
  const migrationProcess = spawn('cmd.exe', ['/c', installer]);

  // Set variables to track success and errors
  let successMessage = '';
  let errorMessage = '';
  let migrationErrorHandled = false;

  migrationProcess.stdout.on('data', (data) => {
    successMessage += data;
  });

  migrationProcess.stderr.on('data', (data) => {
    if (!migrationErrorHandled) {
      migrationErrorHandled = true;
      errorMessage += data;
      event.reply('migration-status', errorMessage, 0); // Mean error
    }
  });

  migrationProcess.on('close', (code) => {
    if (code === 0) {
      // If the process exited with code 0, it was successful
      event.reply('migration-status', successMessage, 1); // 1 means success
    }
  });
});

// Check for Composer and send the result to the renderer process
ipcMain.on('check-composer', (event) => {
  const composerCheckProcess = spawn('where', ['composer']);
  composerCheckProcess.on('exit', (code) => {
    event.reply('composer-status', code === 0);
  });
});

// Check for PHP and send the result to the renderer process
ipcMain.on('check-php', (event) => {
  const phpCheckProcess = spawn('where', ['php']);
  phpCheckProcess.on('exit', (code) => {
    event.reply('php-status', code === 0);
  });
});

// Check for Node.js installation and send the result to the renderer process
ipcMain.on('check-node', (event) => {
  const nodeCheckProcess = spawn('where', ['node']);
  nodeCheckProcess.on('exit', (code) => {
    event.reply('node-status', code === 0);
  });
});

// Check for internet connection and send the result to the renderer process
ipcMain.on('check-internet', (event) => {
  const urlToCheck = 'http://www.google.com';

  const request = net.request(urlToCheck);

  request.on('response', (response) => {
    if (response.statusCode === 200) {
      event.reply('internet-status', true);
    } else {
      event.reply('internet-status', false);
    }
  });

  request.on('error', () => {
    event.reply('internet-status', false);
  });

  request.end();
});