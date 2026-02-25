const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const serve = require('serve-handler');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const IS_DEV = !app.isPackaged;
const VERSION_CHECK_URL = IS_DEV
  ? 'http://127.0.0.1:8080/version.json'
  : 'https://raw.githubusercontent.com/Garia-IT-Solutions/certificate-manager/main/version.json';

const INSTALL_DIR = path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'MarineTrackerPro');
const HEALTH_CHECK_DELAY_MS = 30000; // 30 seconds

// Read app version from package.json (app.getVersion() returns Electron's version in dev mode)
const APP_VERSION = require(path.join(__dirname, '..', 'package.json')).version;

// ─── MENU ─────────────────────────────────────────────────────────────────────
const template = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom', accelerator: 'CommandOrControl+0' },
      { role: 'zoomIn', accelerator: 'CommandOrControl+=' },
      { role: 'zoomOut', accelerator: 'CommandOrControl+-' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { role: 'close' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// ─── GLOBALS ──────────────────────────────────────────────────────────────────
let mainWindow;
let backendProcess;
let updateWin;

// ─── 1. HEALTH CHECK (runs FIRST on every startup) ───────────────────────────
function checkUpdateHealth() {
  const stateFile = path.join(INSTALL_DIR, 'update_state.json');

  if (!fs.existsSync(stateFile)) return;

  let state;
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch (e) {
    // Corrupted state file, remove it and continue normally
    try { fs.unlinkSync(stateFile); } catch (_) { }
    return;
  }

  if (state.status === 'pending_verification') {
    // We just updated. The app is alive — start a health timer.
    console.log('[Updater] Update pending verification. Starting 30s health check...');
    setTimeout(() => {
      try {
        // Still alive after 30s → healthy!
        state.status = 'healthy';
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
        console.log('[Updater] Update verified healthy. Cleaning up backup...');

        // Delete the backup to reclaim disk space
        if (state.backup && fs.existsSync(state.backup)) {
          fs.rmSync(state.backup, { recursive: true, force: true });
          console.log('[Updater] Backup deleted:', state.backup);
        }
      } catch (e) {
        console.error('[Updater] Health confirmation failed:', e.message);
      }
    }, HEALTH_CHECK_DELAY_MS);
  } else if (state.status === 'rollback_needed') {
    // Previous update crashed before the health timer completed.
    // Restore from backup.
    console.log('[Updater] Previous update failed. Rolling back...');
    try {
      if (state.backup && fs.existsSync(state.backup)) {
        // Delete the broken installation
        if (fs.existsSync(INSTALL_DIR)) {
          fs.rmSync(INSTALL_DIR, { recursive: true, force: true });
        }
        fs.renameSync(state.backup, INSTALL_DIR);
        console.log('[Updater] Rollback complete. Restored from:', state.backup);
      }
    } catch (e) {
      console.error('[Updater] Rollback failed:', e.message);
    }
    // Remove state file regardless
    try { fs.unlinkSync(path.join(INSTALL_DIR, 'update_state.json')); } catch (_) { }
  }
}

// ─── 2. BACKEND ───────────────────────────────────────────────────────────────
function startBackend() {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend-server.exe')
    : path.join(__dirname, '..', 'backend', 'dist', 'backend-server.exe');

  console.log('Launching backend from:', backendPath);

  try {
    backendProcess = spawn(backendPath, [], {
      cwd: path.dirname(backendPath),
      detached: false,
      stdio: 'ignore',
      windowsHide: true
    });
  } catch (e) {
    console.error('Backend failed:', e);
  }
}

// ─── 3. MAIN WINDOW ──────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../buildResources/icon.ico'),
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  if (app.isPackaged) {
    const server = http.createServer((req, res) => serve(req, res, { public: path.join(__dirname, '..', 'out') }));

    let currentPort = 38472;

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.warn(`[Server] Port ${currentPort} is in use. Forcefully freeing it to preserve Keep Signed In...`);
        require('child_process').exec(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${currentPort}') do taskkill /f /pid %a`, (err) => {
          setTimeout(() => {
            server.listen(currentPort, '127.0.0.1');
          }, 1500);
        });
      }
    });

    server.listen(currentPort, '127.0.0.1', () => {
      mainWindow.loadURL(`http://localhost:${currentPort}`);
    });
  } else {
    mainWindow.loadURL('http://127.0.0.1:3000');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// ─── 4. UPDATE WINDOW ────────────────────────────────────────────────────────
function openUpdateWindow() {
  updateWin = new BrowserWindow({
    width: 460,
    height: 400,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'updater-preload.js')
    }
  });

  updateWin.loadFile(path.join(__dirname, 'updater.html'));

  updateWin.on('closed', () => {
    updateWin = null;
  });
}

