import { app, BrowserWindow, ipcMain } from 'electron';
import 'update-electron-app';
import path from 'node:path';
import { fileURLToPath } from 'node:url';  // Importar fileURLToPath para convertir URLs a rutas

// Obtener __filename y __dirname
const __filename = fileURLToPath(import.meta.url);  // Obtener la ruta del archivo actual
const __dirname = path.dirname(__filename);  // Obtener el directorio del archivo actual

import { Client } from "minecraft-launcher-core";
import { Auth } from "msmc";
import { forge } from "tomate-loaders";

// Inicialización del launcher y autenticación
const launcher = new Client();
const authManager = new Auth("select_account");

// Función para crear la ventana
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')  // Asegúrate de que 'preload.js' sea compatible con ES Modules si lo utilizas
        }
    });

    win.loadFile('index.html');
};

// Estado del progreso
let prog = {
    type: "assets",
    task: 0,
    total: 10
};

// Función para lanzar Minecraft
async function launchMc(event) {
    try {
        const xboxManager = await authManager.launch("electron");
        const token = await xboxManager.getMinecraft();

        const launchConfig = await forge.getMCLCLaunchConfig({
            gameVersion: '1.16.5',
            rootPath: './.minecraft',
        });

        let opts = {
            ...launchConfig,
            authorization: token.mclc(),
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
            console.log(prog); // Imprime el progreso en la consola principal
            event.sender.send('progress-update', prog); // Envía el progreso al renderizador
        });

    } catch (error) {
        console.error("Error launching Minecraft:", error);
    }
}

// Inicialización de la aplicación
app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong');
    ipcMain.on('openButton', launchMc);
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Cierra la aplicación si todas las ventanas están cerradas, excepto en macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
