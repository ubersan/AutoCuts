const { app, BrowserWindow, Menu } = require('electron')

const path = require('path')
const url = require('url')
const shell = require('electron').shell

// squirrel stuff for installer
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
   // squirrel event handled and app will exit in 1000ms, so don't do anything else
   return;
}

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 950,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/assets/logo.png`,
    //skipTaskbar: true,
    //toolbar: false
  })

  mainWindow.setMenu(null);

  mainWindow.loadURL(`file://${__dirname}/dist/index.html`)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  /*var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        { label: 'First Label' },
        { 
          label: 'Browse',
          click() {
            shell.openExternal('http://google.com')
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {
            app.quit()
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)*/
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})