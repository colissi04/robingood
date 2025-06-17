const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs do Electron para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    getVideoFiles: (folderPath) => ipcRenderer.invoke('get-video-files', folderPath),
    saveVideoProgress: (videoId, currentTime, duration) => ipcRenderer.invoke('save-video-progress', videoId, currentTime, duration),
    getVideoProgress: (videoId) => ipcRenderer.invoke('get-video-progress', videoId)
}); 