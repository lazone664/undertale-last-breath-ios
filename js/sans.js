/**
 * UNDERTALE: LAST BREATH - SANS BOSS ENGINE
 * Full sprite animation system with all LB phases, typewriter dialogue, eye flames
 */

class SansBoss {
  constructor() {
    this.x = 320;
    this.y = 148;
    this.phase = 1;

    // ── Animation ──
    this.animTime   = 0;  // increments each frame
    this.animTimer  = 0;  // frame-accurate timer
    this.animFrame  = 0;  // current frame index

    // animation state machine
    // states: 'idle' | 'throw' | 'attack_board' | 'upboard' | 'laugh' | 'kick' |
    //         'dodge' | 'block' | 'lost' | 'tte' | 'fallback' | 'collapse' | 'hood' | 'walk'
    this.animState     = 'idle';
    this.animFrameMax  = 42; // updated when state changes
    this.animSpeed     = 4;  // frames per sprite tick
    this.animLoop      = true;
    this.animOnEnd     = null;

    // ── Offset / shake ──
    this.dodgeOffsetX = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    // ── Eye ──
    this.eyeActive    = false;
    this.eyeColor     = '#00d4ff';
    this.eyeParticles = [];

    // ── Gaster hands (Phase 3) ──
    this.gasterHands = [
      { angle: 0,         dist: 95 },
      { angle: Math.PI,   dist: 95 },
      { angle: Math.PI/2, dist: 60 }
    ];

    // ── Dialogue ──
    this.isSpeaking       = false;
    this.speechText       = '';
    this.displayedText    = '';
    this.speechCharIndex  = 0;
    this.speechTimer      = 0;
    this.speechSpeed      = 2;
    this.onSpeechComplete = null;
    this.faceIndex        = 0;

    // ── Phase 3 aura flicker ──
    this.auraAlpha     = 0;
    this.auraTargetAlpha = 0;
  }

  // ────────────────────────────────────────────
  //  Phase setup
  // ────────────────────────────────────────────
  setPhase(p) {
    this.phase     = p;
    this.dodgeOffsetX = 0;
    this.animTime  = 0;
    this.animTimer = 0;
    this.animFrame = 0;

    if (p === 1) {
      this.faceIndex = 0;
      this.setAnim('idle', 42, 3, true);
    } else if (p === 2) {
      this.faceIndex = 2;
      this.setAnim('idle', 42, 3, true);
    } else {
      this.faceIndex = 3;
      this.auraTargetAlpha = 0.9;
      this.setAnim('idle', 42, 3, true);
    }
  }

  // ────────────────────────────────────────────
  //  Animation state control
  // ────────────────────────────────────────────
  setAnim(state, frameMax, speed = 4, loop = true, onEnd = null) {
    this.animState    = state;
    this.animFrame    = 0;
    this.animTimer    = 0;
    this.animFrameMax = frameMax;
    this.animSpeed    = speed;
    this.animLoop     = loop;
    this.animOnEnd    = onEnd;
  }

  // Convenience play-once animation then return to idle
  playOnce(state, frameMax, speed = 4, onEnd = null) {
    this.setAnim(state, frameMax, speed, false, () => {
      this.setAnim('idle', this.phase === 1 ? 42 : 19, 3, true);
      if (onEnd) onEnd();
    });
  }

  // ────────────────────────────────────────────
  //  Public actions
  // ────────────────────────────────────────────
  say(text, face = 0, onComplete = null) {
    this.isSpeaking       = true;
    this.speechText       = text;
    this.displayedText    = '';
    this.speechCharIndex  = 0;
    this.speechTimer      = 0;
    this.faceIndex        = face;
    this.onSpeechComplete = onComplete;
  }

  dodge() {
    this.dodgeOffsetX = -90;
    this.playOnce('dodge', 3, 5);
    window.audio.playSfx('swipe', 0.8);
    setTimeout(() => { this.dodgeOffsetX = 0; }, 650);
  }

  blockAttack() {
    window.audio.playSfx('blocked', 1.0);
    this.playOnce('block', 8, 5);
  }

  throwAttack(onEnd) {
    this.playOnce('throw', 10, 4, onEnd);
  }

  kickAttack(onEnd) {
    this.playOnce('kick', 19, 3, onEnd);
  }

  laughAnim() {
    this.setAnim('laugh', 4, 5, true);
  }

  lostAnim() {
    this.setAnim('lost', 23, 3, true);
  }

  finalBlastAnim(onEnd) {
    this.playOnce('tte', 19, 5, onEnd);
  }

  // ────────────────────────────────────────────
  //  Update
  // ────────────────────────────────────────────
  update() {
    this.animTime  += 0.05;
    this.animTimer++;

    // tick sprite animation
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0;
      this.animFrame++;
      if (this.animFrame >= this.animFrameMax) {
        if (this.animLoop) {
          this.animFrame = 0;
        } else {
          this.animFrame = this.animFrameMax - 1;
          if (this.animOnEnd) {
            const cb = this.animOnEnd;
            this.animOnEnd = null;
            cb();
          }
        }
      }
    }