function sendUpdateProgress(data) {
  if (updateWin && !updateWin.isDestroyed()) {
    updateWin.webContents.send('update-progress', data);
  }
}

function sendUpdateComplete() {
  if (updateWin && !updateWin.isDestroyed()) {
    updateWin.webContents.send('update-complete');
  }
}

function sendUpdateError(msg) {
  if (updateWin && !updateWin.isDestroyed()) {
    updateWin.webContents.send('update-error', msg);
  }
}

function sendUpdateRollback(msg) {
  if (updateWin && !updateWin.isDestroyed()) {
    updateWin.webContents.send('update-rollback', msg);
  }
}

// ─── 5. VERSION COMPARISON ───────────────────────────────────────────────────
function compareVersions(a, b) {
  // Returns: 1 if a > b, -1 if a < b, 0 if equal
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

// ─── 6. DOWNLOAD WITH PROGRESS ───────────────────────────────────────────────
function downloadFile(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    // Determine which module to use based on URL
    const httpModule = url.startsWith('https://') ? https : http;

    const request = httpModule.get(url, (response) => {
      // Handle redirects (GitHub uses 302 redirects for releases)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log('[Updater] Following redirect to:', response.headers.location);
        downloadFile(response.headers.location, dest, onProgress)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }

      const totalBytes = parseInt(response.headers['content-length'], 10) || 0;
      let downloadedBytes = 0;
      let lastProgressTime = Date.now();
      let lastDownloadedBytes = 0;

      const file = fs.createWriteStream(dest);

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const now = Date.now();
        const elapsed = (now - lastProgressTime) / 1000;

        // Update progress every 200ms to avoid UI flooding
        if (elapsed >= 0.2) {
          const bytesPerSec = (downloadedBytes - lastDownloadedBytes) / elapsed;
          const speed = formatSpeed(bytesPerSec);
          const percent = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;

          onProgress({
            percent,
            speed,
            downloaded: formatBytes(downloadedBytes),
            total: formatBytes(totalBytes)
          });

          lastProgressTime = now;
          lastDownloadedBytes = downloadedBytes;
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close(() => resolve());
      });

      file.on('error', (err) => {
        fs.unlink(dest, () => { }); // Cleanup partial download
        reject(err);
      });
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => { });
      reject(err);
    });

    // Timeout after 5 minutes
    request.setTimeout(300000, () => {
      request.destroy();
      fs.unlink(dest, () => { });
      reject(new Error('Download timed out'));
    });
  });
}

function formatSpeed(bytesPerSec) {
  if (bytesPerSec >= 1048576) return (bytesPerSec / 1048576).toFixed(1) + ' MB/s';
  if (bytesPerSec >= 1024) return (bytesPerSec / 1024).toFixed(0) + ' KB/s';
  return bytesPerSec.toFixed(0) + ' B/s';
}

function formatBytes(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

// ─── 7. CHECKSUM VERIFICATION ────────────────────────────────────────────────
function verifyChecksum(filePath, expectedHash) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  if (hash !== expectedHash) {
    throw new Error(`Checksum mismatch!\nExpected: ${expectedHash}\nGot:      ${hash}`);
  }
  console.log('[Updater] Checksum verified OK');
  return true;
}

