const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    uploadFile: (filePath) => ipcRenderer.send('upload-file', filePath),
    onUploadFileSuccess: (callback) => ipcRenderer.on('upload-file-success', callback),
    onUploadFileFail: (callback) => ipcRenderer.on('upload-file-fail', callback),
    selectDirectory: () => ipcRenderer.send('select-directory'),
    onSelectedDirectory: (callback) => ipcRenderer.on('selected-directory', callback),
    readDirectory: (directoryPath) => ipcRenderer.send('read-directory', directoryPath),
    onReadDirectory: (callback) => ipcRenderer.on('read-directory-response', callback),
});