    // Phase 3 gaster hands orbit
    if (this.phase === 3) {
      this.gasterHands[0].angle += 0.028;
      this.gasterHands[1].angle += 0.028;
      this.gasterHands[2].angle += 0.05;
      for (const h of this.gasterHands) {
        h.x = this.x + Math.cos(h.angle) * h.dist;
        h.y = this.y - 8 + Math.sin(h.angle) * (h.dist * 0.35);
      }
    }

    // Aura fade
    this.auraAlpha += (this.auraTargetAlpha - this.auraAlpha) * 0.06;

    // Eye flame particles
    if (this.eyeActive) {
      this.eyeColor = Math.floor(this.animTime * 8) % 2 === 0 ? '#00d4ff' : '#ffcc00';
      const eyeX = this.x - 6 + this.dodgeOffsetX;
      const eyeY = this.y - 16;
      this.eyeParticles.push({
        x: eyeX + (Math.random() - 0.5) * 5,
        y: eyeY,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -1.8 - Math.random() * 2.2,
        life: 1.0,
        color: this.eyeColor,
        size: 3.5 + Math.random() * 3.5
      });
    }
    for (let i = this.eyeParticles.length - 1; i >= 0; i--) {
      const p = this.eyeParticles[i];
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.055; p.size -= 0.08;
      if (p.life <= 0) this.eyeParticles.splice(i, 1);
    }

