const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const serve = require('serve-handler');

let mainWindow;
let backendProcess;

// 1. SAFELY START BACKEND
function startBackend() {
  const isPackaged = app.isPackaged;
  const backendPath = isPackaged
    ? path.join(process.resourcesPath, 'backend-server.exe')
    : path.join(__dirname, '..', 'backend', 'dist', 'backend-server.exe');

  console.log("Launching backend from:", backendPath);

  try {
    backendProcess = spawn(backendPath, [], {
      cwd: path.dirname(backendPath),
      detached: false,
      stdio: 'ignore',
      windowsHide: true
    });
  } catch (e) {
    console.error("Backend failed:", e);
  }
}

// 2. CREATE MAIN WINDOW
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../buildResources/icon.ico'),
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  // Load App
  if (app.isPackaged) {
    const server = http.createServer((req, res) => serve(req, res, { public: path.join(__dirname, '..', 'out') }));
    server.listen(0, () => {
      mainWindow.loadURL(`http://localhost:${server.address().port}`);
    });
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  // Show window once content is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => {
  if (backendProcess) backendProcess.kill();
});