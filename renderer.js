const openButton = document.getElementById('btn')
openButton.addEventListener('click', () => {
    console.log('Botón clickeado, enviando evento al main process');
    window.electronAPI.openButton()
})