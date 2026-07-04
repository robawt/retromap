/* ═══════════════════════════════════════════════════════
   RetroMap — Game App (Phaser.js Launcher)
   ═══════════════════════════════════════════════════════ */

const GameApp = {
  title: 'Retro World',
  defaultWidth: 640,
  defaultHeight: 480,
  minWidth: 400,
  minHeight: 350,
  resizable: false, // Phaser canvas doesn't auto-resize yet

  _container: null,
  _game: null,
  _canvasContainer: null,

  /* ─── Render ─── */
  render(container) {
    this._container = container;
    container.className = 'game-app-container';
    container.style.padding = '0';
    container.style.overflow = 'hidden';

    // Create a wrapper div for Phaser canvas
    this._canvasContainer = createElement('div', {
      className: 'game-canvas-wrapper',
      id: 'game-canvas-wrapper-' + generateId().slice(0, 8)
    });
    container.appendChild(this._canvasContainer);

    // Small delay to let the DOM settle
    setTimeout(() => {
      this._mountPhaser();
    }, 50);
  },

  /* ─── Mount Phaser ─── */
  _mountPhaser() {
    if (this._game) return;

    // Guard against CDN failure
    if (typeof Phaser === 'undefined') {
      this._container.innerHTML = `
        <div class="xp-loading" style="text-align:center;padding:32px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Game Engine Unavailable</div>
          <p>Could not load the game engine. Check your internet connection and try again.</p>
        </div>
      `;
      return;
    }

    const wrapper = this._canvasContainer;
    const rect = wrapper.getBoundingClientRect();

    const config = {
      type: Phaser.AUTO,
      width: Math.max(400, Math.floor(rect.width)),
      height: Math.max(300, Math.floor(rect.height)),
      parent: wrapper.id,
      backgroundColor: '#4A7C3F',
      pixelArt: true,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER
      },
      scene: [BootScene, GameScene]
    };

    try {
      this._game = new Phaser.Game(config);
    } catch (e) {
      this._container.innerHTML = `
        <div class="xp-loading" style="text-align:center;padding:32px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Game Error</div>
          <p>Failed to start the game: ${e.message}</p>
        </div>
      `;
    }
  },

  /* ─── Handle window resize ─── */
  resize(width, height) {
    if (this._game) {
      this._game.scale.resize(width, height);
    }
  },

  /* ─── Cleanup ─── */
  destroy() {
    if (this._game) {
      this._game.destroy(true);
      this._game = null;
    }
    this._canvasContainer = null;
    this._container = null;
  }
};
