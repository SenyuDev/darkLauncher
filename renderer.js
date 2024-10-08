const openButton = document.getElementById('btn')
openButton.addEventListener('click', () => {
    console.log('Botón clickeado, enviando evento al main process');
    window.electronAPI.openButton()
})

window.electronAPI.onProgressUpdate((event, prog) => {
    console.log('Progreso de descarga:', prog);
});
