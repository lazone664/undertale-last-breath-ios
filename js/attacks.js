/**
 * UNDERTALE: LAST BREATH – ATTACK PATTERNS
 * Faithful recreation of Last Breath's iconic attack sequences
 */

class AttackManager {
  constructor() {
    this.bullets      = [];
    this.blasters     = [];
    this.platforms    = [];
    this.particles    = [];
    this.effects      = [];

    this.activePattern   = null;
    this.patternTimer    = 0;
    this.patternDuration = 480;
    this.isRunning       = false;
    this.onEnd           = null;

    // Sub-timers for each pattern
    this._waveTimer = 0;
    this._waveIndex = 0;
  }

  clear() {
    this.bullets   = [];
    this.blasters  = [];
    this.platforms = [];
    this.effects   = [];
    this._waveTimer = 0;
    this._waveIndex = 0;
  }

  startPattern(name, player, sans, box, onEnd = null) {
    this.clear();
    this.activePattern   = name;
    this.patternTimer    = 0;
    this.isRunning       = true;
    this.onEnd           = onEnd;
    this.patternDuration = 480;

    // Per-pattern durations
    if (name.includes('spiral')) this.patternDuration = 540;
    if (name.includes('finale')) this.patternDuration = 720;
    if (name.includes('gaster')) this.patternDuration = 600;
    if (name.includes('blasters')) this.patternDuration = 420;
  }

  stopPattern() {
    this.isRunning = false;
    this.clear();
    if (this.onEnd) { const cb = this.onEnd; this.onEnd = null; cb(); }
  }

  // ═══════════════════════════════════════════════════════════════
  //  UPDATE
  // ═══════════════════════════════════════════════════════════════
  update(player, sans, box) {
    if (!this.isRunning) return;
    this.patternTimer++;
    this._waveTimer++;

    const fn = this[this.activePattern];
    if (fn) fn.call(this, this.patternTimer, player, sans, box);

    // Pattern end
    if (this.patternTimer >= this.patternDuration) {
      this.stopPattern(); return;
    }

    // ── Update bullets ──
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life = (b.life || 0) + 1;
      if (b.rotSpd) b.angle = (b.angle || 0) + b.rotSpd;
      if (b.gravity) b.vy += b.gravity;
      if (b.homingStr && b.life < 90) {
        const dx = player.x - b.x;
        const dy = player.y - b.y;
        const d  = Math.sqrt(dx*dx + dy*dy) || 1;
        b.vx += (dx / d) * b.homingStr;
        b.vy += (dy / d) * b.homingStr;
        const spd = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
        const maxSpd = b.maxSpd || 5;
        if (spd > maxSpd) { b.vx = b.vx/spd*maxSpd; b.vy = b.vy/spd*maxSpd; }
      }

      // Collision with player
      if (this._hitBullet(b, player)) {
        const isMoving = Math.abs(player.vx) > 0.15 || Math.abs(player.vy) > 0.15;
        let dmg = true;
        if (b.type === 'blue'   && !isMoving) dmg = false;
        if (b.type === 'orange' && isMoving)  dmg = false;

        if (dmg) {
          const res = player.takeDamage(b.dmg || 1, true, b.canParry || false);
          if (res === 'parried') {
            b.vx *= -1.5; b.vy *= -1.5;
            b.type = 'orange'; b.canParry = false;
            this._spawnParticles(b.x, b.y, '#ffcc00', 6);
          } else if (res) {
            this._spawnParticles(b.x, b.y, b.type === 'blue' ? '#00d4ff' : '#ff2222', 4);
            if (!b.pierce) this.bullets.splice(i, 1);
          }
        }
        continue;
      }

      // Out of box or lifetime
      const outX = b.x < box.x - box.w/2 - 30 || b.x > box.x + box.w/2 + 30;
      const outY = b.y < box.y - box.h/2 - 30 || b.y > box.y + box.h/2 + 30;
      if (outX || outY || (b.maxLife && b.life > b.maxLife)) {
        this.bullets.splice(i, 1);
      }
    }

