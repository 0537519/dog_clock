import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  function createWindow() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      show:false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        preload:path.join(__dirname,'preload.js')
      }
    });
    win.webContents.openDevTools();
  
    if (process.env.NODE_ENV === 'development') {
      win.loadURL('http://localhost:3000')
        .catch(err => console.error("Error loading URL:", err));
    } else {
      win.loadFile(path.join(__dirname, 'dist', 'index.html'))
        .catch(err => console.error("Error loading file:", err));
    }
     win.show()
  }
  
  app.whenReady().then(createWindow);
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

 
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  