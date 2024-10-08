const creditosElement = document.getElementById('creditos');
const text = "Launcher by Dark Basement Studio";
let index = 0;
let writing = true;

function typeEffect() {
  if (writing) {
    if (index < text.length) {
      creditosElement.textContent += text.charAt(index);
      index++;
      setTimeout(typeEffect, 100); 
    } else {
      writing = false; 
      setTimeout(typeEffect, 2000);
    }
  } else {
    if (index > 0) {
      creditosElement.textContent = creditosElement.textContent.slice(0, -1);
      index--;
      setTimeout(typeEffect, 100);
    } else {
      writing = true;
      setTimeout(typeEffect, 500);
    }
  }
}

typeEffect();

const songSelect = document.getElementById('songSelect');
const audioPlayer = document.getElementById('audioPlayer');

songSelect.addEventListener('change', function() {
    const selectedSong = this.value;
    if (selectedSong) {
        audioPlayer.src = selectedSong;
        audioPlayer.play();
    } else {
        audioPlayer.pause();
        audioPlayer.src = "";
    }
});