const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    openButton: () => ipcRenderer.send('openButton'),
    onProgressUpdate: (callback) => {
        ipcRenderer.on('progress-update', callback);

        return () => ipcRenderer.removeListener('progress-update', callback);
    },
    playerName: () => ipcRenderer.invoke('playerName'),
    onUpdatePlayerName: (callback) => {
        ipcRenderer.on('updatePlayerName', callback);

        return () => ipcRenderer.removeListener('updatePlayerName', callback);
    }
});

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping')
});
