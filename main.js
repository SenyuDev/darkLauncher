const { app, BrowserWindow, ipcMain } = require('electron')
require('update-electron-app')
const path = require('node:path')


const { Client } = require("minecraft-launcher-core");

const launcher = new Client();
const { Auth } = require("msmc");
const authManager = new Auth("select_account");

const { forge } = require("tomate-loaders")


let mainWindow; // Para mantener una referencia a la ventana principal


const sendPlayerNameToRenderer = (playerName) => {
    if (mainWindow) {
        // Envía el nombre del jugador al renderer una vez que lo tengas
        mainWindow.webContents.send('player-name', playerName);
    }
};

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Asegúrate de que esta ruta es correcta
            nodeIntegration: false, // Necesario por seguridad
            contextIsolation: true, // Para usar contextBridge
            enableRemoteModule: false // Deshabilitar el módulo remoto por seguridad
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
        console.log(prog); // esto imprime el progreso en la consola principal
        event.sender.send('progress-update', prog); // Envía el progreso al renderizador
    });;
}

let playerName = "Hola Mundo";

app.whenReady().then(async () => {
    // Configura los manejadores de IPC antes de crear la ventana
    ipcMain.handle('ping', () => 'pong');
    ipcMain.handle('playerName', () => playerName); // Inicialmente devuelve "Hola Mundo"

    // Luego creas la ventana
    createWindow();

    // Maneja la autenticación de forma asíncrona
    try {
        const xboxManager = await authManager.launch("electron");
        const token = await xboxManager.getMinecraft();
        
        // Actualiza el nombre del jugador una vez que se obtenga el token
        playerName = token.profile.name;

        // Envía el nombre al frontend usando webContents cuando esté listo
        const allWindows = BrowserWindow.getAllWindows();
        if (allWindows.length > 0) {
            allWindows[0].webContents.send('updatePlayerName', playerName);
        }

        // Escucha el evento del botón "openButton" desde el frontend
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