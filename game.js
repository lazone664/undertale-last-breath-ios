// Undertale Last Breath: Resurrection - Web Canvas Engine
// Optimized for Mobile Safari (iPhone X) & Desktop

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Virtual Resolution (Undertale 4:3 native)
const VW = 640;
const VH = 480;

// Audio System
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.sounds = {};
    this.bgm = null;
    this.unlocked = false;
  }

  init() {
    if (this.unlocked) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.unlocked = true;
      this.loadSounds();
    } catch (e) {
      console.warn("AudioContext init failed:", e);
    }
  }

  loadSounds() {
    const sfxList = [
      'snd_sans', 'snd_ding', 'snd_blasted', 'snd_damage',
      'snd_bonewall', 'snd_slash', 'snd_throw', 'snd_heal',
      'snd_menu', 'snd_confirm', 'snd_cancel', 'snd_sike',
      'snd_eyeflash', 'snd_warning', 'snd_hurt', 'snd_broken0', 'snd_broken1'
    ];

    sfxList.forEach(name => {
      const a = new Audio(`audio/${name}.mp3`);
      a.preload = 'auto';
      this.sounds[name] = a;
    });

    // BGM: Phase 1 "Not a slacker anymore"
    this.bgm = new Audio('audio/bgm_lbp1.mp3');
    this.bgm.loop = true;
    this.bgm.volume = 0.85;
  }

  playSFX(name) {
    if (!this.unlocked || !this.sounds[name]) return;
    try {
      const clone = this.sounds[name].cloneNode();
      clone.volume = 0.8;
      clone.play().catch(() => {});
    } catch (e) {}
  }

  playBGM() {
    if (this.bgm) {
      this.bgm.play().catch(() => {});
    }
  }

  stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }
}

const audio = new SoundManager();

// Input Manager (Keyboard + iPhone Touch)
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyZ: false,
  KeyX: false
};

// Listeners
window.addEventListener('keydown', e => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = true;
    e.preventDefault();
  }
});

window.addEventListener('keyup', e => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = false;
    e.preventDefault();
  }
});

// Mobile Touch Binding
function bindTouchButton(id, keyCode) {
  const el = document.getElementById(id);
  if (!el) return;

  const press = (e) => {
    e.preventDefault();
    keys[keyCode] = true;
    el.classList.add('active');
  };

  const release = (e) => {
    e.preventDefault();
    keys[keyCode] = false;
    el.classList.remove('active');
  };

  el.addEventListener('touchstart', press, { passive: false });
  el.addEventListener('touchend', release, { passive: false });
  el.addEventListener('touchcancel', release, { passive: false });
  el.addEventListener('mousedown', press);
  el.addEventListener('mouseup', release);
  el.addEventListener('mouseleave', release);
}

bindTouchButton('btn-up', 'ArrowUp');
bindTouchButton('btn-down', 'ArrowDown');
bindTouchButton('btn-left', 'ArrowLeft');
bindTouchButton('btn-right', 'ArrowRight');
bindTouchButton('btn-z', 'KeyZ');
bindTouchButton('btn-x', 'KeyX');

// Start Button Handler
document.getElementById('btn-start').addEventListener('click', () => {
  audio.init();
  document.getElementById('start-overlay').style.display = 'none';
  gameState.init();
});

