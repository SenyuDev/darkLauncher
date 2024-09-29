const { app, BrowserWindow, ipcMain } = require('electron')
require('update-electron-app')
const path = require('node:path')


const { Client } = require("minecraft-launcher-core");

const launcher = new Client();
const { Auth } = require("msmc");
const authManager = new Auth("select_account");

const { forge } = require("tomate-loaders")

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

function launchMc(event) {
    authManager.launch("electron").then(async (xboxManager) => {
        const token = await xboxManager.getMinecraft();

        const launchConfig = await forge.getMCLCLaunchConfig({
            gameVersion: '1.16.5',
            rootPath: './.minecraft',
        });
        let opts = {
            ...launchConfig,
            authorization: token.mclc(),
            // aqui el link del modpack, de preferencia un link de dropbox, se descargara y descomprimira automaticamente
            //clientPackage: "https://www.dropbox.com/s/1wzy2h1g4uz92sq/dungeon_server.zip?dl=1",
            root: "./.minecraft",
            memory: {
                max: "4G",
                min: "2G",
            },
            customArgs:[
                "-XX:+UnlockExperimentalVMOptions",
                "-XX:+UseG1GC",
                "-XX:G1NewSizePercent=20",
                "-XX:G1ReservePercent=20",
                "-XX:MaxGCPauseMillis=50",
                "-XX:G1HeapRegionSize=32M"
              ]
        };
        console.log("Starting!");
        launcher.launch(opts);

        launcher.on("debug", (e) => console.log(e));
        launcher.on("data", (e) => console.log(e));
        launcher.on("progress", (e)=>console.log(e))
    });
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    ipcMain.on('openButton', launchMc)
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})