    // ── Update blasters ──
    for (let i = this.blasters.length - 1; i >= 0; i--) {
      const bl = this.blasters[i];
      bl.timer++;

      if (bl.state === 'charge' && bl.timer >= bl.chargeTime) {
        bl.state = 'fire';
        bl.timer = 0;
        window.audio.playSfx('blasting', 0.75);
      } else if (bl.state === 'fire' && bl.timer >= bl.fireTime) {
        bl.state = 'cooldown';
      } else if (bl.state === 'cooldown' && bl.timer >= 30) {
        this.blasters.splice(i, 1);
        continue;
      }

      // Firing damage to player
      if (bl.state === 'fire') {
        if (this._hitBlaster(bl, player)) {
          player.takeDamage(2, true);
        }
      }
    }

    // ── Update particles ──
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.94; p.vy *= 0.94;
      p.vy += (p.gravity || 0);
      p.life -= 0.04;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  COLLISION HELPERS
  // ═══════════════════════════════════════════════════════════════
  _hitBullet(b, player) {
    const r = player.hitboxRadius + (b.r || 4);
    const dx = b.x - player.x, dy = b.y - player.y;
    return dx*dx + dy*dy < r*r;
  }

  _hitBlaster(bl, player) {
    if (bl.angle === undefined) return false;
    const cos = Math.cos(bl.angle), sin = Math.sin(bl.angle);
    const dx  = player.x - bl.x, dy = player.y - bl.y;
    const lp  = dx * cos + dy * sin;
    const pp  = -dx * sin + dy * cos;
    return lp > 0 && lp < bl.length && Math.abs(pp) < 16;
  }

  // ═══════════════════════════════════════════════════════════════
  //  SPAWN HELPERS
  // ═══════════════════════════════════════════════════════════════
  _spawnBone(x, y, vx, vy, type = 'white', w = 8, h = 32, opts = {}) {
    this.bullets.push({ x, y, vx, vy, type, w, h,
      r: Math.min(w, h) / 2, life: 0,
      canParry: opts.canParry || false,
      pierce: opts.pierce || false,
      angle: opts.angle || 0,
      rotSpd: opts.rotSpd || 0,
      maxLife: opts.maxLife || 0,
      dmg: opts.dmg || 1,
      gravity: opts.gravity || 0
    });
  }

  _spawnBlaster(x, y, angle, chargeTime = 60, fireTime = 40, length = 300, size = 'normal') {
    this.blasters.push({ x, y, angle, chargeTime, fireTime, length, size,
      state: 'charge', timer: 0 });
  }

  _spawnParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        color, life: 0.8 + Math.random() * 0.4,
        size: 2 + Math.random() * 3,
        gravity: 0.05
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  PHASE 1 PATTERNS
  // ═══════════════════════════════════════════════════════════════

  // Pattern 1-A: Cascading bone shower (LB classic opening)
  pat_p1_boneshower(t, player, sans, box) {
    const bx = box.x, by = box.y;
    const hw = box.w / 2, hh = box.h / 2;

    // Wave 1: Waves of bones from top
    if (t % 18 === 0 && t < 250) {
      const waveN = Math.floor(t / 18);
      const count = 5 + waveN;
      for (let i = 0; i < count; i++) {
        const x = bx - hw + 20 + (i / (count - 1)) * (box.w - 40);
        const spd = 2.5 + Math.random() * 1.5;
        this._spawnBone(x, by - hh - 10, 0, spd, 'white', 7, 32);
      }
    }

    // Interleaved blue bones (stop to dodge)
    if (t % 30 === 15 && t > 60 && t < 300) {
      const x = bx - hw + 20 + Math.random() * (box.w - 40);
      this._spawnBone(x, by - hh - 10, 0, 2.8, 'blue', 7, 32);
    }

    // Orange bones rushing from sides
    if (t % 45 === 0 && t > 120) {
      for (let k = 0; k < 3; k++) {
        const y = by - hh + 30 + k * (box.h / 3.5);
        this._spawnBone(bx - hw - 15, y, 4.5, 0, 'orange', 32, 7);
        this._spawnBone(bx + hw + 15, y, -4.5, 0, 'orange', 32, 7);
      }
    }

    // Sans animation during attack
    if (t === 20)  { sans.throwAttack(); window.audio.playSfx('throw', 0.6); }
    if (t === 120) { sans.playOnce('kick', 19, 3); window.audio.playSfx('impact', 0.5); }
  }

