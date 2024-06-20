const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { dialog } = require('electron');
const chokidar = require('chokidar');
const FormData = require('form-data'); // Assurez-vous que FormData est importé

let mainWindow;
let watcher;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Important for security
            enableRemoteModule: false, // Disable remote module if not needed
        },
    });

    mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('upload-file', async (event, filePath) => {
    console.log(`Attempting to upload file: ${filePath}`);
    const file = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    formData.append('file', file, fileName);

    try {
        const res = await axios.post('http://localhost:5000/api/files/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'x-auth-token': 'your_jwt_token', // Replace with a valid token or mechanism to fetch token
            },
        });
        console.log('Upload successful:', res.data);
        event.reply('upload-file-success', res.data);
    } catch (error) {
        console.error('Upload failed:', error.message);
        event.reply('upload-file-fail', error.message);
    }
});

ipcMain.on('select-directory', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (result.canceled) {
        return;
    }

    const directoryPath = result.filePaths[0];
    console.log(`Directory selected: ${directoryPath}`);
    event.reply('selected-directory', directoryPath);

    if (watcher) {
        watcher.close();
    }

    watcher = chokidar.watch(directoryPath, { persistent: true });

    watcher.on('add', filePath => {
        console.log(`File added: ${filePath}`);
        mainWindow.webContents.send('file-added', filePath);
        uploadFile(filePath);
    });

    watcher.on('change', filePath => {
        console.log(`File changed: ${filePath}`);
        mainWindow.webContents.send('file-changed', filePath);
        uploadFile(filePath);
    });

    watcher.on('unlink', filePath => {
        console.log(`File deleted: ${filePath}`);
        mainWindow.webContents.send('file-deleted', filePath);
        deleteFile(filePath);
    });
});

ipcMain.on('read-directory', (event, directoryPath) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Reading directory: ${directoryPath}`);
        event.reply('read-directory-response', files, directoryPath);
    });
});

const uploadFile = async (filePath) => {
    console.log(`Attempting to upload file: ${filePath}`);
    const file = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    formData.append('file', file, fileName);

    try {
        const res = await axios.post('http://localhost:5000/api/files/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'x-auth-token': 'your_jwt_token', // Replace with a valid token or mechanism to fetch token
            },
        });
        console.log('Upload successful:', res.data);
        mainWindow.webContents.send('upload-file-success', { fileUrl: `Uploaded: ${filePath}` });
    } catch (error) {
        console.error('Upload failed:', error.message);
        mainWindow.webContents.send('upload-file-fail', error.message);
    }
};

const deleteFile = async (filePath) => {
    const fileName = path.basename(filePath);
    const key = `your_directory/${fileName}`; // Adjust this according to your storage structure

    try {
        const res = await axios.delete('http://localhost:5000/api/files/delete', {
            data: { key },
            headers: {
                'x-auth-token': 'your_jwt_token', // Replace with a valid token or mechanism to fetch token
            },
        });
        console.log('Delete successful:', res.data);
        mainWindow.webContents.send('delete-file-success', { fileUrl: `Deleted: ${filePath}` });
    } catch (error) {
        console.error('Delete failed:', error.message);
        mainWindow.webContents.send('delete-file-fail', error.message);
    }
};
