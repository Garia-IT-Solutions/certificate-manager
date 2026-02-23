const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('updater', {
    onProgress: (cb) => ipcRenderer.on('update-progress', (e, data) => cb(data)),
    onComplete: (cb) => ipcRenderer.on('update-complete', (e) => cb()),
    onError: (cb) => ipcRenderer.on('update-error', (e, msg) => cb(msg)),
    onRollback: (cb) => ipcRenderer.on('update-rollback', (e, msg) => cb(msg)),
    close: () => ipcRenderer.send('close-update-window')
});