  // Pattern 1-B: Gaster blasters cross
  pat_p1_blasters(t, player, sans, box) {
    const bx = box.x, by = box.y;

    if (t === 5) {
      sans.laughAnim();
      window.audio.playSfx('eyeflash', 0.7);
    }

    // Spawn blasters at cardinal positions
    if (t === 30) {
      this._spawnBlaster(bx - box.w/2 - 60, by, 0, 55, 45, box.w + 120);            // left
      this._spawnBlaster(bx + box.w/2 + 60, by, Math.PI, 65, 45, box.w + 120);      // right
    }
    if (t === 100) {
      this._spawnBlaster(bx, by - box.h/2 - 60, Math.PI/2, 55, 45, box.h + 120);    // top
      this._spawnBlaster(bx, by + box.h/2 + 60, -Math.PI/2, 65, 45, box.h + 120);   // bottom
    }
    if (t === 180) {
      // Diagonal blasters
      this._spawnBlaster(bx - box.w/2 - 50, by - box.h/2 - 50, Math.PI/4, 55, 40, 320);
      this._spawnBlaster(bx + box.w/2 + 50, by - box.h/2 - 50, 3*Math.PI/4, 65, 40, 320);
    }

    // Accompanying bone curtain
    if (t % 20 === 0 && t > 90 && t < 320) {
      const x = bx - box.w/2 + Math.random() * box.w;
      const type = Math.random() < 0.3 ? 'blue' : 'white';
      this._spawnBone(x, by - box.h/2 - 8, 0, 3.2, type, 7, 30);
    }
  }

  // Pattern 1-C: Blue rain – stand still!
  pat_p1_blue_rain(t, player, sans, box) {
    const bx = box.x, by = box.y;
    const hw = box.w / 2;

    if (t === 1) {
      window.audio.playSfx('grab', 0.7);
      player.slam('down', box);
    }

    // Dense blue bone rain
    if (t % 8 === 0 && t < 320) {
      const x = bx - hw + 15 + Math.random() * (box.w - 30);
      this._spawnBone(x, by - box.h/2 - 8, 0, 3.8 + Math.random() * 1.5, 'blue', 6, 30);
    }

    // Orange "must-move" bones
    if (t % 55 === 0) {
      const y = by - box.h/2 + 30 + Math.random() * (box.h - 60);
      this._spawnBone(bx - hw - 15, y, 5, 0, 'orange', 28, 6);
      this._spawnBone(bx + hw + 15, y, -5, 0, 'orange', 28, 6);
    }
  }