// Battle Box
const box = {
  x: 140,
  y: 250,
  w: 360,
  h: 140,
  targetX: 140,
  targetY: 250,
  targetW: 360,
  targetH: 140,
  update() {
    this.x += (this.targetX - this.x) * 0.15;
    this.y += (this.targetY - this.y) * 0.15;
    this.w += (this.targetW - this.w) * 0.15;
    this.h += (this.targetH - this.h) * 0.15;
  },
  draw(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
};

// Player Soul
const soul = {
  x: 320,
  y: 320,
  vx: 0,
  vy: 0,
  size: 16,
  mode: 'red', // 'red' or 'blue'
  onGround: false,
  invulnTimer: 0,
  hp: 92,
  maxHp: 92,
  kr: 0,
  krTimer: 0,
  entangled: false,
  entangledTimer: 0,

  update() {
    // Invulnerability tick
    if (this.invulnTimer > 0) this.invulnTimer--;

    // KR tick damage
    if (this.kr > 0) {
      this.krTimer++;
      if (this.krTimer >= 20) {
        this.krTimer = 0;
        this.kr--;
        this.hp = Math.max(1, this.hp - 1);
      }
    }

    const speed = this.entangled ? 2.0 : 3.5;

    if (this.mode === 'red') {
      if (keys.ArrowLeft) this.x -= speed;
      if (keys.ArrowRight) this.x += speed;
      if (keys.ArrowUp) this.y -= speed;
      if (keys.ArrowDown) this.y += speed;
    } else if (this.mode === 'blue') {
      // Blue Soul Gravity
      if (keys.ArrowLeft) this.x -= speed;
      if (keys.ArrowRight) this.x += speed;

      // Gravity acceleration
      this.vy += 0.38;
      this.y += this.vy;

      // Jump
      if (keys.ArrowUp || keys.KeyZ) {
        if (this.onGround) {
          this.vy = -6.8;
          this.onGround = false;
        }
      }

      // Variable jump height when releasing key
      if (!keys.ArrowUp && !keys.KeyZ && this.vy < -2.5) {
        this.vy = -2.5;
      }
    }

    // Box Constraints
    const half = this.size / 2;
    const minX = box.x + half + 4;
    const maxX = box.x + box.w - half - 4;
    const minY = box.y + half + 4;
    const maxY = box.y + box.h - half - 4;

    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
    if (this.y < minY) this.y = minY;
    if (this.y >= maxY) {
      this.y = maxY;
      this.vy = 0;
      this.onGround = true;
    } else {
      if (this.mode === 'blue') this.onGround = false;
    }
  },

  draw(ctx) {
    if (this.invulnTimer > 0 && Math.floor(this.invulnTimer / 4) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Heart shape
    ctx.fillStyle = (this.mode === 'blue') ? '#003cff' : '#ff0000';
    if (this.entangled) ctx.fillStyle = '#8a00c2'; // Purple when entangled

    ctx.beginPath();
    const s = this.size / 2;
    ctx.moveTo(0, s * 0.8);
    ctx.bezierCurveTo(-s * 1.2, -s * 0.2, -s * 0.9, -s, 0, -s * 0.3);
    ctx.bezierCurveTo(s * 0.9, -s, s * 1.2, -s * 0.2, 0, s * 0.8);
    ctx.fill();

    // Entangled thread glow
    if (this.entangled) {
      ctx.strokeStyle = '#c200fb';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  },

  takeDamage(amount, type = 'normal') {
    if (this.invulnTimer > 0) return;

    audio.playSFX('snd_damage');
    this.invulnTimer = 30;
    this.hp = Math.max(0, this.hp - amount);
    this.kr = Math.min(40, this.kr + Math.floor(amount * 1.5));

    if (type === 'entangle') {
      this.entangled = true;
      this.entangledTimer = 180;
      audio.playSFX('snd_debuff');
    }

    if (this.hp <= 0) {
      gameState.state = 'GAMEOVER';
      audio.stopBGM();
      audio.playSFX('snd_broken0');
      setTimeout(() => audio.playSFX('snd_broken1'), 500);
    }
  }
};

// Sans Boss Controller
const sans = {
  x: 320,
  y: 145,
  targetX: 320,
  dodging: false,
  sweat: 0,
  eyeFlashing: false,
  eyeTimer: 0,
  dialogueText: "",
  dialogueIndex: 0,
  typeTimer: 0,
  talking: false,
  speechX: 400,
  speechY: 90,

  say(text, callback) {
    this.dialogueText = text;
    this.dialogueIndex = 0;
    this.talking = true;
    this.typeTimer = 0;
    this.onDialogueEnd = callback;
  },

  update() {
    this.x += (this.targetX - this.x) * 0.12;

    if (this.eyeFlashing) {
      this.eyeTimer++;
    }

    // Typewriter effect
    if (this.talking) {
      this.typeTimer++;
      if (this.typeTimer >= 3) {
        this.typeTimer = 0;
        if (this.dialogueIndex < this.dialogueText.length) {
          this.dialogueIndex++;
          audio.playSFX('snd_sans');
        } else {
          this.talking = false;
          if (this.onDialogueEnd) {
            setTimeout(this.onDialogueEnd, 800);
            this.onDialogueEnd = null;
          }
        }
      }
    }
  },

  draw(ctx) {
    const time = Date.now() * 0.003;
    const floatY = Math.sin(time) * 3;

    ctx.save();
    ctx.translate(this.x, this.y + floatY);

    // Legs / Slippers
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-22, 54, 18, 12);
    ctx.fillRect(4, 54, 18, 12);

    // Shorts
    ctx.fillStyle = '#000000';
    ctx.fillRect(-20, 32, 40, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-18, 34, 3, 20);
    ctx.fillRect(15, 34, 3, 20);

    // Jacket (Blue)
    ctx.fillStyle = '#1a5fb4';
    ctx.beginPath();
    ctx.roundRect(-30, 0, 60, 34, 8);
    ctx.fill();

    // White Shirt / Zipper
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, 2, 16, 30);

    // Sans Head (Skull)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -18, 22, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.fillStyle = '#000000';
    ctx.fillRect(-12, -10, 24, 4);
    for (let i = -10; i <= 10; i += 4) {
      ctx.fillRect(i, -12, 1.5, 8);
    }

    // Eyes
    if (this.eyeFlashing && Math.floor(this.eyeTimer / 6) % 2 === 0) {
      // Left socket: glowing cyan/yellow flame
      ctx.fillStyle = (Math.floor(this.eyeTimer / 12) % 2 === 0) ? '#00e5ff' : '#ffea00';
      ctx.beginPath();
      ctx.arc(-8, -20, 6, 0, Math.PI * 2);
      ctx.fill();
      // Right eye normal
      ctx.fillStyle = '#000000';
      ctx.fillRect(4, -23, 6, 6);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(-10, -23, 6, 6);
      ctx.fillRect(4, -23, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-8, -21, 2, 2);
      ctx.fillRect(6, -21, 2, 2);
    }

    ctx.restore();

    // Speech Bubble
    if (this.dialogueIndex > 0) {
      ctx.save();
      const currentText = this.dialogueText.substring(0, this.dialogueIndex);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(this.speechX, this.speechY, 180, 55, 6);
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(this.speechX, this.speechY + 20);
      ctx.lineTo(this.speechX - 12, this.speechY + 25);
      ctx.lineTo(this.speechX, this.speechY + 30);
      ctx.fill();

      // Text inside
      ctx.fillStyle = '#000000';
      ctx.font = '13px "Courier New", monospace';
      ctx.fillText(currentText, this.speechX + 12, this.speechY + 30);
      ctx.restore();
    }
  }
};

// Attack Objects
const attacks = {
  projectiles: [],
  timer: 0,
  wave: 1,

  startWave(num) {
    this.projectiles = [];
    this.timer = 0;
    this.wave = num;

    if (num === 1) {
      // Wave 1: Blue Soul slam + bone hurdles
      sans.say("voyons voir si tu sais encore sauter.", () => {
        audio.playSFX('snd_throw');
        soul.mode = 'blue';
        soul.vy = 8;
      });
    } else if (num === 2) {
      // Wave 2: Gaster Blasters
      soul.mode = 'red';
      sans.say("attention aux yeux.", null);
    } else if (num === 3) {
      // Wave 3: Entanglement
      soul.mode = 'red';
      sans.say("tu te sens... coincé ?", null);
    }
  },

  update() {
    this.timer++;

    if (this.wave === 1) {
      // Spawns bones gliding from right to left
      if (this.timer > 60 && this.timer % 65 === 0 && this.timer < 360) {
        audio.playSFX('snd_bonewall');
        this.projectiles.push({
          type: 'bone',
          x: box.x + box.w + 10,
          y: box.y + box.h - 35,
          w: 12,
          h: 35,
          vx: -3.8,
          color: '#ffffff'
        });
      }
    } else if (this.wave === 2) {
      // Gaster Blaster horizontal lasers
      if (this.timer === 40 || this.timer === 140) {
        audio.playSFX('snd_warning');
        const laserY = box.y + 40 + Math.random() * (box.h - 80);
        this.projectiles.push({
          type: 'blaster_warning',
          y: laserY,
          timer: 35
        });
      }
    } else if (this.wave === 3) {
      // Entanglement floating glitch orbs
      if (this.timer % 30 === 0 && this.timer < 300) {
        this.projectiles.push({
          type: 'orb',
          x: box.x + Math.random() * box.w,
          y: box.y - 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2.2,
          size: 14
        });
      }
    }

    // Update projectiles & collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (p.type === 'bone') {
        p.x += p.vx;
        // Collision with soul
        if (checkCollisionBox(soul.x - soul.size/2, soul.y - soul.size/2, soul.size, soul.size, p.x, p.y, p.w, p.h)) {
          soul.takeDamage(6);
        }
        if (p.x < box.x - 30) this.projectiles.splice(i, 1);
      } else if (p.type === 'blaster_warning') {
        p.timer--;
        if (p.timer <= 0) {
          // Fire beam!
          audio.playSFX('snd_blasted');
          this.projectiles.push({
            type: 'laser',
            y: p.y - 18,
            h: 36,
            duration: 25
          });
          this.projectiles.splice(i, 1);
        }
      } else if (p.type === 'laser') {
        p.duration--;
        if (soul.y >= p.y && soul.y <= p.y + p.h) {
          soul.takeDamage(8);
        }
        if (p.duration <= 0) this.projectiles.splice(i, 1);
      } else if (p.type === 'orb') {
        p.x += p.vx;
        p.y += p.vy;
        const dist = Math.hypot(soul.x - p.x, soul.y - p.y);
        if (dist < (soul.size/2 + p.size/2)) {
          soul.takeDamage(4, 'entangle');
          this.projectiles.splice(i, 1);
        } else if (p.y > box.y + box.h + 20) {
          this.projectiles.splice(i, 1);
        }
      }
    }

    // End of wave after 400 frames
    if (this.timer >= 420) {
      gameState.state = 'MENU';
      gameState.menuState = 'MAIN';
      soul.x = 80;
      soul.y = 445;
      soul.mode = 'red';
      box.targetW = 560;
      box.targetH = 140;
      box.targetX = 40;
      box.targetY = 250;
    }
  },

  draw(ctx) {
    this.projectiles.forEach(p => {
      if (p.type === 'bone') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 4);
        ctx.fill();
      } else if (p.type === 'blaster_warning') {
        ctx.strokeStyle = 'rgba(255, 0, 50, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(box.x, p.y);
        ctx.lineTo(box.x + box.w, p.y);
        ctx.stroke();
      } else if (p.type === 'laser') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(box.x, p.y, box.w, p.h);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.fillRect(box.x, p.y - 4, box.w, p.h + 8);
      } else if (p.type === 'orb') {
        ctx.fillStyle = '#a800f0';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }
};

