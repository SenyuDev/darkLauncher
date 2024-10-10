const openButton = document.getElementById('btn');
const progressBar = document.getElementById('progressBar');
const progressFill = progressBar.querySelector('.progress-fill');
const progressText = document.getElementById('progressText');
const progressContainer = document.querySelector('.progress-container');
const profileText = document.querySelector('.profile-text');

const profileImage = document.getElementById('profileImage');

const loadingOverlay = document.getElementById('loadingOverlay');

let plName = "Steve"
const link = "https://skins.danielraybone.com/v1/head/"+plName

profileImage.src = link

openButton.addEventListener('click', () => {
    console.log('Botón clickeado, enviando evento al main process');
    openButton.disabled = true;
    progressContainer.style.display = 'block';

    window.electronAPI.openButton();
});

window.electronAPI.onUpdatePlayerName((event, playerName) => {
    profileText.textContent = playerName;
    console.log(`Nombre del jugador actualizado: ${playerName}`);
    plName = playerName
    profileImage.src = "https://skins.danielraybone.com/v1/head/"+playerName
    loadingOverlay.style.display = 'none';
});

const unsubscribeProgressUpdate = window.electronAPI.onProgressUpdate((event, prog) => {
    const percentage = Math.round((prog.task / prog.total) * 100);
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% - ${prog.type}`;
    // Hay que quitar esto q si no parece q termino de cargar y no incio xd
    // if (prog.type === "assets" && percentage === 100) {
    //     progressContainer.style.display = "none"
    // }
});

window.addEventListener('beforeunload', () => {
    unsubscribeProgressUpdate();
});
