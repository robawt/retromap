/* ═══════════════════════════════════════════════════════
   RetroMap — Sound Manager
   ═══════════════════════════════════════════════════════ */

const SoundManager = {
  enabled: true,
  sounds: {},

  /**
   * Register a sound
   */
  register(name, url) {
    this.sounds[name] = new Audio(url);
  },

  /**
   * Play a registered sound
   */
  play(name) {
    if (!this.enabled) return;
    const sound = this.sounds[name];
    if (!sound) return;
    sound.currentTime = 0;
    sound.volume = 0.5;
    sound.play().catch(() => {}); // ignore autoplay errors
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
    this.register('open', 'assets/audio/sfx/windows-xp-open.wav');
    this.register('close', 'assets/audio/sfx/windows-xp-close.wav');
    this.register('error', 'assets/audio/sfx/windows-xp-error.wav');
    this.register('notify', 'assets/audio/sfx/windows-xp-notify.wav');
    this.register('start', 'assets/audio/sfx/windows-xp-start.wav');
    this.register('shutdown', 'assets/audio/sfx/windows-xp-shutdown.wav');
  }
};
