const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('userWinManagement', {
    minimizeWindows: (mod) => ipcRenderer.send('user-win-management', mod),
    windowsSet: (winSizeInfo) => ipcRenderer.on('user-window-resize', winSizeInfo),
    windowIsMaximize: (IsMaximize) => ipcRenderer.on('user-window-is-maximize', IsMaximize),
})

contextBridge.exposeInMainWorld('userSerialHandle', {
    checkSerialPort: (portInfo, mod) => ipcRenderer.send('user-serial-port-check', portInfo, mod),
    serialInfoGet: (portInfo, addOrDel) => ipcRenderer.on('user-serial-info-get', portInfo, addOrDel),
})

contextBridge.exposeInMainWorld('API', {
    openUrl: (url) => ipcRenderer.send('user-open-url', url),
})

// contextBridge.exposeInMainWorld('api', {
//     serialInfoGet: (portInfo, addOrDel) => ipcRenderer.on('user-serial-info-get', portInfo, addOrDel),
// })