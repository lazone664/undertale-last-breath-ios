/**
 * UNDERTALE: LAST BREATH – MAIN GAME ENGINE
 * Complete battle system with cinematic title, Undertale-accurate HUD, full phase transitions
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx    = this.canvas.getContext('2d');

    // Sub-systems
    this.player  = new Player();
    this.sans    = new SansBoss();
    this.attacks = new AttackManager();

    // Input
    this.keys     = {};
    this.prevKeys = {};

    // ─── State machine ───────────────────────────────────────────
    // States: TITLE | BATTLE_MENU | SUB_MENU | FIGHT_TARGET | SANS_SPEECH | ATTACK | TRANSITION | GAME_OVER
    this.state = 'TITLE';

    // ─── Battle Box ─────────────────────────────────────────────
    this.box = { x: 320, y: 305, w: 536, h: 130, targetW: 536, targetH: 130,
                 angle: 0, targetAngle: 0, offsetX: 0, offsetY: 0, targetOffsetX: 0, targetOffsetY: 0 };

    // ─── UI & Buttons ────────────────────────────────────────────
    this.buttons      = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];
    this.selectedBtn  = 0;
    this.mercyBroken  = false;
    this.buttonOffsets = [{x:0,y:0,rot:0},{x:0,y:0,rot:0},{x:0,y:0,rot:0},{x:0,y:0,rot:0}];

    // Menu attack bones
    this.menuBones   = [];
    this.menuSoulY   = 0;
    this.menuSoulVy  = 0;

    // Sub-menu
    this.inSubMenu       = false;
    this.subMenuType     = '';
    this.selectedSubItem = 0;

    this.actOptions  = ['* Check', '* Taunt', '* Plead', '* Gaster'];
    this.items       = [
      { name: '* Butterscotch Pie', heal: 92 },
      { name: '* Face Steak',       heal: 60 },
      { name: '* Snowman Piece',    heal: 45 },
      { name: '* Legendary Hero',   heal: 40 }
    ];
    this.mercyOptions = ['* Spare', '* Flee'];

    // ─── Fight timing bar ───────────────────────────────────────
    this.fightBar = { x: 0, speed: 8.8, active: false, hit: false };

    // Slash animation on Sans
    this.slashFrame = 0;
    this.slashTimer = 0;
    this.slashActive = false;

    // ─── Progression ────────────────────────────────────────────
    this.turnCount     = 0;
    this.currentPhase  = 1;
    this.isSurvivalMode = false;
    this.survivalScore  = 0;

    // ─── Flavor text ─────────────────────────────────────────────
    this.flavorText = '* The wind is howling... Sans stands before you.';

    // ─── FX ─────────────────────────────────────────────────────
    this.screenShake    = 0;
    this.showHitboxes   = false;
    this.transitionAlpha = 0; // 0..1 black fade
    this.flashAlpha     = 0;  // white flash
    this.flashColor     = '#ffffff';

    // ─── Title background stars ───────────────────────────────
    this.stars = Array.from({length: 180}, () => ({
      x: Math.random() * 640,
      y: Math.random() * 480,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.18 + 0.04,
      alpha: Math.random() * 0.7 + 0.3
    }));

    // ─── Damage numbers ─────────────────────────────────────────
    this.damageNumbers = [];

    // ─── Phase 2 button crack offsets ────────────────────────────
    this.mercyPieces = [
      {x: 42, y: -14, rot: 0.25, scale: 0.9},
      {x: -44, y: 12, rot: -0.35, scale: 0.75},
      {x: 10, y: -28, rot: 0.6, scale: 0.65}
    ];

    this.initInputs();
    this.initModals();
  }

  // ═══════════════════════════════════════════════════════════════
  //  INPUT
  // ═══════════════════════════════════════════════════════════════
  initInputs() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (window.audio) window.audio.unlock();
      if (e.code === 'Digit1') this.startPhase(1);
      if (e.code === 'Digit2') this.startPhase(2);
      if (e.code === 'Digit3') this.startPhase(3);
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    // Multi-touch tracking for Virtual Controls
    const dpad = document.querySelector('.dpad');
    const dpadButtons = document.querySelectorAll('.dpad .vbtn');
    const actionButtons = document.querySelectorAll('.action-buttons .vbtn');

    const updateDpadTouch = (touch) => {
      const rect = dpad.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = touch.clientX - cx;
      const dy = touch.clientY - cy;
      const deadzone = 12;

      const left = dx < -deadzone;
      const right = dx > deadzone;
      const up = dy < -deadzone;
      const down = dy > deadzone;

      this.keys['ArrowLeft'] = left;
      this.keys['ArrowRight'] = right;
      this.keys['ArrowUp'] = up;
      this.keys['ArrowDown'] = down;

      document.getElementById('vbtnLeft')?.classList.toggle('pressed', left);
      document.getElementById('vbtnRight')?.classList.toggle('pressed', right);
      document.getElementById('vbtnUp')?.classList.toggle('pressed', up);
      document.getElementById('vbtnDown')?.classList.toggle('pressed', down);
    };

    if (dpad) {
      dpad.addEventListener('touchstart', e => {
        e.preventDefault();
        if (window.audio) window.audio.unlock();
        if (e.changedTouches.length > 0) {
          updateDpadTouch(e.changedTouches[0]);
        }
      }, { passive: false });

      dpad.addEventListener('touchmove', e => {
        e.preventDefault();
        if (e.changedTouches.length > 0) {
          updateDpadTouch(e.changedTouches[0]);
        }
      }, { passive: false });

      const clearDpad = e => {
        e.preventDefault();
        dpadButtons.forEach(btn => {
          const kc = btn.getAttribute('data-key');
          this.keys[kc] = false;
          btn.classList.remove('pressed');
        });
      };
      dpad.addEventListener('touchend', clearDpad, { passive: false });
      dpad.addEventListener('touchcancel', clearDpad, { passive: false });
    }

    actionButtons.forEach(btn => {
      const kc = btn.getAttribute('data-key');
      const press = e => {
        e.preventDefault();
        this.keys[kc] = true;
        btn.classList.add('pressed');
        if (window.audio) window.audio.unlock();
        if (navigator.vibrate) navigator.vibrate(12);
      };
      const release = e => {
        e.preventDefault();
        this.keys[kc] = false;
        btn.classList.remove('pressed');
      };
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend',   release, { passive: false });
      btn.addEventListener('touchcancel', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup',   release);
      btn.addEventListener('mouseleave', release);
    });

    // Auto-detect touch device / iOS and show controls by default
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if (isTouch) {
      const vc = document.getElementById('virtualControls');
      if (vc) vc.classList.add('visible');
      const chk = document.getElementById('chkTouch');
      if (chk) chk.checked = true;
    }
  }

  initModals() {
    const $ = id => document.getElementById(id);

    // Phase modal
    $('btnPhaseSelector').onclick = () => $('modalPhases').classList.add('open');
    $('btnClosePhases').onclick   = () => $('modalPhases').classList.remove('open');
    document.querySelectorAll('.phase-play-btn').forEach(b => {
      b.onclick = () => {
        $('modalPhases').classList.remove('open');
        const p = b.getAttribute('data-phase');
        if (p === 'survival') this.startSurvivalMode();
        else this.startPhase(parseInt(p));
      };
    });

    // Settings modal
    $('btnSettings').onclick = () => $('modalSettings').classList.add('open');
    $('btnCloseSettings').onclick = () => $('modalSettings').classList.remove('open');
    $('sliderBgm').oninput = e => window.audio.setBgmVolume(e.target.value / 100);
    $('sliderSfx').oninput = e => window.audio.setSfxVolume(e.target.value / 100);
    $('chkCrt').onchange = e => {
      document.getElementById('crtOverlay').classList.toggle('disabled', !e.target.checked);
    };
    $('chkHitboxes').onchange = e => { this.showHitboxes = e.target.checked; };
    $('chkTouch').onchange = e => {
      document.getElementById('virtualControls').classList.toggle('visible', e.target.checked);
    };

    // Fullscreen toggle
    const btnFs = $('btnFullscreen');
    if (btnFs) {
      btnFs.onclick = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      };
    }

    // Help modal
    $('btnHelp').onclick = () => $('modalHelp').classList.add('open');
    $('btnCloseHelp').onclick = () => $('modalHelp').classList.remove('open');

    // Mute
    $('btnMute').onclick = () => {
      const m = window.audio.toggleMute();
      $('btnMute').textContent = m ? '🔇 MUET' : '🔊 SON';
      $('btnMute').classList.toggle('muted', m);
    };

    window.addEventListener('keydown', e => {
      if (e.code === 'Escape') {
        ['modalPhases','modalSettings','modalHelp'].forEach(id => $( id).classList.remove('open'));
      }
    });
  }

  isJustPressed(code) {
    return this.keys[code] && !this.prevKeys[code];
  }

  // Poll connected gamepads (Xbox, DualSense, MFi)
  pollGamepads() {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;
      if (gp.buttons[12]?.pressed || gp.axes[1] < -0.4) this.keys['ArrowUp'] = true;
      if (gp.buttons[13]?.pressed || gp.axes[1] > 0.4)  this.keys['ArrowDown'] = true;
      if (gp.buttons[14]?.pressed || gp.axes[0] < -0.4) this.keys['ArrowLeft'] = true;
      if (gp.buttons[15]?.pressed || gp.axes[0] > 0.4)  this.keys['ArrowRight'] = true;
      if (gp.buttons[0]?.pressed || gp.buttons[1]?.pressed) this.keys['KeyZ'] = true;
      if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) this.keys['KeyX'] = true;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  BOOT
  // ═══════════════════════════════════════════════════════════════
  start() {
    this.state = 'TITLE';
    window.audio.playBgm('menu');
    this.loop();
  }

  // ═══════════════════════════════════════════════════════════════
  //  PHASE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  startPhase(n) {
    this.currentPhase   = n;
    this.isSurvivalMode = false;
    this.turnCount      = 0;
    this.sans.setPhase(n);
    this.player.reset();

    this.box.w = this.box.targetW = 536;
    this.box.h = this.box.targetH = 130;
    this.box.angle = this.box.targetAngle = 0;
    this.box.offsetX = this.box.offsetY = 0;
    this.menuBones = [];

    const bgm = ['', 'phase1', 'phase2', 'phase3'][n];
    window.audio.playBgm(bgm);

    if (n === 1) {
      this.mercyBroken = false;
      this.flavorText  = '* Sans feels the weight of 30 timelines on his shoulders.';
    } else if (n === 2) {
      this.mercyBroken = true;
      this.flavorText  = '* Sans REFUSED to die ! The MERCY button has been shattered !';
    } else {
      this.mercyBroken = true;
      this.flavorText  = '* An enigmatic darkness gathers. Someone is watching through the void.';
    }

    this.state = 'BATTLE_MENU';
  }

  startSurvivalMode() {
    this.isSurvivalMode = true;
    this.survivalScore  = 0;
    this.startPhase(1);
    this.flavorText = '* BOSS RUSH – Survive as long as you can !';
  }

  // ═══════════════════════════════════════════════════════════════
  //  GAME LOOP
  // ═══════════════════════════════════════════════════════════════
  loop() {
    requestAnimationFrame(() => this.loop());
    this.pollGamepads();
    this.update();
    this.draw();
    this.prevKeys = { ...this.keys };
  }

  // ═══════════════════════════════════════════════════════════════
  //  UPDATE
  // ═══════════════════════════════════════════════════════════════
  update() {
    // Screen shake decay
    if (this.screenShake > 0) { this.screenShake *= 0.85; if (this.screenShake < 0.3) this.screenShake = 0; }
    if (this.flashAlpha  > 0)   this.flashAlpha  -= 0.06;

    // Battle box interpolation
    const lerp = (a, b, t) => a + (b - a) * t;
    this.box.w       = lerp(this.box.w,       this.box.targetW,       0.18);
    this.box.h       = lerp(this.box.h,       this.box.targetH,       0.18);
    this.box.angle   = lerp(this.box.angle,   this.box.targetAngle,   0.14);
    this.box.offsetX = lerp(this.box.offsetX, this.box.targetOffsetX, 0.18);
    this.box.offsetY = lerp(this.box.offsetY, this.box.targetOffsetY, 0.18);

    // Damage number cleanup
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.y   -= 0.7;
      d.life--;
      if (d.life <= 0) this.damageNumbers.splice(i, 1);
    }

    this.sans.update();

    // Phase 2+ menu bones
    if ((this.state === 'BATTLE_MENU' || this.state === 'SUB_MENU') && this.currentPhase >= 2) {
      this._updateMenuBones();
    }

    switch (this.state) {
      case 'TITLE':        this._updateTitle();       break;
      case 'BATTLE_MENU':  this._updateBattleMenu();  break;
      case 'SUB_MENU':     this._updateSubMenu();     break;
      case 'FIGHT_TARGET': this._updateFightTarget(); break;
      case 'SANS_SPEECH':  /* waiting for typewriter */ break;
      case 'ATTACK':       this._updateAttack();      break;
      case 'GAME_OVER':    this._updateGameOver();    break;
    }

    if (this.player.isDead && this.state !== 'GAME_OVER') {
      this.state = 'GAME_OVER';
      this.screenShake = 18;
    }
  }

  _updateMenuBones() {
    if (Math.random() < 0.028) {
      this.menuBones.push({ x: 648, y: 438, w: 8, h: 28, vx: -4.2, type: 'white' });
    }
    // Jump over bones with Up or W
    if ((this.isJustPressed('ArrowUp') || this.isJustPressed('KeyW') || this.isJustPressed('Space')) && this.menuSoulY === 0) {
      this.menuSoulVy = -5.5;
      window.audio.playSfx('menu', 0.45, 1.3);
    }
    if (this.menuSoulY !== 0 || this.menuSoulVy !== 0) {
      this.menuSoulVy += 0.38;
      this.menuSoulY  += this.menuSoulVy;
      if (this.menuSoulY >= 0) { this.menuSoulY = 0; this.menuSoulVy = 0; }
    }

    const startX  = 96;
    const spacing = 138;
    const heartX  = startX + this.selectedBtn * spacing - 40;
    const heartY  = 438 + this.menuSoulY;

    for (let i = this.menuBones.length - 1; i >= 0; i--) {
      const b = this.menuBones[i];
      b.x += b.vx;
      if (Math.abs(b.x - heartX) < 14 && Math.abs(b.y - heartY) < 17) {
        this.player.takeDamage(1, true);
        window.audio.playSfx('damage', 0.7);
        this._spawnDamage(heartX, heartY - 20, 1, '#ff4444');
      }
      if (b.x < -30) this.menuBones.splice(i, 1);
    }
  }

  _updateTitle() {
    if (this.isJustPressed('KeyZ') || this.isJustPressed('Enter') || this.isJustPressed('Space')) {
      window.audio.playSfx('confirm');
      this.startPhase(1);
    }
  }

  _updateBattleMenu() {
    if (this.isJustPressed('ArrowLeft') || this.isJustPressed('KeyA')) {
      this.selectedBtn = (this.selectedBtn + 3) % 4;
      window.audio.playSfx('menu', 0.55);
    }
    if (this.isJustPressed('ArrowRight') || this.isJustPressed('KeyD')) {
      this.selectedBtn = (this.selectedBtn + 1) % 4;
      window.audio.playSfx('menu', 0.55);
    }

    if (this.isJustPressed('KeyZ') || this.isJustPressed('Enter')) {
      window.audio.playSfx('confirm');
      if (this.selectedBtn === 0) {
        this._startFightTarget();
      } else if (this.selectedBtn === 3 && this.mercyBroken) {
        window.audio.playSfx('blocked', 1.0);
        this.screenShake = 14;
        this.flavorText  = '* Il n\'y a plus de pitié. Ce droit s\'est évaporé avec le 29ème génocide.';
        this._triggerSansDialogue('tu as perdu ce privilège il y a bien longtemps.', 2);
      } else {
        this.state           = 'SUB_MENU';
        this.selectedSubItem = 0;
        this.subMenuType     = ['', 'ACT', 'ITEM', 'MERCY'][this.selectedBtn];
      }
    }
  }

  _updateSubMenu() {
    const list = this.subMenuType === 'ACT'  ? this.actOptions
               : this.subMenuType === 'ITEM' ? this.items.map(i => i.name)
               : this.mercyOptions;

    if (this.isJustPressed('ArrowUp')   || this.isJustPressed('KeyW'))
      { this.selectedSubItem = (this.selectedSubItem + list.length - 1) % list.length; window.audio.playSfx('menu', 0.55); }
    if (this.isJustPressed('ArrowDown') || this.isJustPressed('KeyS'))
      { this.selectedSubItem = (this.selectedSubItem + 1) % list.length; window.audio.playSfx('menu', 0.55); }

    if (this.isJustPressed('KeyX') || this.isJustPressed('ShiftLeft') || this.isJustPressed('ShiftRight')) {
      window.audio.playSfx('cancel', 0.55);
      this.state = 'BATTLE_MENU';
      return;
    }
    if (this.isJustPressed('KeyZ') || this.isJustPressed('Enter')) {
      window.audio.playSfx('confirm');
      this._executeAction(this.subMenuType, this.selectedSubItem);
    }
  }

  _executeAction(type, index) {
    if (type === 'ACT') {
      const lines = [
        ['* SANS 1 ATK 1 DEF  — Le Juge du Couloir du Jugement.', 'tu perds ton temps à m\'inspecter, gamin.'],
        ['* Vous rappelez à Sans ses 30 génocides subis.', 'je sais. c\'est pour ça que je ne reculerai plus.', 2],
        ['* Vous demandez sincèrement pardon.', 'si seulement ça changeait quelque chose...', 4],
        ['* Vous murmurez le nom de W.D. Gaster. L\'air se glace.', '...alors tu es au courant pour lui ?', 2]
      ];
      const l = lines[index];
      this.flavorText = l[0];
      this._triggerSansDialogue(l[1], l[2] || 0);
    } else if (type === 'ITEM') {
      const item = this.items[index];
      if (item) {
        this.player.heal(item.heal);
        this.flavorText = `* Vous utilisez ${item.name.replace('* ', '')}. PV restaurés !`;
        this.items.splice(index, 1);
        this._triggerSansDialogue('t\'as encore faim ? j\'ai tout mon temps.', 0);
      }
    } else if (type === 'MERCY') {
      if (index === 0) {
        this.flavorText = '* Vous tentez d\'épargner Sans...';
        this._triggerSansDialogue('tu crois vraiment que je vais retomber dans le piège ?', 1);
      } else {
        this.flavorText = '* Vous tentez de fuir... mais l\'issue est scellée.';
        this._triggerSansDialogue('il n\'y a nulle part où aller, anomalie.', 0);
      }
    }
  }

  // ─── Fight Timing Bar ────────────────────────────────────────
  _startFightTarget() {
    this.state         = 'FIGHT_TARGET';
    this.fightBar.x    = this.box.x - this.box.w / 2 + 10;
    this.fightBar.active = true;
    this.fightBar.hit  = false;
  }

  _updateFightTarget() {
    if (!this.fightBar.hit) {
      this.fightBar.x += this.fightBar.speed;
      const barEnd = this.box.x + this.box.w / 2 - 10;

      if (this.fightBar.x > barEnd) {
        this.fightBar.hit = true;
        this.flavorText = '* Vous avez raté votre attaque !';
        this.sans.playOnce('laugh', 4, 5);
        setTimeout(() => this._triggerSansDialogue('trop lent.', 1), 500);
      } else if (this.isJustPressed('KeyZ') || this.isJustPressed('Enter') || this.isJustPressed('Space')) {
        this.fightBar.hit = true;
        window.audio.playSfx('slash', 0.9);
        // Slash animation
        this.slashActive = true; this.slashFrame = 0; this.slashTimer = 0;
        this.screenShake = 10;

        setTimeout(() => {
          if (this.currentPhase === 1) {
            this.sans.dodge();
            this.flavorText = '* Sans esquive sans effort. \'Vraiment ?\'';
            setTimeout(() => this._triggerSansDialogue('qu\'est-ce que tu croyais ?', 1), 750);
          } else if (this.currentPhase === 2) {
            this.sans.blockAttack();
            this.flashAlpha = 0.5;
            this.screenShake = 16;
            this.flavorText = '* Sans BLOQUE avec son os géant ! Des étincelles jaillissent !';
            setTimeout(() => this._triggerSansDialogue('je t\'ai dit que je ne me laisserais plus faire !', 2), 850);
          } else {
            this.sans.blockAttack();
            this.flashAlpha = 0.7; this.flashColor = '#9d4edd';
            this.screenShake = 20;
            this.flavorText = '* Une barrière de ténèbres dévie votre attaque !';
            setTimeout(() => this._triggerSansDialogue('nous sommes deux à combattre désormais.', 3), 900);
          }
        }, 350);
      }
    }

    // Update slash animation
    if (this.slashActive) {
      this.slashTimer++;
      if (this.slashTimer >= 4) {
        this.slashTimer = 0;
        this.slashFrame++;
        if (this.slashFrame >= 11) this.slashActive = false;
      }
    }
  }

  // ─── Dialogue ────────────────────────────────────────────────
  _triggerSansDialogue(text, face = 0) {
    this.state = 'SANS_SPEECH';
    this.sans.say(text, face, () => this._startEnemyAttack());
  }

  // ─── Attack phase ────────────────────────────────────────────
  _startEnemyAttack() {
    this.state = 'ATTACK';
    this.turnCount++;

    // Shrink box to arena
    this.box.targetW = 210;
    this.box.targetH = 155;

    // Place player in center
    this.player.x  = this.box.x;
    this.player.y  = this.box.y;
    this.player.vx = this.player.vy = 0;

    // Pick pattern
    let pattern = '';
    if (this.currentPhase === 1) {
      const list = [
        'pat_p1_boneshower', 'pat_p1_blasters', 'pat_p1_blue_rain',
        'pat_p1_cross', 'pat_p1_spiral'
      ];
      pattern = list[(this.turnCount - 1) % list.length];
      if (this.turnCount >= 5 && !this.isSurvivalMode) { this._transitionToPhase(2); return; }
    } else if (this.currentPhase === 2) {
      const list = ['pat_p2_giantbone', 'pat_p2_rotating', 'pat_p2_arena'];
      pattern = list[(this.turnCount - 1) % list.length];
      if (this.turnCount >= 4 && !this.isSurvivalMode) { this._transitionToPhase(3); return; }
    } else {
      const list = ['pat_p3_gaster', 'pat_p3_finale'];
      pattern = list[(this.turnCount - 1) % list.length];
    }

    this.sans.eyeActive = true;
    window.audio.playSfx('eyeflash', 0.8);

    this.attacks.startPattern(pattern, this.player, this.sans, this.box, () => {
      this.box.targetW = 536;
      this.box.targetH = 130;
      this.player.mode = 'red';
      this.sans.eyeActive = false;
      this.state = 'BATTLE_MENU';
      this.flavorText = '* Sans essuie la sueur de son front mais tient bon.';
    });
  }

  _updateAttack() {
    if (this.isJustPressed('KeyZ') || this.isJustPressed('Space')) {
      this.player.triggerParry();
    }
    this.player.update(this.keys, this.box);
    this.attacks.update(this.player, this.sans, this.box);
    if (this.isSurvivalMode) this.survivalScore++;
  }

  _updateGameOver() {
    this.player.update(this.keys, this.box);
    if (this.isJustPressed('KeyZ') || this.isJustPressed('Enter') || this.isJustPressed('Space')) {
      this.startPhase(this.currentPhase);
    }
  }

  _transitionToPhase(n) {
    this.currentPhase = n;
    this.turnCount    = 0;
    this.sans.setPhase(n);
    this.flashAlpha   = 1.0;

    if (n === 2) {
      window.audio.playBgm('phase2');
      this.screenShake = 22;
      this.flavorText  = '* Sans refuse de mourir ! LE CARNAGE CONTINUE !';
      this._triggerSansDialogue('tu croyais vraiment que c\'était terminé ?... mon dernier souffle m\'appartient !', 2);
    } else {
      window.audio.playBgm('phase3');
      this.screenShake = 30;
      this.flashColor  = '#9d4edd';
      this.flavorText  = '* W.D. Gaster transcende le voile ! La réalité se fracture !';
      this._triggerSansDialogue('tu es arrivé au bout de ta route, humain. Personne ne peut t\'aider ici.', 3);
    }
  }

  _spawnDamage(x, y, val, color = '#ff4444') {
    this.damageNumbers.push({ x, y, val, color, life: 55 });
  }

  // ═══════════════════════════════════════════════════════════════
  //  DRAW
  // ═══════════════════════════════════════════════════════════════
  draw() {
    const ctx = this.ctx;
    ctx.save();

    // Screen shake
    if (this.screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
    }

    ctx.clearRect(0, 0, 640, 480);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 640, 480);

    if (this.state === 'TITLE') {
      this._drawTitle(ctx);
    } else {
      this._drawBattle(ctx);
    }

    // White / color flash overlay
    if (this.flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.flashAlpha);
      ctx.fillStyle   = this.flashColor || '#ffffff';
      ctx.fillRect(0, 0, 640, 480);
      ctx.restore();
      this.flashAlpha -= 0.07;
      if (this.flashAlpha < 0) { this.flashAlpha = 0; this.flashColor = '#ffffff'; }
    }

    ctx.restore();
  }

  // ─── TITLE SCREEN ────────────────────────────────────────────
  _drawTitle(ctx) {
    // Scroll stars
    for (const s of this.stars) {
      s.y += s.speed;
      if (s.y > 480) { s.y = -2; s.x = Math.random() * 640; }
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Background glow behind Sans area
    const t = Date.now() / 1000;
    const grd = ctx.createRadialGradient(320, 160, 10, 320, 160, 180);
    grd.addColorStop(0, `rgba(0, 80, 160, ${0.18 + Math.sin(t) * 0.06})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 640, 480);

    // Draw Sans on title
    this.sans.draw(ctx);

    // Bottom text area gradient
    const bgrd = ctx.createLinearGradient(0, 330, 0, 480);
    bgrd.addColorStop(0, 'rgba(0,0,0,0)');
    bgrd.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = bgrd;
    ctx.fillRect(0, 330, 640, 150);

    ctx.textAlign = 'center';

    // Main title
    ctx.font      = '26px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 18;
    ctx.fillText('UNDERTALE', 320, 380);

    ctx.font      = '22px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff9100';
    ctx.shadowColor = '#ff9100'; ctx.shadowBlur = 22;
    ctx.fillText('LAST BREATH', 320, 412);
    ctx.shadowBlur = 0;

    ctx.font = '12px "VT323", monospace';
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('THE FINAL STRIKE  ·  FANGAME BATTLE', 320, 436);

    // Blink prompt
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('[ APPUYEZ SUR Z POUR COMMENCER ]', 320, 462);
    }

    // Phase shortcuts hint
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#555577';
    ctx.fillText('Touches 1 · 2 · 3 pour choisir une phase', 320, 476);
  }

  // ─── BATTLE SCREEN ───────────────────────────────────────────
  _drawBattle(ctx) {
    // 1. Background
    this._drawBattleBackground(ctx);

    // 2. Sans
    this.sans.draw(ctx);

    // 3. Slash animation
    if (this.slashActive) {
      const sk = `slash_${this.slashFrame}`;
      window.sprites.draw(ctx, sk, this.sans.x + 5, this.sans.y + 5, { scale: 1.3 });
    }

    // 4. Battle box
    this._drawBattleBox(ctx);

    // 5. Attacks / bullets
    this.attacks.draw(ctx);

    // 6. Player soul
    if (this.state === 'ATTACK' || this.state === 'GAME_OVER') {
      this.player.draw(ctx);
    }

    // 7. Dialogue box (Undertale-accurate)
    this._drawDialogueBox(ctx);

    // 8. HUD
    this._drawHUD(ctx);

    // 9. Action buttons
    this._drawButtons(ctx);

    // 10. Menu content / sub-menus inside dialogue box
    if (this.state === 'BATTLE_MENU' || this.state === 'SANS_SPEECH') {
      this._drawFlavorText(ctx);
    } else if (this.state === 'SUB_MENU') {
      this._drawSubMenu(ctx);
    } else if (this.state === 'FIGHT_TARGET') {
      this._drawFightTarget(ctx);
    } else if (this.state === 'GAME_OVER') {
      this._drawGameOver(ctx);
    }

    // 11. Damage numbers
    for (const d of this.damageNumbers) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, d.life / 20);
      ctx.font        = '12px "Press Start 2P", monospace';
      ctx.fillStyle   = d.color;
      ctx.textAlign   = 'center';
      ctx.shadowColor = d.color; ctx.shadowBlur = 6;
      ctx.fillText(`-${d.val}`, d.x, d.y);
      ctx.restore();
    }

    // 12. Hitbox debug
    if (this.showHitboxes && this.state === 'ATTACK') {
      ctx.strokeStyle = '#00ff00'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, this.player.hitboxRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 13. Survival score
    if (this.isSurvivalMode && this.state === 'ATTACK') {
      ctx.save();
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffcc00'; ctx.textAlign = 'right';
      ctx.fillText(`SCORE: ${this.survivalScore}`, 632, 20);
      ctx.restore();
    }
  }

  _drawBattleBackground(ctx) {
    // Undertale Last Breath background image
    const bgKey = this.currentPhase === 3 ? 'bg_sans' : this.currentPhase === 2 ? 'bg_lb' : 'bg_classic';
    const bg = window.sprites.get(bgKey);
    if (bg) {
      ctx.save();
      ctx.globalAlpha = this.currentPhase === 3 ? 0.65 : 0.5;
      // Stretch to full canvas
      ctx.drawImage(bg, 0, 0, 640, 265);
      ctx.restore();
    } else {
      // Fallback gradient
      const gr = ctx.createLinearGradient(0, 0, 0, 260);
      gr.addColorStop(0, this.currentPhase === 3 ? '#120020' : this.currentPhase === 2 ? '#000820' : '#050510');
      gr.addColorStop(1, '#000000');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, 640, 260);
    }

    // Phase 3: extra dark vignette
    if (this.currentPhase === 3) {
      const t = Date.now() / 1000;
      const vgrd = ctx.createRadialGradient(320, 130, 30, 320, 130, 300);
      vgrd.addColorStop(0, 'rgba(0,0,0,0)');
      vgrd.addColorStop(1, `rgba(60,0,90,${0.35 + Math.sin(t) * 0.07})`);
      ctx.fillStyle = vgrd;
      ctx.fillRect(0, 0, 640, 260);
    }
  }

  _drawBattleBox(ctx) {
    const b = this.box;
    ctx.save();
    ctx.translate(b.x + b.offsetX, b.y + b.offsetY);
    if (b.angle) ctx.rotate(b.angle);

    // Box fill
    ctx.fillStyle = '#000000';
    ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);

    // Border (Undertale-style white with slight glow)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 4;
    if (this.currentPhase === 3) {
      ctx.shadowColor = '#9d4edd';
      ctx.shadowBlur  = 10;
    }
    ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
    ctx.shadowBlur = 0;

    // Phase 2+ cracks
    if (this.currentPhase >= 2) {
      ctx.strokeStyle = '#7777aa';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(-b.w/2,    -b.h/2);
      ctx.lineTo(-b.w/2+20, -b.h/2+15);
      ctx.moveTo(b.w/2,     b.h/2);
      ctx.lineTo(b.w/2-18,  b.h/2-15);
      ctx.moveTo(b.w/2,     -b.h/2 + 8);
      ctx.lineTo(b.w/2-10,  -b.h/2 + 28);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ─── Undertale-accurate dialogue box ─────────────────────────
  _drawDialogueBox(ctx) {
    // Bottom panel: Undertale has a dark semi-transparent panel below battle box
    const panelY = this.box.y + this.box.h / 2 + 8;
    const panelH = 85;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(10, panelY, 620, panelH);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
    ctx.strokeRect(10, panelY, 620, panelH);
  }

  _drawFlavorText(ctx) {
    const b       = this.box;
    const panelY  = b.y + b.h / 2 + 8;
    ctx.save();
    ctx.font         = '16px "DotGothic16", "Comic Sans MS", monospace';
    ctx.fillStyle    = '#ffffff';
    ctx.textBaseline = 'top';

    const lines = this.flavorText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 28, panelY + 14 + i * 26);
    }
    ctx.restore();
  }

  _drawSubMenu(ctx) {
    const b      = this.box;
    const panelY = b.y + b.h / 2 + 8;

    const list = this.subMenuType === 'ACT'  ? this.actOptions
               : this.subMenuType === 'ITEM' ? this.items.map(i => i.name)
               : this.mercyOptions;

    ctx.save();
    ctx.font         = '15px "DotGothic16", monospace';
    ctx.fillStyle    = '#ffffff';
    ctx.textBaseline = 'top';

    const startX = 40;
    const startY = panelY + 12;

    for (let i = 0; i < list.length; i++) {
      const col  = i % 2;
      const row  = Math.floor(i / 2);
      const ix   = startX + col * 295;
      const iy   = startY + row * 30;

      ctx.fillText(list[i], ix, iy);

      if (i === this.selectedSubItem) {
        window.sprites.draw(ctx, 'soul_red', ix - 18, iy + 8, { scale: 0.85 });
      }
    }
    ctx.restore();
  }

  _drawFightTarget(ctx) {
    const b    = this.box;
    const barY = b.y - b.h / 2 + 10;
    const barH = b.h - 20;
    const barL = b.x - b.w / 2 + 10;
    const barR = b.x + b.w / 2 - 10;

    ctx.save();

    // Center reticle line (faint)
    ctx.strokeStyle = '#334455'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x, barY);
    ctx.lineTo(b.x, barY + barH);
    ctx.stroke();

    // Danger zone highlight (center third = perfect zone)
    const zoneW = (barR - barL) * 0.25;
    const zoneX = b.x - zoneW / 2;
    ctx.fillStyle = 'rgba(255, 200, 0, 0.12)';
    ctx.fillRect(zoneX, barY, zoneW, barH);
    ctx.strokeStyle = 'rgba(255,200,0,0.25)'; ctx.lineWidth = 1;
    ctx.strokeRect(zoneX, barY, zoneW, barH);

    // Target reticle bar
    ctx.fillStyle   = '#ffffff';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur  = 12;
    ctx.fillRect(this.fightBar.x - 7, barY, 14, barH);
    ctx.shadowBlur = 0;

    // Fight text prompt
    ctx.textAlign    = 'center';
    ctx.font         = '10px "Press Start 2P", monospace';
    ctx.fillStyle    = '#ffcc00';
    ctx.fillText('[ Z ] ATTAQUER', b.x, b.y + b.h / 2 - 4);

    ctx.restore();
  }

  // ─── HUD (Undertale-accurate) ────────────────────────────────
  _drawHUD(ctx) {
    const p = this.player;
    ctx.save();
    ctx.textBaseline = 'alphabetic';

    // Player name & LV
    ctx.font      = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHARA', 18, 388);
    ctx.fillText('LV 19', 120, 388);

    // HP label
    ctx.font      = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HP', 248, 388);

    // HP bar background (dark red)
    const BAR_X = 278, BAR_Y = 373, BAR_W = 155, BAR_H = 17;
    ctx.fillStyle = '#6b0000';
    ctx.fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);

    // HP fill (yellow)
    const hpFrac = Math.max(0, p.hp / p.maxHp);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(BAR_X, BAR_Y, hpFrac * BAR_W, BAR_H);

    // KR overlay (purple drain)
    if (p.karma > 0) {
      const krFrac  = Math.max(0, p.karma / p.maxHp);
      const krStart = Math.max(0, hpFrac - krFrac) * BAR_W;
      ctx.fillStyle = '#9d4edd';
      ctx.fillRect(BAR_X + krStart, BAR_Y, krFrac * BAR_W, BAR_H);
    }

    // HP bar border
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.strokeRect(BAR_X, BAR_Y, BAR_W, BAR_H);

    // HP numeric text
    ctx.font      = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${Math.ceil(p.hp)} / ${p.maxHp}`, 443, 388);

    // KR label
    if (p.karma > 0) {
      ctx.fillStyle = '#cc88ff';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(`KR:${p.karma}`, 555, 388);
    }

    // Phase badge
    const phaseColors = ['', '#00d4ff', '#ff9100', '#9d4edd'];
    ctx.font      = '9px "Press Start 2P", monospace';
    ctx.fillStyle = phaseColors[this.currentPhase];
    ctx.textAlign = 'right';
    ctx.shadowColor = phaseColors[this.currentPhase]; ctx.shadowBlur = 8;
    ctx.fillText(`PHASE ${this.currentPhase}`, 632, 20);
    ctx.shadowBlur = 0; ctx.textAlign = 'left';

    ctx.restore();
  }

  _drawButtons(ctx) {
    const SPACING = 138;
    const START_X = 96;
    const BTN_Y   = 438;

    for (let i = 0; i < 4; i++) {
      const bx     = START_X + i * SPACING;
      const sel    = this.state === 'BATTLE_MENU' && this.selectedBtn === i;
      const isMercy = i === 3;

      let spriteName;
      if (isMercy && this.mercyBroken) {
        spriteName = sel ? 'btn_nomercy_1' : 'btn_nomercy_0';
      } else {
        spriteName = `btn_${this.buttons[i].toLowerCase()}_${sel ? 1 : 0}`;
      }

      // Button glow when selected
      if (sel) {
        ctx.save();
        ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 16;
        window.sprites.draw(ctx, spriteName, bx, BTN_Y);
        ctx.restore();
      } else {
        window.sprites.draw(ctx, spriteName, bx, BTN_Y);
      }

      // Mercy broken pieces scattered around
      if (isMercy && this.mercyBroken) {
        for (const mp of this.mercyPieces) {
          window.sprites.draw(ctx, 'btn_mercypiece_0', bx + mp.x, BTN_Y + mp.y, { scale: mp.scale, rotation: mp.rot });
        }
      }

      // Soul cursor on selected button
      if (sel) {
        const heartY = BTN_Y + (this.menuSoulY || 0);
        window.sprites.draw(ctx, 'soul_red', bx - 40, heartY, { scale: 0.9 });
      }
    }

    // Menu bones
    for (const b of this.menuBones) {
      window.sprites.drawBone(ctx, b.x, b.y, b.w, b.h, b.type);
    }
  }

  _drawGameOver(ctx) {
    ctx.save();
    ctx.textAlign = 'center';

    // Red glow vignette
    const grd = ctx.createRadialGradient(320, 240, 50, 320, 240, 260);
    grd.addColorStop(0, 'rgba(100,0,0,0.3)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 640, 480);

    // GAME OVER text
    ctx.font        = '20px "Press Start 2P", monospace';
    ctx.fillStyle   = '#ff2222';
    ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 20;
    ctx.fillText('GAME OVER', 320, 250);
    ctx.shadowBlur  = 0;

    ctx.font      = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Tu ne peux pas abandonner ici...', 320, 290);
    ctx.fillText('Reste déterminé !', 320, 315);

    const blink = Math.floor(Date.now() / 450) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('[ Z ] RÉESSAYER', 320, 358);
    }

    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════
//  BOOT ON DOM READY
// ═══════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', async () => {
  console.log('[LB] Loading sprites...');

  // Loading overlay
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');
  const drawLoading = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 640, 480);
    ctx.textAlign = 'center';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHARGEMENT...', 320, 230);
    const pct = window.sprites.totalCount > 0
      ? Math.floor((window.sprites.loadedCount / window.sprites.totalCount) * 100)
      : 0;
    ctx.fillStyle = '#ffcc00';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(`${pct}%`, 320, 260);
    // Loading bar
    ctx.fillStyle = '#333344';
    ctx.fillRect(200, 275, 240, 14);
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(200, 275, 240 * (pct / 100), 14);
    if (!window.sprites.ready) requestAnimationFrame(drawLoading);
  };
  drawLoading();

  await window.sprites.loadAll();
  await window.audio.preloadAll();

  window.game = new GameEngine();
  window.game.start();
  console.log('[LB] Game started!');
});
