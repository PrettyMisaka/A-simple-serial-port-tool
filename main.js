const { app, BrowserWindow, ipcMain } = require('electron')
const { globalShortcut } = require('electron')
    // const { webContents, permission, requestingOrigin, details } = require('electron')
    // const { Tray, Menu, nativeImage } = require('electron') //创建 Tray 图标所需api
const path = require('path')

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        width: 800,
        height: 600,
        // minWidth: 800,
        // minHeight: 560,
        minWidth: 400,
        minHeight: 40,
        frame: false,
        // backgroundColor: 'white',
        show: false,
        // opacity: 0.9,
        // transparent: true,
    })
    mainWindow.loadFile('index.html')
        // mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        //     if (permission === 'serial') {
        //         // Add logic here to determine if permission should be given to allow serial selection
        //         return true
        //     }
        //     return false
        // })
    mainWindow.once('ready-to-show', () => {
        // openDefaultBrowser('https://www.baidu.com');
        mainWindow.webContents.send('user-window-resize', [800, 600]);
        mainWindow.show()
    })

    function winHtmlSizeSet() {
        console.log(mainWindow.getSize());
        mainWindow.webContents.send('user-window-resize', mainWindow.getSize())
    }
    mainWindow.on('resize', winHtmlSizeSet)
    mainWindow.on('maximize', () => {
        winHtmlSizeSet();
        mainWindow.webContents.send('user-window-is-maximize', true)
    })
    mainWindow.on('unmaximize', () => {
        winHtmlSizeSet();
        mainWindow.webContents.send('user-window-is-maximize', false)
    })
    mainWindow.on('enter-full-screen', () => {
        setTimeout(winHtmlSizeSet, 100);
    })
    mainWindow.on('leave-full-screen', () => {
        setTimeout(winHtmlSizeSet, 100);
    })
}

function SerialInit() {
    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        if (permission === 'serial') {
            // Add logic here to determine if permission should be given to allow serial selection
            return true
        }
        return false
    })

    // Optionally, retrieve previously persisted devices from a persistent store
    // const grantedDevices = fetchGrantedDevices()

    // mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    //     if (new URL(details.origin).hostname === 'some-host' && details.deviceType === 'serial') {
    //         if (details.device.vendorId === 123 && details.device.productId === 345) {
    //             // Always allow this type of device (this allows skipping the call to `navigator.serial.requestPort` first)
    //             return true
    //         }
    //         // Search through the list of devices that have previously been granted permission
    //         return grantedDevices.some((grantedDevice) => {
    //             return grantedDevice.vendorId === details.device.vendorId &&
    //                 grantedDevice.productId === details.device.productId &&
    //                 grantedDevice.serialNumber && grantedDevice.serialNumber === details.device.serialNumber
    //         })
    //     }
    //     return false
    // })

    let isLisenPortCheck = false;
    let userChoosePortInfo = null;
    ipcMain.on('user-serial-port-check', (event, portInfo, mod) => {
        isLisenPortCheck = mod;
        userChoosePortInfo = portInfo;
        // isLisenPortCheck = true;
        // if (mod) {
        //     mainWindow.setOpacity(1.0);
        //     callback(portInfo.portId);
        //     isFirstOpen = false;
        //     return;
        // } else {
        //     mainWindow.setOpacity(0.9);
        // }
        // console.log(portInfo);
    })
    mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
        event.preventDefault()
        for (let i = 0; i < portList.length; i++) {
            mainWindow.webContents.send('user-serial-info-get', portList[i], true); //true 添加串口信息 false删除
            console.log(portList[i]);
        }
        mainWindow.webContents.session.on('serial-port-added', (event, addPortInfo, webContents) => {
            mainWindow.webContents.send('user-serial-info-get', addPortInfo, true);
        })
        mainWindow.webContents.session.on('serial-port-removed', (event, removePortInfo, webContents) => {
            mainWindow.webContents.send('user-serial-info-get', removePortInfo, false);
        })

        if (isLisenPortCheck === true) {
            callback(userChoosePortInfo.portId);
            isLisenPortCheck = false;
        } else {
            callback('');
        }

        ipcMain.on('user-serial-port-select', (_event, portNumStr) => {

        })

    })


}


function ipcMainEventInit() {
    ipcMain.on('user-open-url', (event, url) => {
        openDefaultBrowser(url);
    })
    ipcMain.on('user-win-management', (event, mod) => { //导航栏三个按钮设定
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
            // const win = mainWindow;
        switch (mod) {
            case 0:
                win.minimize();
                break;
            case 1:
                if (win.isMaximized()) win.unmaximize();
                else win.maximize();
                break;
            case 2:
                win.close()
                break;
            default:
                break;
        }
    })
}

app.whenReady().then(() => {
    createWindow()
    ipcMainEventInit()
    SerialInit()

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    globalShortcut.register('Alt+E', () => {
        console.log('Electron loves global shortcuts!')
    })


    // const icon = nativeImage.createFromPath('path/to/asset.png')
    // tray = new Tray(icon)
    // const contextMenu = Menu.buildFromTemplate([
    //     { label: 'Item1', type: 'radio' },
    //     { label: 'Item2', type: 'radio' },
    //     { label: 'Item3', type: 'radio', checked: true },
    //     { label: 'Item4', type: 'radio' },
    //     { label: '显示窗口', role: 'window' },
    //     { label: '最小化', role: 'minimize', click: function() {} },
    //     {
    //         label: '关闭',
    //         role: 'close',
    //         click: function() {
    //             console.log('hello');
    //             app.quit();
    //         }
    //     }
    // ])

    // tray.setContextMenu(contextMenu)
    // tray.setToolTip('This is my application')
    // tray.setTitle('This is my title')


})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})


// 打开新窗口
const openDefaultBrowser = function(url) {
        var exec = require('child_process').exec;
        console.log(process.platform)
        switch (process.platform) {
            case "darwin":
                exec('open ' + url);
                break;
            case "win32":
                exec('start ' + url);
                break;
            default:
                exec('xdg-open', [url]);
        }
    }
    // app.setUserTasks([{
    //     program: process.execPath,
    //     arguments: '--new-window',
    //     iconPath: process.execPath,
    //     iconIndex: 0,
    //     title: 'New Window',
    //     description: 'Create a new window'
    // }])