  // Pattern 1-D: Spinning bone cross
  pat_p1_cross(t, player, sans, box) {
    const bx = box.x, by = box.y;

    // Slow-build rotating bone walls
    if (t % 14 === 0 && t < 400) {
      const angle = (t / 14) * 0.35;
      const r = 85;
      for (let k = 0; k < 4; k++) {
        const a = angle + (k * Math.PI / 2);
        const sx = bx + Math.cos(a) * r;
        const sy = by + Math.sin(a) * r;
        this._spawnBone(sx, sy, Math.cos(a+Math.PI/2)*2.2, Math.sin(a+Math.PI/2)*2.2, 'white', 7, 30, { rotSpd: 0.1 });
      }
    }

    // Sans kick triggers
    if (t === 50)  sans.kickAttack(() => window.audio.playSfx('impact', 0.7));
    if (t === 200) sans.kickAttack(() => window.audio.playSfx('impact', 0.7));

    // Blue column rings
    if (t % 60 === 0 && t > 60) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        this._spawnBone(bx + Math.cos(a)*5, by + Math.sin(a)*5,
          Math.cos(a)*3.5, Math.sin(a)*3.5, 'blue', 6, 28, { maxLife: 55 });
      }
    }
  }

  // Pattern 1-E: Spiral bone attack
  pat_p1_spiral(t, player, sans, box) {
    const bx = box.x, by = box.y;

    if (t === 1) {
      sans.throwAttack();
      window.audio.playSfx('bonewall', 0.65);
    }

    // Inward spiral
    if (t % 6 === 0 && t < 400) {
      const angle = (t / 6) * 0.42;
      const r = 130 - t * 0.2;
      if (r > 20) {
        const sx = bx + Math.cos(angle) * r;
        const sy = by + Math.sin(angle) * r;
        const vx = -Math.cos(angle) * 3;
        const vy = -Math.sin(angle) * 3;
        this._spawnBone(sx, sy, vx, vy, 'white', 6, 28);
      }
    }

    // Outward orange spiral (counter-rotating)
    if (t % 10 === 5 && t > 100 && t < 450) {
      const angle = -(t / 10) * 0.55;
      const r = 50;
      const sx = bx + Math.cos(angle) * r;
      const sy = by + Math.sin(angle) * r;
      this._spawnBone(sx, sy, Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 'orange', 28, 6);
    }

    // Blaster at half-way
    if (t === 250) {
      this._spawnBlaster(bx - box.w/2 - 50, by, 0, 50, 40, box.w + 100);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  PHASE 2 PATTERNS
  // ═══════════════════════════════════════════════════════════════

  // Pattern 2-A: Giant bone staff slam + parry windows
  pat_p2_giantbone(t, player, sans, box) {
    const bx = box.x, by = box.y;

    if (t === 1) {
      window.audio.playSfx('bonewall', 0.8);
      player.slam('down', box);
    }

    // Horizontal sweeping giant bones
    if (t % 80 === 20) {
      // Big bone sweeping right-to-left
      for (let k = 0; k < 2; k++) {
        const y = by - box.h/2 + 30 + k * 65;
        this._spawnBone(bx + box.w/2 + 20, y, -5.5, 0, 'white', 50, 10, { canParry: true, pierce: true });
      }
      window.audio.playSfx('throw', 0.55);
    }
    if (t % 80 === 50) {
      for (let k = 0; k < 3; k++) {
        const y = by - box.h/2 + 20 + k * 48;
        this._spawnBone(bx - box.w/2 - 20, y, 5.5, 0, 'white', 50, 10, { canParry: true, pierce: true });
      }
    }

    // Blue bone columns from above
    if (t % 25 === 0 && t > 50) {
      const x = bx - box.w/2 + 20 + Math.random() * (box.w - 40);
      this._spawnBone(x, by - box.h/2 - 8, 0, 4.2, 'blue', 7, 36);
    }

    // Sans animation
    if (t === 15) sans.setAnim('slide', 5, 4, false);
  }

  // Pattern 2-B: Rotating bone cross + gravity flip
  pat_p2_rotating(t, player, sans, box) {
    const bx = box.x, by = box.y;

    // Gravity flip warning
    if (t === 40) {
      player.slam('up', box);
      window.audio.playSfx('grab', 0.8);
    }
    if (t === 160) {
      player.slam('down', box);
      window.audio.playSfx('grab', 0.8);
    }

    // Rotating bone wall
    if (t % 10 === 0) {
      const angle = (t / 10) * 0.3;
      const hw = box.w / 2 - 10;
      for (let k = 0; k < 2; k++) {
        const a = angle + k * Math.PI;
        this._spawnBone(
          bx + Math.cos(a) * hw, by + Math.sin(a) * hw * 0.6,
          Math.cos(a + Math.PI/2) * 3, Math.sin(a + Math.PI/2) * 3,
          'white', 8, 36, { maxLife: 40 }
        );
      }
    }

    // Diagonal blasters at 90s
    if (t === 90) {
      this._spawnBlaster(bx - box.w/2 - 50, by - box.h/2 - 50, Math.PI/4, 50, 40, 350);
    }
    if (t === 200) {
      this._spawnBlaster(bx + box.w/2 + 50, by - box.h/2 - 50, 3*Math.PI/4, 55, 40, 350);
    }
  }

  // Pattern 2-C: Arena manipulation (box shakes)
  pat_p2_arena(t, player, sans, box) {
    const bx = box.x, by = box.y;

    // Tilt the arena
    if (t === 30)  { box.targetAngle = 0.12;  window.audio.playSfx('impact', 0.6); }
    if (t === 120) { box.targetAngle = -0.10; }
    if (t === 210) { box.targetAngle = 0.0; }

    // Small bones raining during tilt
    if (t % 14 === 0 && t < 380) {
      const x = bx - box.w/2 + 15 + Math.random() * (box.w - 30);
      const type = Math.random() < 0.4 ? 'blue' : 'white';
      this._spawnBone(x, by - box.h/2 - 8, 0, 3.5, type, 7, 28);
    }

    // Orange horizontal sweep mid-pattern
    if (t === 160 || t === 280) {
      const y = by - box.h/2 + 30 + Math.random() * (box.h - 60);
      this._spawnBone(bx - box.w/2 - 15, y, 5.5, 0, 'orange', 36, 7);
      this._spawnBone(bx + box.w/2 + 15, y, -5.5, 0, 'orange', 36, 7);
    }

    // Blaster at angle
    if (t === 200) {
      this._spawnBlaster(bx, by - box.h/2 - 55, Math.PI/2, 50, 40, box.h + 110);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  PHASE 3 PATTERNS
  // ═══════════════════════════════════════════════════════════════

  // Pattern 3-A: Gaster hands (homing bones + blasters)
  pat_p3_gaster(t, player, sans, box) {
    const bx = box.x, by = box.y;

    if (t === 1) {
      window.audio.playSfx('gaster0', 0.7);
    }
    if (t === 60) {
      window.audio.playSfx('gaster1', 0.75);
    }
    if (t === 180) {
      window.audio.playSfx('gaster2', 0.7);
    }

    // Gravity shifts
    if (t === 50)  { player.slam('left',  box); window.audio.playSfx('grab', 0.8); }
    if (t === 180) { player.slam('right', box); window.audio.playSfx('grab', 0.8); }
    if (t === 320) { player.slam('down',  box); window.audio.playSfx('grab', 0.8); }

    // Purple homing bones
    if (t % 30 === 0 && t > 40) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 100;
      const sx    = bx + Math.cos(angle) * dist;
      const sy    = by + Math.sin(angle) * dist;
      const dx    = player.x - sx;
      const dy    = player.y - sy;
      const d     = Math.sqrt(dx*dx + dy*dy) || 1;
      this.bullets.push({
        x: sx, y: sy,
        vx: (dx/d) * 2.5, vy: (dy/d) * 2.5,
        type: 'purple', r: 5, w: 9, h: 9,
        life: 0, maxLife: 150,
        canParry: true, dmg: 1,
        homingStr: 0.12, maxSpd: 3.5,
        angle: 0, rotSpd: 0.2
      });
    }

    // Blasters in X pattern
    if (t === 100) {
      this._spawnBlaster(bx - box.w/2 - 50, by - box.h/2 - 50, Math.PI/4, 55, 50, 380);
      this._spawnBlaster(bx + box.w/2 + 50, by - box.h/2 - 50, 3*Math.PI/4, 65, 50, 380);
      this._spawnBlaster(bx - box.w/2 - 50, by + box.h/2 + 50, -Math.PI/4, 60, 50, 380);
      this._spawnBlaster(bx + box.w/2 + 50, by + box.h/2 + 50, -3*Math.PI/4, 70, 50, 380);
    }
  }

  // Pattern 3-B: Grand finale (everything at once)
  pat_p3_finale(t, player, sans, box) {
    const bx = box.x, by = box.y;

    if (t === 1) {
      sans.finalBlastAnim();
      window.audio.playSfx('blastedbig', 0.8);
    }

    // Rotating blasters
    if (t === 30) {
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2;
        const dist = 140;
        this._spawnBlaster(bx + Math.cos(a)*dist, by + Math.sin(a)*dist, a + Math.PI/2, 60, 55, 280);
      }
    }

    // Bone spiral inward
    if (t % 5 === 0 && t > 80 && t < 500) {
      const angle = (t / 5) * 0.4;
      const r     = 120 - (t - 80) * 0.18;
      if (r > 15) {
        const sx = bx + Math.cos(angle) * r;
        const sy = by + Math.sin(angle) * r;
        this._spawnBone(sx, sy, -Math.cos(angle)*4, -Math.sin(angle)*4, 'purple', 7, 30);
      }
    }

    // Gravity madness
    const gravSeq = [0, 120, 240, 360, 480, 600];
    const dirs    = ['down', 'up', 'left', 'right', 'down', 'up'];
    for (let k = 0; k < gravSeq.length; k++) {
      if (t === gravSeq[k] + 70) {
        player.slam(dirs[k], box);
        window.audio.playSfx('grab', 0.7);
      }
    }

    // Blasters mid-way second wave
    if (t === 300) {
      this._spawnBlaster(bx - box.w/2 - 50, by, 0, 55, 50, box.w + 100);
      this._spawnBlaster(bx + box.w/2 + 50, by, Math.PI, 65, 50, box.w + 100);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  DRAW
  // ═══════════════════════════════════════════════════════════════
  draw(ctx) {
    // Blasters
    for (const bl of this.blasters) {
      this._drawBlaster(ctx, bl);
    }

    // Bullets
    for (const b of this.bullets) {
      this._drawBullet(ctx, b);
    }

    // Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawBullet(ctx, b) {
    const color = b.type === 'blue'   ? '#00d4ff'
                : b.type === 'orange' ? '#ff9100'
                : b.type === 'purple' ? '#cc44ff'
                : '#ffffff';

    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.angle) ctx.rotate(b.angle);

    ctx.fillStyle   = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = b.type !== 'white' ? 8 : 3;

    // Try to draw from sprite manager
    const boneKey = b.type === 'purple' ? 'bone_cycle_0' : 'bone';
    if (window.sprites.has(boneKey) && (b.w < 15 && b.h > 20 || b.w > 20 && b.h < 15)) {
      // Use actual sprite
      const scaleX = b.w / 8;
      const scaleY = b.h / 32;
      const isVertical = b.h > b.w;
      ctx.rotate(isVertical ? 0 : Math.PI/2);
      window.sprites.draw(ctx, boneKey, 0, 0, { scale: Math.max(scaleX, scaleY) });
    } else {
      // Fallback: draw primitive
      ctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
      // Caps
      const cw = b.w + 4, ch = 5;
      ctx.fillRect(-cw/2, -b.h/2 - 1, cw, ch);
      ctx.fillRect(-cw/2, b.h/2 - ch + 1, cw, ch);
    }

    ctx.restore();
  }

  _drawBlaster(ctx, bl) {
    const cos = Math.cos(bl.angle);
    const sin = Math.sin(bl.angle);
    const t   = bl.timer;

    // Gaster Blaster frame index based on state
    let frame, alpha;
    if (bl.state === 'charge') {
      frame = Math.floor((t / bl.chargeTime) * 6);
      alpha = 0.5 + (t / bl.chargeTime) * 0.5;
    } else if (bl.state === 'fire') {
      frame = 5;
      alpha = 1.0;
    } else {
      frame = Math.max(0, 5 - Math.floor((t / 30) * 6));
      alpha = 1.0 - (t / 30);
    }

    // Draw blaster skull
    const blKey = bl.size === 'big' ? `blaster_big_${Math.min(frame, 6)}`
                : bl.size === 'big2' ? `blaster2_${Math.min(frame, 4)}`
                : `blaster_${Math.min(frame, 5)}`;

    ctx.save();
    ctx.translate(bl.x, bl.y);
    ctx.rotate(bl.angle);
    ctx.globalAlpha = alpha;
    window.sprites.draw(ctx, blKey, 0, 0, { scale: bl.size === 'big' ? 1.6 : 1.1 });

    // Laser beam if firing
    if (bl.state === 'fire') {
      const beamW = bl.size === 'big' ? 28 : 18;

      ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 20;
      // Beam glow outer
      const grd = ctx.createLinearGradient(0, 0, bl.length, 0);
      grd.addColorStop(0,   'rgba(0, 212, 255, 0.9)');
      grd.addColorStop(0.1, 'rgba(255, 255, 255, 1.0)');
      grd.addColorStop(0.9, 'rgba(0, 212, 255, 0.6)');
      grd.addColorStop(1,   'rgba(0, 212, 255, 0.0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, -beamW/2, bl.length, beamW);

      // Core bright white
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(0, -4, bl.length, 8);
    }

    ctx.restore();
  }
}

window.AttackManager = AttackManager;