// ─── 8. PERFORM UPDATE (the main orchestrator) ───────────────────────────────
async function performUpdate(versionInfo) {
  const backupDir = INSTALL_DIR + `_backup_${Date.now()}`;
  const tempZip = path.join(os.tmpdir(), `marine-update-${Date.now()}.zip`);
  let backupExists = false;

  try {
    // ── PHASE 1: Download ──────────────────────────────────────
    sendUpdateProgress({
      phase: 'download', percent: 0,
      status: 'Connecting to server...', version: versionInfo.version
    });

    await downloadFile(versionInfo.url, tempZip, (progress) => {
      sendUpdateProgress({
        phase: 'download',
        percent: progress.percent,
        speed: progress.speed,
        status: `${progress.downloaded} / ${progress.total}`,
        version: versionInfo.version
      });
    });

    console.log('[Updater] Download complete:', tempZip);

    // ── PHASE 2: Verify Checksum ──────────────────────────────
    sendUpdateProgress({
      phase: 'verify', percent: 100,
      status: 'Verifying integrity...', version: versionInfo.version
    });

    verifyChecksum(tempZip, versionInfo.sha256);

    // ── PHASE 3: Kill running instances ───────────────────────
    sendUpdateProgress({
      phase: 'extract', percent: 0,
      status: 'Stopping running instances...', version: versionInfo.version
    });

    // ── PHASE 3: Extract to temp directory out-of-process ─────
    sendUpdateProgress({
      phase: 'extract', percent: 0,
      status: 'Extracting update payload...', version: versionInfo.version
    });

    const extractTempDir = path.join(os.tmpdir(), `marine-extract-${Date.now()}`);
    fs.mkdirSync(extractTempDir, { recursive: true });

    // Extract using native Windows PowerShell (Bypasses ASAR module resolution issues)
    try {
      execSync(`powershell.exe -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${extractTempDir}' -Force"`, { stdio: 'pipe' });
      sendUpdateProgress({
        phase: 'extract', percent: 100,
        status: 'Extraction complete.', version: versionInfo.version
      });
    } catch (err) {
      console.error('[Updater] Native extraction failed:', err);
      sendUpdateError('Extraction failed: ' + err.message);
      return;
    }

    // Handle nested folder from zip extraction if necessary
    let actualSourceDir = extractTempDir;
    const targetExe = path.join(INSTALL_DIR, 'MarineTracker Pro.exe');

    if (!fs.existsSync(path.join(extractTempDir, 'MarineTracker Pro.exe'))) {
      const found = findExeRecursive(extractTempDir, 'MarineTracker Pro.exe');
      if (found) {
        actualSourceDir = path.dirname(found);
      }
    }

    sendUpdateProgress({
      phase: 'extract', percent: 100,
      status: 'Applying update...', version: versionInfo.version
    });

    sendUpdateComplete();
    console.log('[Updater] Extraction to temp complete! Creating swap script...');

    // Wait couple seconds for success UI
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ── PHASE 4: Swap script (The only way to overwrite a running EXE on Windows)
    const batPath = path.join(os.tmpdir(), `marine-swap-${Date.now()}.bat`);
    const vbsPath = path.join(os.tmpdir(), `marine-swap-${Date.now()}.vbs`);

    const batCode = `@echo off
timeout /t 2 /nobreak > NUL
taskkill /F /IM "MarineTracker Pro.exe" /T > NUL 2>&1
taskkill /F /IM "backend-server.exe" /T > NUL 2>&1
taskkill /F /IM "MarineTracker.exe" /T > NUL 2>&1
timeout /t 1 /nobreak > NUL

:: Empty the old installation folder
rd /s /q "${INSTALL_DIR}"
timeout /t 1 /nobreak > NUL
mkdir "${INSTALL_DIR}"

:: Copy the new extracted files over seamlessly
xcopy "${actualSourceDir}\\*" "${INSTALL_DIR}\\" /E /I /H /Y /Q > NUL

:: Launch the updated application
start "" "${targetExe}"

:: Cleanup leftover zip
del /q "${tempZip}" > NUL 2>&1

:: Delete this bat file
del "%~f0"
`;

    fs.writeFileSync(batPath, batCode, 'utf8');

    // VBS wrapper to run the BAT file completely invisibly (no black flash)
    const vbsCode = `
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """" & "${batPath}" & """", 0, False
WScript.Sleep 5000
Set fso = CreateObject("Scripting.FileSystemObject")
On Error Resume Next
fso.DeleteFile WScript.ScriptFullName
    `;
    fs.writeFileSync(vbsPath, vbsCode, 'utf8');

    // Fire the invisible swap script
    const { execSync } = require('child_process');
    execSync(`wscript.exe "${vbsPath}"`);

    // Die immediately so the swap script can delete our executable
    app.exit(0);

  } catch (err) {
    console.error('[Updater] Update failed:', err.message);

    // Re-enable ASAR if it was disabled
    process.noAsar = false;

    // 1. Clean up temp download
    try { if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip); } catch (_) { }

    // 2. Clean up failed extraction
    try {
      if (fs.existsSync(INSTALL_DIR) && backupExists) {
        fs.rmSync(INSTALL_DIR, { recursive: true, force: true });
      }
    } catch (_) { }

    // 3. Restore backup
    if (backupExists && fs.existsSync(backupDir)) {
      try {
        fs.renameSync(backupDir, INSTALL_DIR);
        sendUpdateRollback('Update failed. Previous version restored safely.');
        console.log('[Updater] Rollback successful. Restored from:', backupDir);
      } catch (restoreErr) {
        console.error('[Updater] CRITICAL: Rollback failed:', restoreErr.message);
        sendUpdateError('Critical error: Could not restore previous version. Please reinstall.');
        return;
      }
    } else {
      sendUpdateError(err.message);
    }

    // Close update window after 5 seconds, then load the app normally
    setTimeout(() => {
      if (updateWin && !updateWin.isDestroyed()) {
        updateWin.close();
      }
      // Proceed to load the app normally (existing version)
      startBackend();
      createWindow();
    }, 5000);
  }
}

