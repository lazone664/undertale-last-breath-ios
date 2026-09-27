/**
 * UNDERTALE: LAST BREATH - AUDIO ENGINE
 * Gestionnaire Web Audio API pour la musique et les effets sonores
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgmVolume = 0.7;
    this.sfxVolume = 0.85;
    this.isMuted = false;
    
    // Audio elements & buffers
    this.currentBgm = null;
    this.currentBgmName = '';
    this.sfxBuffers = {};
    this.bgmAudios = {};
    
    // SFX manifest mapping
    this.sfxFiles = {
      sans: 'snd_sans.ogg',
      blasted: 'snd_blasted.ogg',
      blastedbig: 'snd_blastedbig.ogg',
      blasting: 'snd_blasting.ogg',
      bonewall: 'snd_bonewall.ogg',
      grab: 'snd_grab.ogg',
      throw: 'snd_throw.ogg',
      impact: 'snd_impact.ogg',
      hit: 'snd_hit.ogg',
      damage: 'snd_damage.ogg',
      slash: 'snd_slash.ogg',
      heal: 'snd_heal.ogg',
      warning: 'snd_warning.ogg',
      eyeflash: 'snd_eyeflash.ogg',
      blocked: 'snd_blocked.ogg',
      broken0: 'snd_broken0.ogg',
      broken1: 'snd_broken1.ogg',
      menu: 'snd_menu.ogg',
      confirm: 'snd_confirm.ogg',
      cancel: 'snd_cancel.ogg',
      gaster0: 'snd_gaster_0.ogg',
      gaster1: 'snd_gaster_1.ogg',
      gaster2: 'snd_gaster_2.ogg'
    };

    // BGM manifest mapping
    this.bgmFiles = {
      menu: 'bgm_menu.ogg',
      phase1: 'bgm_lbp1.ogg',
      phase2: 'bgm_lbp2.ogg',
      phase3: 'bgm_lbp3.ogg',
      choice: 'bgm_Choice.ogg'
    };

    this.initialized = false;
    this.pendingBgm = null;

    // Detect format support for iOS/Safari
    const testAudio = document.createElement('audio');
    this.canPlayOgg = !!(testAudio.canPlayType && testAudio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Setup global iOS/mobile gesture unlockers
    const unlockHandler = () => {
      this.unlock();
    };
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('touchend',   unlockHandler, { passive: true });
    window.addEventListener('click',      unlockHandler, { passive: true });
    window.addEventListener('keydown',    unlockHandler, { passive: true });

    // Handle backgrounding on mobile/iOS
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.currentBgm && !this.currentBgm.paused) {
          this.wasPlayingBeforeHide = true;
          this.currentBgm.pause();
        }
      } else {
        if (this.wasPlayingBeforeHide && this.currentBgm && !this.isMuted) {
          this.currentBgm.play().catch(() => {});
          this.wasPlayingBeforeHide = false;
        }
      }
    });
  }

  // Resolve appropriate file format for iOS / Safari
  resolvePath(file) {
    if (!this.canPlayOgg || this.isIOS) {
      if (file.endsWith('.ogg')) {
        return file.replace(/\.ogg$/, '.mp3');
      }
    }
    return file;
  }

  init() {
    if (this.initialized && this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio Context not supported:', e);
    }
  }

  unlock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    try {
      const dummy = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = dummy;
      src.connect(this.ctx.destination);
      src.start(0);
    } catch (e) {}

    if (this.pendingBgm) {
      const pb = this.pendingBgm;
      this.pendingBgm = null;
      this.playBgm(pb.trackName, pb.loop);
    }
  }

  // Preload sound effects using AudioContext decoding
  async loadSfx(name, url) {
    if (!this.ctx) return;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return;
      const arrayBuf = await resp.arrayBuffer();
      this.sfxBuffers[name] = await this.ctx.decodeAudioData(arrayBuf);
    } catch (e) {
      console.warn(`Could not preload SFX [${name}]:`, e);
    }
  }

  // Preload all common sound effects
  async preloadAll() {
    this.init();
    const basePath = 'assets/audio/';
    const promises = [];
    for (const [key, file] of Object.entries(this.sfxFiles)) {
      const resolved = this.resolvePath(file);
      promises.push(this.loadSfx(key, basePath + resolved));
    }
    await Promise.allSettled(promises);
  }

  playSfx(name, volumeScale = 1.0, pitch = 1.0) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const buffer = this.sfxBuffers[name];
    if (buffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = pitch;

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = this.sfxVolume * volumeScale;

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (e) {
        console.warn(`Error playing buffer SFX [${name}]:`, e);
      }
    }

    // Fallback using standard Audio element if buffer not decoded
    try {
      const rawFile = this.sfxFiles[name];
      if (rawFile) {
        const filename = this.resolvePath(rawFile);
        const a = new Audio('assets/audio/' + filename);
        a.volume = Math.max(0, Math.min(1, this.sfxVolume * volumeScale));
        a.playbackRate = pitch;
        a.play().catch(() => {});
      }
    } catch (err) {}
  }

  // Play text speech blip with slight randomized pitch
  playSpeechBlip() {
    const pitch = 0.95 + Math.random() * 0.1;
    this.playSfx('sans', 0.6, pitch);
  }

  playBgm(trackName, loop = true) {
    if (!this.bgmFiles[trackName]) return;
    if (this.currentBgmName === trackName && this.currentBgm && !this.currentBgm.paused) {
      return; // Already playing
    }

    this.stopBgm();
    this.unlock();

    const filename = this.resolvePath(this.bgmFiles[trackName]);
    const path = 'assets/audio/' + filename;
    let audio = this.bgmAudios[trackName];
    if (!audio) {
      audio = new Audio(path);
      audio.loop = loop;
      audio.preload = 'auto';
      this.bgmAudios[trackName] = audio;
    }

    audio.volume = this.isMuted ? 0 : this.bgmVolume;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        // Autoplay prevented by iOS / browser policy; queue to play on first user touch
        this.pendingBgm = { trackName, loop };
      });
    }

    this.currentBgm = audio;
    this.currentBgmName = trackName;
  }

  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
      this.currentBgm = null;
      this.currentBgmName = '';
    }
    this.pendingBgm = null;
  }

  pauseBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
    }
  }

  resumeBgm() {
    if (this.currentBgm && !this.isMuted) {
      this.currentBgm.play().catch(() => {});
    }
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.currentBgm && !this.isMuted) {
      this.currentBgm.volume = this.bgmVolume;
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.currentBgm) {
      this.currentBgm.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    return this.isMuted;
  }
}

// Global audio instance
window.audio = new AudioManager();
