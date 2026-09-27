/**
 * UNDERTALE: LAST BREATH - PLAYER SOUL & PHYSICS ENGINE
 * Gère l'âme rouge et bleue, la gravité, les collisions, le Karma (KR) et la parade
 */

class Player {
  constructor() {
    this.x = 320;
    this.y = 300;
    this.vx = 0;
    this.vy = 0;
    
    // Hitbox (Undertale hitbox is smaller than the 16x16 sprite)
    this.size = 16;
    this.hitboxRadius = 5;

    // Movement speeds
    this.baseSpeed = 2.8;
    this.focusSpeed = 1.3;

    // Soul Mode: 'red' | 'blue'
    this.mode = 'red';

    // Blue Soul Gravity
    this.gravityDir = 'down'; // 'down' | 'up' | 'left' | 'right'
    this.gravity = 0.22;
    this.jumpForce = -5.0;
    this.jumpReleaseCut = 0.55;
    this.isGrounded = false;
    this.canJump = true;
    this.angle = 0; // Soul rotation angle for blue slams

    // Stats
    this.maxHp = 92;
    this.hp = 92;
    this.karma = 0; // KR (Karma Retribution) pool
    this.karmaTimer = 0;
    this.invulnTimer = 0;
    this.invulnDuration = 30; // frames
    this.isDead = false;

    // Parry Mechanic (Phase 2 & 3)
    this.parryActive = false;
    this.parryTimer = 0;
    this.parryCooldown = 0;
    this.parrySuccessTimer = 0;

    // Death animation state
    this.deathState = 0; // 0=alive, 1=shattering, 2=pieces
    this.shatterPieces = [];

    // Trail / effects
    this.trail = [];
  }

  reset(fullHeal = true) {
    this.x = 320;
    this.y = 300;
    this.vx = 0;
    this.vy = 0;
    this.mode = 'red';
    this.gravityDir = 'down';
    this.angle = 0;
    this.isGrounded = false;
    if (fullHeal) {
      this.hp = this.maxHp;
      this.karma = 0;
    }
    this.invulnTimer = 0;
    this.isDead = false;
    this.deathState = 0;
    this.shatterPieces = [];
    this.parryActive = false;
    this.parryTimer = 0;
    this.parryCooldown = 0;
  }

  // Slam blue soul into a specific wall with sound & screen shake
  slam(dir, box) {
    this.mode = 'blue';
    this.gravityDir = dir;
    window.audio.playSfx('grab', 0.8);
    window.audio.playSfx('throw', 0.8);

    const slamSpeed = 14;
    switch (dir) {
      case 'down':
        this.angle = 0;
        this.vy = slamSpeed;
        break;
      case 'up':
        this.angle = Math.PI;
        this.vy = -slamSpeed;
        break;
      case 'left':
        this.angle = Math.PI * 0.5;
        this.vx = -slamSpeed;
        break;
      case 'right':
        this.angle = Math.PI * 1.5;
        this.vx = slamSpeed;
        break;
    }
  }

  triggerParry() {
    if (this.parryCooldown > 0 || this.isDead) return;
    this.parryActive = true;
    this.parryTimer = 10; // ~160ms window
    this.parryCooldown = 25; // cooldown between parry attempts
    window.audio.playSfx('warning', 0.35, 1.4);
  }