function findExeRecursive(dir, fileName) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const found = findExeRecursive(fullPath, fileName);
        if (found) return found;
      } else if (file === fileName) {
        return fullPath;
      }
    }
  } catch (_) { }
  return null;
}

// ─── 9. CHECK FOR UPDATES ────────────────────────────────────────────────────
async function checkForUpdates() {
  try {
    const versionInfo = await fetchVersionInfo();
    const currentVersion = APP_VERSION;

    console.log(`[Updater] Current: ${currentVersion} | Server: ${versionInfo.version} `);

    if (compareVersions(versionInfo.version, currentVersion) > 0) {
      console.log('[Updater] New version available! Starting update...');

      // Open the update window
      openUpdateWindow();

      // Wait for the window to load before sending events
      updateWin.webContents.on('did-finish-load', () => {
        performUpdate(versionInfo);
      });
    } else {
      console.log('[Updater] App is up to date.');
      // No update needed — start the app normally
      startBackend();
      createWindow();
    }
  } catch (err) {
    console.log('[Updater] Update check failed (offline?):', err.message);
    // Can't reach server — just start the app normally
    startBackend();
    createWindow();
  }
}

function fetchVersionInfo() {
  return new Promise((resolve, reject) => {
    const httpModule = VERSION_CHECK_URL.startsWith('https://') ? https : http;

    const request = httpModule.get(VERSION_CHECK_URL, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        fetchVersionInfoFromUrl(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Version check failed: HTTP ${response.statusCode} `));
        return;
      }

      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const info = JSON.parse(data);
          if (!info.version || !info.url || !info.sha256) {
            reject(new Error('Invalid version.json format'));
            return;
          }
          resolve(info);
        } catch (e) {
          reject(new Error('Failed to parse version.json'));
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Version check timed out'));
    });
  });
}

function fetchVersionInfoFromUrl(url) {
  return new Promise((resolve, reject) => {
    const httpModule = url.startsWith('https://') ? https : http;
    const request = httpModule.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Version check redirect failed: HTTP ${response.statusCode} `));
        return;
      }
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse version.json from redirect'));
        }
      });
    });
    request.on('error', reject);
  });
}

// ─── CLOSE UPDATE WINDOW ──────────────────────────────────────────────────────
ipcMain.on('close-update-window', () => {
  if (updateWin && !updateWin.isDestroyed()) {
    updateWin.close();
  }
  // Start the app normally if it hasn't started yet
  if (!mainWindow) {
    startBackend();
    createWindow();
  }
});

// ─── APP LIFECYCLE ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // 1. Health check FIRST (handles rollback from crashed updates)
  checkUpdateHealth();

  // 2. Check for updates (will start backend + window if no update, 
  //    or open update window if update found)
  checkForUpdates();
});

app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => {
  if (backendProcess) backendProcess.kill();
});