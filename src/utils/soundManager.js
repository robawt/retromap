/* ═══════════════════════════════════════════════════════
   RetroMap — Sound Manager
   ═══════════════════════════════════════════════════════ */

const SoundManager = {
  enabled: true,
  _ctx: null,
  _sounds: {},

  /**
   * Get or create the AudioContext
   */
  _getContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  },

  /**
   * Register a sound
   */
  register(name, url) {
    const audio = new Audio(url);
    audio.volume = 0.5;
    this._sounds[name] = audio;
  },

  /**
   * Play a registered sound (with Web Audio fallback if file missing)
   */
  play(name) {
    if (!this.enabled) return;
    const sound = this._sounds[name];
    if (!sound) {
      this._playBeep(name);
      return;
    }
    try {
      sound.currentTime = 0;
      sound.play().catch(() => this._playBeep(name));
    } catch {
      this._playBeep(name);
    }
  },

  /**
   * Generate a retro beep using Web Audio API
   */
  _playBeep(name) {
    try {
      const ctx = this._getContext();
      // Resume if suspended (browser autoplay policy — can be called from non-gesture contexts)
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Different tones for different sounds
      switch (name) {
        case 'notify':
          osc.frequency.value = 880;
          gain.gain.value = 0.15;
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.stop(ctx.currentTime + 0.15);
          break;
        case 'start':
          osc.frequency.value = 660;
          gain.gain.value = 0.1;
          osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.2);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.stop(ctx.currentTime + 0.3);
          break;
        case 'error':
          osc.type = 'sawtooth';
          osc.frequency.value = 200;
          gain.gain.value = 0.1;
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.stop(ctx.currentTime + 0.4);
          break;
        case 'open':
          osc.frequency.value = 440;
          gain.gain.value = 0.08;
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.stop(ctx.currentTime + 0.08);
          break;
        case 'close':
          osc.frequency.value = 330;
          gain.gain.value = 0.08;
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.stop(ctx.currentTime + 0.1);
          break;
        case 'shutdown':
          osc.frequency.value = 500;
          gain.gain.value = 0.1;
          osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.stop(ctx.currentTime + 0.6);
          break;
        default:
          osc.frequency.value = 520;
          gain.gain.value = 0.1;
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // Web Audio not available — silently ignore
    }
  },

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  /**
   * Register all default XP sounds
   */
  registerDefaults() {
    // Sound effects generated via Web Audio API fallback (_playBeep)
    // No file-based registrations needed — the beep system handles all sounds
  }
};
