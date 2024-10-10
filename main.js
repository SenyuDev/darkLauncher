const { app, BrowserWindow, ipcMain } = require('electron')

const path = require('node:path')
const { updateElectronApp, UpdateSourceType } = require('update-electron-app');

updateElectronApp({
  updateSource: {
    type: UpdateSourceType.ElectronPublicUpdateService,
    repo: 'SenyuDev/darkLauncher' 
  },
  updateInterval: '10 minutes'
});



const { Client } = require("minecraft-launcher-core");

const launcher = new Client();
const { Auth } = require("msmc");
const authManager = new Auth("select_account");

const { forge } = require("tomate-loaders")


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon:path.join(__dirname,"assets","icono.ico"),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false 
        }
    })

    win.loadFile('index.html')
}

let prog = {
    type: "assets",
    task: 0,
    total: 10
}

async function launchMc(event, xboxManager) {
    const token = await xboxManager.getMinecraft();

    console.log(token.profile.name)
    // event.sender.send(token.profile.name)

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
        customArgs: [
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
    launcher.on("progress", (e) => {
        prog = e;
        event.sender.send('progress-update', prog); 
    });;
}

let playerName = "Hola Mundo";

app.whenReady().then(async () => {
    ipcMain.handle('ping', () => 'pong');
    ipcMain.handle('playerName', () => playerName);

    createWindow();

    try {
        const xboxManager = await authManager.launch("electron");
        const token = await xboxManager.getMinecraft();
        
        playerName = token.profile.name;

        const allWindows = BrowserWindow.getAllWindows();
        if (allWindows.length > 0) {
            allWindows[0].webContents.send('updatePlayerName', playerName);
        }

        ipcMain.on('openButton', (event) => launchMc(event, xboxManager));
    } catch (error) {
        console.error('Error during authentication:', error);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})