// Hub Controller for Undertale Last Breath: All-in-One

let currentMode = null;
let currentProjectId = null;

function launchGame(projectId, title) {
  if (projectId === '399767686') {
    window.location.href = 'ulb_p1.html';
  } else if (projectId === '422254442') {
    window.location.href = 'ulb_p3.html';
  } else if (projectId === '722618695') {
    window.location.href = 'ulb_sim.html';
  } else {
    window.location.href = 'ulb_p1.html';
  }
}

function launchResurrection() {
  currentMode = 'resurrection';
  currentProjectId = null;

  document.getElementById('hub-screen').style.display = 'none';
  document.getElementById('player-screen').style.display = 'flex';
  document.getElementById('current-game-title').innerText = "Last Breath: Resurrection";

  document.getElementById('iframe-wrapper').style.display = 'none';
  document.getElementById('iframe-wrapper').innerHTML = '';
  document.getElementById('canvas-wrapper').style.display = 'flex';

  // Load and start game.js if not already loaded
  if (!window.resurrectionLoaded) {
    const s = document.createElement('script');
    s.src = 'game.js';
    s.onload = () => {
      window.resurrectionLoaded = true;
      if (window.audio) window.audio.init();
      if (window.gameState) window.gameState.init();
    };
    document.body.appendChild(s);
  } else {
    if (window.audio) window.audio.init();
    if (window.gameState) window.gameState.init();
  }
}

function closeGame() {
  // Stop audio if in resurrection mode
  if (window.audio && window.audio.stopBGM) {
    window.audio.stopBGM();
  }

  // Clear iframe
  document.getElementById('iframe-wrapper').innerHTML = '';

  document.getElementById('player-screen').style.display = 'none';
  document.getElementById('hub-screen').style.display = 'flex';
  currentMode = null;
}

function reloadCurrentGame() {
  if (currentMode === 'embed' && currentProjectId) {
    launchGame(currentProjectId, document.getElementById('current-game-title').innerText);
  } else if (currentMode === 'resurrection') {
    launchResurrection();
  }
}
