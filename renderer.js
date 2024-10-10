const openButton = document.getElementById('btn');
const progressBar = document.getElementById('progressBar');
const progressFill = progressBar.querySelector('.progress-fill');
const progressText = document.getElementById('progressText');
const progressContainer = document.querySelector('.progress-container');
const profileText = document.querySelector('.profile-text');

// Evento al hacer click en el botón
openButton.addEventListener('click', () => {
    console.log('Botón clickeado, enviando evento al main process');
    openButton.disabled = true;
    progressContainer.style.display = 'block';

    // Envía el evento al main process para iniciar la acción
    window.electronAPI.openButton();
});

// Escuchar el nombre del jugador actualizado desde el main process
window.electronAPI.onUpdatePlayerName((event, playerName) => {
    profileText.textContent = playerName;  // Actualiza el perfil con el nombre real
    console.log(`Nombre del jugador actualizado: ${playerName}`);
});

// Escuchar actualizaciones de progreso
const unsubscribeProgressUpdate = window.electronAPI.onProgressUpdate((event, prog) => {
    const percentage = Math.round((prog.task / prog.total) * 100);
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% - ${prog.type}`;
    if (prog.type === "assets" && percentage === 100){
        progressContainer.style.display = "none"
    }
});

// Limpia el listener de progreso cuando ya no sea necesario
window.addEventListener('beforeunload', () => {
    unsubscribeProgressUpdate();
});