    // Dialogue typewriter
    if (this.isSpeaking) {
      this.speechTimer++;
      if (this.speechTimer >= this.speechSpeed) {
        this.speechTimer = 0;
        if (this.speechCharIndex < this.speechText.length) {
          const ch = this.speechText[this.speechCharIndex++];
          this.displayedText += ch;
          if (ch !== ' ' && ch !== '.' && ch !== ',' && ch !== '!') {
            window.audio.playSpeechBlip();
          }
        } else {
          if (this.onSpeechComplete && this.speechTimer === 0) {
            const cb = this.onSpeechComplete;
            this.onSpeechComplete = null;
            setTimeout(() => { this.isSpeaking = false; cb(); }, 720);
          }
        }
      }
    }
  }

  // ────────────────────────────────────────────
  //  Draw
  // ────────────────────────────────────────────
  draw(ctx) {
    const dx = this.x + this.dodgeOffsetX;
    const dy = this.y;

    // Phase 3 spectral aura background
    if (this.phase === 3 && this.auraAlpha > 0.02) {
      this._drawPhase3Aura(ctx, dx, dy);
    }

    // Shadow behind (phase 1)
    if (this.phase === 1) {
      const sh = this.animFrame % 3;
      const spk = `sans_shadow_${sh}`;
      window.sprites.draw(ctx, spk, dx, dy + 55, { alpha: 0.5, scale: 1.05 });
    }

    // Main body
    if (this.phase === 1) {
      this._drawPhase1(ctx, dx, dy);
    } else if (this.phase === 2) {
      this._drawPhase2(ctx, dx, dy);
    } else {
      this._drawPhase3(ctx, dx, dy);
    }

    // Eye flame particles
    this._drawEyeFlame(ctx);

    // Speech bubble
    if (this.isSpeaking && this.displayedText) {
      this._drawSpeechBubble(ctx, dx + 75, dy - 52);
    }
  }

  _drawPhase1(ctx, x, y) {
    const f = this.animFrame;
    let key;

    switch (this.animState) {
      case 'idle':
        key = `sans_idle_${f % 42}`;
        break;
      case 'throw':
        key = `sans_throw_${Math.min(f, 9)}`;
        break;
      case 'attack_board':
        key = `sans_attack_board_${Math.min(f, 16)}`;
        break;
      case 'upboard':
        key = `sans_upboard_${Math.min(f, 9)}`;
        break;
      case 'laugh':
        key = `sans_laugh_${f % 3}`;
        break;
      case 'kick':
        key = `sans_kick_${Math.min(f, 18)}`;
        break;
      case 'dodge':
        key = `sans_missM_${f % 2}`;
        break;
      case 'block':
        key = `sans_block_${Math.min(f, 7)}`;
        break;
      case 'lost':
        key = `sans_lost_${f % 23}`;
        break;
      case 'tte':
        key = `sans_tte_${Math.min(f, 18)}`;
        break;
      case 'fallback':
        key = `sans_fallback_${Math.min(f, 24)}`;
        break;
      case 'collapse':
        key = `sans_collapse_${Math.min(f, 3)}`;
        break;
      case 'hood':
        key = `sans_hood_${f % 12}`;
        break;
      case 'walk':
        key = `sans_walk0_${f % 11}`;
        break;
      default:
        key = `sans_idle_${f % 42}`;
    }

    // draw shadow first for some states
    if (this.eyeActive) {
      ctx.save();
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur  = 14;
      window.sprites.draw(ctx, key, x, y, { scale: 1.05 });
      ctx.restore();
    } else {
      window.sprites.draw(ctx, key, x, y, { scale: 1.05 });
    }
  }

  _drawPhase2(ctx, x, y) {
    const f = this.animFrame;
    let key;

    switch (this.animState) {
      case 'idle': {
        // Phase 2 uses tired animation as idle
        const tf = f % 19;
        key = `sans_tired_${tf}`;
        // Add body + head separately for breathing
        const bk = `sans_p2_body_${Math.floor(this.animTime * 3) % 8}`;
        const hk = `sans_p2_head_${Math.floor(this.animTime * 2) % 16}`;
        const bob = Math.sin(this.animTime * 2) * 2;

        ctx.save();
        ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 8;
        window.sprites.draw(ctx, bk, x, y + 20 + bob, { scale: 1.05 });
        window.sprites.draw(ctx, hk, x, y - 20 + bob * 0.5, { scale: 1.05 });
        ctx.restore();

        // Giant bone staff
        ctx.save();
        ctx.translate(x + 38, y + 4 + bob);
        ctx.rotate(-0.28 + Math.sin(this.animTime * 2) * 0.08);
        window.sprites.drawBone(ctx, 0, 0, 9, 95, 'white');
        ctx.restore();
        return;
      }
      case 'block':
        key = `sans_block_${Math.min(f, 7)}`;
        break;
      case 'slide':
        key = `sans_p2_slide_${Math.min(f, 4)}`;
        break;
      case 'sud':
        key = `sans_p2_sud_${Math.min(f, 4)}`;
        break;
      case 'laugh':
        key = `sans_laugh1_${f % 4}`;
        break;
      default:
        key = `sans_tired_${f % 19}`;
    }

    ctx.save();
    ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 6;
    window.sprites.draw(ctx, key, x, y, { scale: 1.05 });
    ctx.restore();
  }

  _drawPhase3(ctx, x, y) {
    const f  = this.animFrame;
    const t  = this.animTime;
    const bob = Math.sin(t * 1.5) * 3;

    // Draw Gaster hands
    for (const h of this.gasterHands) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.angle);
      ctx.shadowColor = '#9d4edd'; ctx.shadowBlur = 18;
      ctx.strokeStyle = '#9d4edd'; ctx.fillStyle = 'rgba(157,78,221,0.5)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Phase 3 body / head combo
    const bk = `sans_p3_body_${f % 3}`;
    const hk = `sans_p3_head_${f % 16}`;
    const lk = `sans_p3_legs_${f % 2}`;
    const ak = `sans_p3_arms_${f % 2}`;

    ctx.save();
    ctx.shadowColor = '#9d4edd'; ctx.shadowBlur = 20;
    ctx.globalAlpha = 0.9;
    // Draw irelia glow
    const ik = `sans_irelia_${f % 18}`;
    if (window.sprites.has(ik)) {
      ctx.globalAlpha = 0.55;
      window.sprites.draw(ctx, ik, x, y + bob, { scale: 1.3 });
    }
    ctx.globalAlpha = 1.0;
    window.sprites.draw(ctx, lk, x, y + 34 + bob, { scale: 1.1 });
    window.sprites.draw(ctx, bk, x, y + 10 + bob, { scale: 1.1 });
    window.sprites.draw(ctx, ak, x - 2, y + 10 + bob, { scale: 1.1 });
    window.sprites.draw(ctx, hk, x, y - 24 + bob * 0.5, { scale: 1.1 });
    ctx.restore();
  }

  _drawPhase3Aura(ctx, x, y) {
    const t = this.animTime;
    ctx.save();
    const pulse = 0.5 + Math.sin(t * 3) * 0.3;
    ctx.fillStyle = `rgba(80,0,120,${this.auraAlpha * pulse * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 80, 55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawEyeFlame(ctx) {
    for (const p of this.eyeParticles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawSpeechBubble(ctx, bx, by) {
    const FONT  = '15px "Comic Sans MS", "DotGothic16", cursive';
    const PAD   = 12;
    const MAX_W = 210;

    ctx.save();
    ctx.font = FONT;

    // Word wrap
    const words = this.displayedText.split(' ');
    const lines  = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > MAX_W && cur) {
        lines.push(cur); cur = w;
      } else cur = test;
    }
    if (cur) lines.push(cur);

    const bh = Math.max(46, lines.length * 20 + PAD * 2);
    const bw = MAX_W + PAD * 2;

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.roundRect(bx + 3, by - bh / 2 + 3, bw, bh, 8);
    ctx.fill();

    // Bubble body
    ctx.fillStyle   = '#ffffff';
    ctx.strokeStyle = '#222222';
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.roundRect(bx, by - bh / 2, bw, bh, 8);
    ctx.fill(); ctx.stroke();

    // Beak arrow
    ctx.beginPath();
    ctx.moveTo(bx - 1, by - 2);
    ctx.lineTo(bx - 14, by);
    ctx.lineTo(bx - 1, by + 8);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Text
    ctx.fillStyle   = '#000000';
    ctx.textBaseline = 'top';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], bx + PAD, by - bh / 2 + PAD + i * 20);
    }

    ctx.restore();
  }
}

window.SansBoss = SansBoss;
