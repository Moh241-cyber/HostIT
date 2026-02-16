document.getElementById('select-directory').addEventListener('click', () => {
    console.log('Select directory button clicked');
    window.electron.selectDirectory();
});

window.electron.onSelectedDirectory((event, directoryPath) => {
    console.log(`Directory selected: ${directoryPath}`);
    window.electron.readDirectory(directoryPath);
});

window.electron.onReadDirectory((event, files, directoryPath) => {
    console.log(`Reading directory: ${directoryPath}`);
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file;

        listItem.addEventListener('click', () => {
            console.log(`File clicked: ${file}`);
            window.electron.uploadFile(path.join(directoryPath, file));
        });

        fileList.appendChild(listItem);
    });
});

window.electron.onUploadFileSuccess((event, data) => {
    console.log('Upload success:', data);
    alert('File uploaded successfully: ' + data.fileUrl);
});

window.electron.onUploadFileFail((event, message) => {
    console.error('Upload fail:', message);
    alert('File upload failed: ' + message);
});

window.electron.onFileAdded((event, filePath) => {
    console.log('File added:', filePath);
});

window.electron.onFileChanged((event, filePath) => {
    console.log('File changed:', filePath);
});

window.electron.onFileDeleted((event, filePath) => {
    console.log('File deleted:', filePath);
});