  update(keys, box) {
    if (this.isDead) {
      this.updateDeath();
      return;
    }

    // Update timers
    if (this.invulnTimer > 0) this.invulnTimer--;
    if (this.parryTimer > 0) {
      this.parryTimer--;
      if (this.parryTimer <= 0) this.parryActive = false;
    }
    if (this.parryCooldown > 0) this.parryCooldown--;
    if (this.parrySuccessTimer > 0) this.parrySuccessTimer--;

    // Karma drain over time
    this.updateKarma();

    // Speed calculation
    const isFocus = keys['KeyX'] || keys['ShiftLeft'] || keys['ShiftRight'];
    const curSpeed = isFocus ? this.focusSpeed : this.baseSpeed;

    if (this.mode === 'red') {
      // 8-directional movement
      let dx = 0;
      let dy = 0;
      if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
      if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
      if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
      if (keys['ArrowDown'] || keys['KeyS']) dy += 1;

      // Normalize diagonal
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      this.x += dx * curSpeed;
      this.y += dy * curSpeed;
      this.angle = 0;

    } else if (this.mode === 'blue') {
      // Platforming Blue Soul
      this.updateBlueSoul(keys, curSpeed, box);
    }

    // Keep within Battle Box
    this.constrainToBox(box);

    // Add trail for blue soul or focus mode
    if (Math.random() < 0.35 || isFocus) {
      this.trail.push({ x: this.x, y: this.y, alpha: 0.5, color: this.mode === 'blue' ? '#00d4ff' : '#ff2222' });
    }
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= 0.05;
      if (this.trail[i].alpha <= 0) this.trail.splice(i, 1);
    }
  }

  updateBlueSoul(keys, curSpeed, box) {
    const jumpHeld = keys['ArrowUp'] || keys['KeyW'] || keys['KeyZ'] || keys['Space'];

    if (this.gravityDir === 'down') {
      // Horizontal control
      if (keys['ArrowLeft'] || keys['KeyA']) this.x -= curSpeed;
      if (keys['ArrowRight'] || keys['KeyD']) this.x += curSpeed;

      // Apply Gravity
      this.vy += this.gravity;
      if (this.vy > 9) this.vy = 9;
      this.y += this.vy;

      // Jump
      if (this.isGrounded && jumpHeld && this.canJump) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.canJump = false;
      }

      // Variable jump height
      if (!jumpHeld && this.vy < 0) {
        this.vy *= this.jumpReleaseCut;
      }

      if (!jumpHeld) this.canJump = true;

    } else if (this.gravityDir === 'up') {
      if (keys['ArrowLeft'] || keys['KeyA']) this.x -= curSpeed;
      if (keys['ArrowRight'] || keys['KeyD']) this.x += curSpeed;

      this.vy -= this.gravity;
      if (this.vy < -9) this.vy = -9;
      this.y += this.vy;

      const downHeld = keys['ArrowDown'] || keys['KeyS'];
      if (this.isGrounded && downHeld && this.canJump) {
        this.vy = -this.jumpForce;
        this.isGrounded = false;
        this.canJump = false;
      }
      if (!downHeld && this.vy > 0) this.vy *= this.jumpReleaseCut;
      if (!downHeld) this.canJump = true;

    } else if (this.gravityDir === 'left') {
      // Vertical control
      if (keys['ArrowUp'] || keys['KeyW']) this.y -= curSpeed;
      if (keys['ArrowDown'] || keys['KeyS']) this.y += curSpeed;

      this.vx -= this.gravity;
      if (this.vx < -9) this.vx = -9;
      this.x += this.vx;

      const rightHeld = keys['ArrowRight'] || keys['KeyD'];
      if (this.isGrounded && rightHeld && this.canJump) {
        this.vx = -this.jumpForce;
        this.isGrounded = false;
        this.canJump = false;
      }
      if (!rightHeld && this.vx > 0) this.vx *= this.jumpReleaseCut;
      if (!rightHeld) this.canJump = true;

    } else if (this.gravityDir === 'right') {
      if (keys['ArrowUp'] || keys['KeyW']) this.y -= curSpeed;
      if (keys['ArrowDown'] || keys['KeyS']) this.y += curSpeed;

      this.vx += this.gravity;
      if (this.vx > 9) this.vx = 9;
      this.x += this.vx;

      const leftHeld = keys['ArrowLeft'] || keys['KeyA'];
      if (this.isGrounded && leftHeld && this.canJump) {
        this.vx = this.jumpForce;
        this.isGrounded = false;
        this.canJump = false;
      }
      if (!leftHeld && this.vx < 0) this.vx *= this.jumpReleaseCut;
      if (!leftHeld) this.canJump = true;
    }
  }

  constrainToBox(box) {
    if (!box) return;
    const half = this.size / 2;
    const minX = box.x - box.w / 2 + half + 4;
    const maxX = box.x + box.w / 2 - half - 4;
    const minY = box.y - box.h / 2 + half + 4;
    const maxY = box.y + box.h / 2 - half - 4;

    this.isGrounded = false;

    // Floor collision
    if (this.gravityDir === 'down' && this.y >= maxY) {
      if (this.vy > 4) window.audio.playSfx('impact', 0.65);
      this.y = maxY;
      this.vy = 0;
      this.isGrounded = true;
    } else if (this.gravityDir === 'up' && this.y <= minY) {
      if (this.vy < -4) window.audio.playSfx('impact', 0.65);
      this.y = minY;
      this.vy = 0;
      this.isGrounded = true;
    } else if (this.gravityDir === 'left' && this.x <= minX) {
      if (this.vx < -4) window.audio.playSfx('impact', 0.65);
      this.x = minX;
      this.vx = 0;
      this.isGrounded = true;
    } else if (this.gravityDir === 'right' && this.x >= maxX) {
      if (this.vx > 4) window.audio.playSfx('impact', 0.65);
      this.x = maxX;
      this.vx = 0;
      this.isGrounded = true;
    }

    // Clamp inside boundaries
    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));
  }

  takeDamage(amount = 1, isKarma = true, canBeParried = false) {
    if (this.isDead) return false;

    // Check Parry
    if (canBeParried && this.parryActive) {
      this.parryActive = false;
      this.parrySuccessTimer = 18;
      this.invulnTimer = 25;
      window.audio.playSfx('blocked', 1.0);
      return 'parried';
    }

    if (this.invulnTimer > 0) return false;

    // In Undertale/Last Breath: Sans hits for 1 HP constantly + fills the KR bar
    if (isKarma) {
      this.hp = Math.max(1, this.hp - 1);
      this.karma = Math.min(40, this.karma + amount);
      this.invulnTimer = 2; // Fast damage tick
    } else {
      this.hp = Math.max(0, this.hp - amount);
      this.invulnTimer = this.invulnDuration;
    }

    window.audio.playSfx('damage', 0.8);

    if (this.hp <= 0) {
      this.die();
    }
    return true;
  }

  updateKarma() {
    if (this.karma <= 0) return;
    this.karmaTimer++;
    if (this.karmaTimer >= 4) {
      this.karmaTimer = 0;
      this.karma--;
      this.hp = Math.max(1, this.hp - 1);
      if (this.hp <= 1 && this.karma > 0) {
        this.hp = 0;
        this.die();
      }
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.karma = Math.max(0, this.karma - Math.floor(amount / 2));
    window.audio.playSfx('heal', 0.85);
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.deathState = 1;
    window.audio.stopBgm();
    window.audio.playSfx('broken0', 1.0);

    // Prepare shatter pieces
    this.shatterPieces = [];
    setTimeout(() => {
      this.deathState = 2;
      window.audio.playSfx('broken1', 1.0);
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 4;
        this.shatterPieces.push({
          x: this.x,
          y: this.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          rot: 0,
          rotSpd: (Math.random() - 0.5) * 0.4
        });
      }
    }, 900);
  }

  updateDeath() {
    if (this.deathState === 2) {
      for (const p of this.shatterPieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.rot += p.rotSpd;
      }
    }
  }

  draw(ctx) {
    if (this.isDead) {
      this.drawDeath(ctx);
      return;
    }

    // Flicker if invulnerable
    if (this.invulnTimer > 0 && Math.floor(this.invulnTimer / 2) % 2 === 0) {
      return;
    }

    // Draw motion trail
    for (const t of this.trail) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.size / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Parry Shield Effect
    if (this.parryActive) {
      ctx.save();
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.parrySuccessTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y, (18 - this.parrySuccessTimer) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Soul Sprite
    const spriteName = this.mode === 'blue' ? 'soul_blue' : 'soul_red';
    window.sprites.draw(ctx, spriteName, this.x, this.y, {
      rotation: this.angle,
      scale: 1.0
    });
  }

  drawDeath(ctx) {
    if (this.deathState === 1) {
      // Soul broken in half
      window.sprites.draw(ctx, 'soul_break', this.x, this.y);
    } else if (this.deathState === 2) {
      // Soul pieces scattering
      for (const p of this.shatterPieces) {
        window.sprites.draw(ctx, 'soul_piece', p.x, p.y, { rotation: p.rot });
      }
    }
  }
}

window.Player = Player;
