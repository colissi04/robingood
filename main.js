const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    autoHideMenuBar: true,
    menuBarVisible: false
  });

  // Remove a barra de menu completamente
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setMenu(null);

  mainWindow.loadFile('src/index.html');

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir DevTools em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

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

// IPC handlers para funcionalidades futuras
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result;
});

ipcMain.handle('get-video-files', async (event, folderPath) => {
  const fs = require('fs');
  const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp', '.ogv'];
  
  try {
    const files = fs.readdirSync(folderPath);
    const videoFiles = [];
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (videoExtensions.includes(ext)) {
        const filePath = path.join(folderPath, file);
        try {
          const stats = fs.statSync(filePath);
          videoFiles.push({
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime
          });
        } catch (error) {
          // If we can't get stats, still add the file without size info
          videoFiles.push({
            name: file,
            path: filePath,
            size: 0,
            modified: new Date()
          });
        }
      }
    }
    
    return videoFiles;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});

// Handler para salvar progresso de vídeo
ipcMain.handle('save-video-progress', async (event, videoId, currentTime, duration) => {
  // Esta funcionalidade será implementada com localStorage no frontend
  return { success: true };
});

// Handler para obter progresso de vídeo
ipcMain.handle('get-video-progress', async (event, videoId) => {
  // Esta funcionalidade será implementada com localStorage no frontend
  return { currentTime: 0, duration: 0 };
});