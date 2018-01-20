const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')

  return Promise.resolve({
    appDirectory: path.join(rootPath, 'AutoCuts-win32-x64/'),
    authors: 'Sandro Huber',
    noMsi: true,
    outputDirectory: path.join(rootPath, 'windows-installer'),
    exe: 'AutoCuts.exe',
    setupExe: 'AutoCutsInstaller.exe'
  })
}