function checkCollisionBox(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// Game State Machine
const gameState = {
  state: 'INTRO', // INTRO, MENU, ATTACKING, ATTACK_TURN, GAMEOVER
  menuState: 'MAIN', // MAIN, FIGHT, ACT, ITEM, MERCY
  selectedBtn: 0, // 0: Fight, 1: Act, 2: Item, 3: Mercy
  introStep: 0,
  introTimer: 0,
  slashBar: 0,
  slashMoving: false,

  init() {
    this.state = 'INTRO';
    this.introStep = 0;
    this.introTimer = 0;
    audio.playBGM();
  },

  update() {
    box.update();
    sans.update();

    if (this.state === 'INTRO') {
      this.introTimer++;
      if (this.introTimer === 40) {
        sans.eyeFlashing = true;
        audio.playSFX('snd_eyeflash');
        sans.say("on days like these... kids like you...", () => {
          setTimeout(() => {
            sans.say("should be burning in hell.", () => {
              audio.playSFX('snd_ding');
              gameState.state = 'ATTACK_TURN';
              attacks.startWave(1);
            });
          }, 600);
        });
      }
    } else if (this.state === 'MENU') {
      // Menu Navigation
      if (keys.ArrowRight) {
        audio.playSFX('snd_menu');
        this.selectedBtn = (this.selectedBtn + 1) % 4;
        keys.ArrowRight = false;
      }
      if (keys.ArrowLeft) {
        audio.playSFX('snd_menu');
        this.selectedBtn = (this.selectedBtn + 3) % 4;
        keys.ArrowLeft = false;
      }

      if (keys.KeyZ) {
        audio.playSFX('snd_confirm');
        keys.KeyZ = false;
        if (this.selectedBtn === 0) {
          // Fight
          this.state = 'FIGHT_BAR';
          this.slashBar = 40;
          this.slashMoving = true;
        } else if (this.selectedBtn === 2) {
          // Heal
          audio.playSFX('snd_heal');
          soul.hp = Math.min(soul.maxHp, soul.hp + 50);
          soul.kr = 0;
          sans.say("prends ton temps, ça ne te sauvera pas.", () => {
            gameState.state = 'ATTACK_TURN';
            attacks.startWave(2);
          });
          this.state = 'ATTACK_WAIT';
        } else {
          // Act / Mercy
          sans.say("tu perds ton temps.", () => {
            gameState.state = 'ATTACK_TURN';
            attacks.startWave(3);
          });
          this.state = 'ATTACK_WAIT';
        }
      }
    } else if (this.state === 'FIGHT_BAR') {
      if (this.slashMoving) {
        this.slashBar += 7.5;
        if (keys.KeyZ || this.slashBar > 580) {
          this.slashMoving = false;
          keys.KeyZ = false;
          audio.playSFX('snd_slash');

          // Sans dodges!
          setTimeout(() => {
            audio.playSFX('snd_sike');
            sans.targetX = 420; // slide right
            sans.say("tu croyais vraiment me toucher ?", () => {
              sans.targetX = 320;
              gameState.state = 'ATTACK_TURN';
              attacks.startWave(attacks.wave === 1 ? 2 : 3);
            });
          }, 350);
        }
      }
    } else if (this.state === 'ATTACK_TURN') {
      soul.update();
      attacks.update();
    }
  },

  draw() {
    ctx.clearRect(0, 0, VW, VH);

    // Dark corridor backdrop
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, VW, VH);

    // Subtle pillar light beams
    ctx.fillStyle = 'rgba(255, 170, 0, 0.04)';
    ctx.fillRect(60, 0, 100, VH);
    ctx.fillRect(480, 0, 100, VH);

    // Draw Sans
    sans.draw(ctx);

    // Draw Battle Box
    box.draw(ctx);

    // Draw Battle Contents
    if (this.state === 'ATTACK_TURN') {
      attacks.draw(ctx);
      soul.draw(ctx);
    } else if (this.state === 'FIGHT_BAR') {
      // Draw target bar
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x + 20, box.y + 20, box.w - 40, box.h - 40);

      // Moving strike line
      ctx.fillStyle = '#ff2b56';
      ctx.fillRect(this.slashBar, box.y + 20, 8, box.h - 40);
    }

    // Draw HUD (HP & LV)
    this.drawHUD(ctx);

    // Draw Menu Buttons
    this.drawButtons(ctx);

    // Game Over Overlay
    if (this.state === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, VW, VH);

      ctx.fillStyle = '#ff2b56';
      ctx.font = '28px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText("GAME OVER", VW / 2, VH / 2 - 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText("Reste déterminé...", VW / 2, VH / 2 + 20);
      ctx.fillText("[ TOUCHE L'ÉCRAN POUR RÉESSAYER ]", VW / 2, VH / 2 + 60);

      if (keys.KeyZ) {
        location.reload();
      }
    }
  },

  drawHUD(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText("CHARA   LV 19", 60, 410);

    ctx.fillText("HP", 240, 410);

    // HP Bar
    const hpBarX = 270;
    const hpBarY = 398;
    const hpMaxW = 140;
    const hpCurrentW = Math.max(0, (soul.hp / soul.maxHp) * hpMaxW);
    const krCurrentW = Math.min(hpMaxW - hpCurrentW, (soul.kr / soul.maxHp) * hpMaxW);

    ctx.fillStyle = '#c41414';
    ctx.fillRect(hpBarX, hpBarY, hpMaxW, 14);

    // Yellow HP
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(hpBarX, hpBarY, hpCurrentW, 14);

    // Purple KR
    if (soul.kr > 0) {
      ctx.fillStyle = '#bb00ff';
      ctx.fillRect(hpBarX + hpCurrentW, hpBarY, krCurrentW, 14);
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${soul.hp} / ${soul.maxHp}`, 425, 410);

    if (soul.kr > 0) {
      ctx.fillStyle = '#bb00ff';
      ctx.fillText("KR", 520, 410);
    }
  },

  drawButtons(ctx) {
    const btnNames = ["FIGHT", "ACT", "ITEM", "MERCY"];
    const btnX = [50, 195, 340, 485];
    const btnY = 432;
    const btnW = 105;
    const btnH = 38;

    for (let i = 0; i < 4; i++) {
      const selected = (this.state === 'MENU' && this.selectedBtn === i);

      ctx.lineWidth = 2;
      ctx.strokeStyle = selected ? '#ffea00' : '#e06000';
      ctx.strokeRect(btnX[i], btnY, btnW, btnH);

      ctx.fillStyle = selected ? '#ffea00' : '#e06000';
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(btnNames[i], btnX[i] + btnW / 2, btnY + 25);

      // Red Soul on selected button
      if (selected) {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        const sx = btnX[i] + 16;
        const sy = btnY + btnH / 2;
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
};

// Main Game Loop (60 FPS locked)
function loop() {
  gameState.update();
  gameState.draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
