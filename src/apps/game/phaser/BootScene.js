/* ═══════════════════════════════════════════════════════
   RetroMap — Phaser Boot Scene (Cute Farm Sprites)
   Loads sprite pack from Cute_Fantasy_Free assets
   ═══════════════════════════════════════════════════════ */

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#87CEEB');

    // Loading UI
    this.add.text(w / 2, h / 2 - 60, '🌾 RetroMap', {
      fontFamily: 'Tahoma', fontSize: '20px', color: '#5B8C5A', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 - 36, 'Planting crops...', {
      fontFamily: 'Tahoma', fontSize: '11px', color: '#8B7B6B'
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0xD8D0C8, 1);
    barBg.fillRect(w / 2 - 100, h / 2 + 10, 200, 16);

    const barFill = this.add.graphics();
    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0x7BA87B, 1);
      barFill.fillRect(w / 2 - 99, h / 2 + 11, 198 * value, 14);
    });

    // ─── Load all sprite pack assets ───

    // Player sprite sheet (48×64 per frame, 4 cols × 5 rows = 20 frames)
    this.load.spritesheet('player-sheet', 'assets/game/Player.png', {
      frameWidth: 48, frameHeight: 64
    });
    // Tiles (16×16)
    this.load.image('tile-grass', 'assets/game/Grass_Middle.png');
    this.load.image('tile-water', 'assets/game/Water_Middle.png');
    this.load.image('tile-path', 'assets/game/Path_Middle.png');

    // Larger tiles (need slicing)
    this.load.image('farmland', 'assets/game/FarmLand_Tile.png');
    this.load.image('water-tile', 'assets/game/Water_Tile.png');
    this.load.image('path-tile', 'assets/game/Path_Tile.png');
    this.load.image('beach-tile', 'assets/game/Beach_Tile.png');
    this.load.image('cliff-tile', 'assets/game/Cliff_Tile.png');

    // Decorations
    this.load.image('tree-oak', 'assets/game/Oak_Tree.png');
    this.load.image('chest', 'assets/game/Chest.png');
    this.load.image('house', 'assets/game/House_1_Wood_Base_Blue.png');
    this.load.image('fences', 'assets/game/Fences.png');
    this.load.image('outdoor-decor', 'assets/game/Outdoor_Decor_Free.png');

    // Animals
    this.load.image('animal-chicken', 'assets/game/Chicken.png');
    this.load.image('animal-cow', 'assets/game/Cow.png');
    this.load.image('animal-pig', 'assets/game/Pig.png');
    this.load.image('animal-sheep', 'assets/game/Sheep.png');

  }

  create() {
    // ─── Generate animations from player sprite sheet ───
    // Sheet layout: 48×64 frames, 4 cols × 5 rows = 20 frames
    // Row 0 (frames 0-3): Walk Down
    // Row 1 (frames 4-7): Walk Left
    // Row 2 (frames 8-11): Walk Right
    // Row 3 (frames 12-15): Walk Up
    // Row 4 (frames 16-19): Idle/Static

    this._createAnim('walk-down', 'player-sheet', [0, 1, 0, 2], 8);
    this._createAnim('walk-left', 'player-sheet', [4, 5, 4, 6], 8);
    this._createAnim('walk-right', 'player-sheet', [8, 9, 8, 10], 8);
    this._createAnim('walk-up', 'player-sheet', [12, 13, 12, 14], 8);

    // Idle frames (static pose for each direction)
    this._createAnim('idle-down', 'player-sheet', [16], 1);
    this._createAnim('idle-left', 'player-sheet', [17], 1);
    this._createAnim('idle-right', 'player-sheet', [18], 1);
    this._createAnim('idle-up', 'player-sheet', [19], 1);

    // ─── Slice larger tiles into sub-textures ───
    this._sliceTileSheet('farmland', 48, 48, 'farmland-');
    this._sliceTileSheet('water-tile', 48, 48, 'water-tile-');
    this._sliceTileSheet('path-tile', 48, 48, 'path-tile-');
    this._sliceTileSheet('cliff-tile', 48, 48, 'cliff-tile-');
    this._sliceTileSheet('beach-tile', 48, 48, 'beach-tile-');
    this._sliceTileSheet('fences', 32, 32, 'fence-');
    this._sliceTileSheet('outdoor-decor', 16, 16, 'decor-');

    // Generate minimap dots and other UI textures
    this._genUI();

    this.scene.start('GameScene');
  }

  /* ─── Helper: create animation ─── */
  _createAnim(key, sheet, frames, rate) {
    if (this.anims.exists(key)) return;
    const frameObjs = frames.map(f => ({ key: sheet, frame: f }));
    this.anims.create({
      key,
      frames: frameObjs,
      frameRate: rate,
      repeat: key.startsWith('idle') ? 0 : -1
    });
  }

  /* ─── Helper: slice a tile sheet into individual textures ─── */
  _sliceTileSheet(key, fw, fh, prefix) {
    const tex = this.textures.get(key);
    if (!tex || !tex.source || !tex.source[0]) return;
    const srcW = tex.source[0].width;
    const srcH = tex.source[0].height;
    const cols = Math.floor(srcW / fw);
    const rows = Math.floor(srcH / fh);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const name = prefix + idx;
        this._extractFrame(key, c * fw, r * fh, fw, fh, name);
        idx++;
      }
    }
  }

  /* ─── Helper: extract a frame from a texture and create a new texture ─── */
  _extractFrame(sourceKey, sx, sy, sw, sh, destKey) {
    const srcTex = this.textures.get(sourceKey);
    if (!srcTex || !srcTex.source || !srcTex.source[0]) return;
    const srcCanvas = srcTex.source[0].image;
    if (!srcCanvas) return;

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(srcCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
    this.textures.addCanvas(destKey, canvas);
  }

  /* ─── UI textures ─── */
  _genUI() {
    // Minimap dots
    const mmCanvas = document.createElement('canvas');
    mmCanvas.width = 3; mmCanvas.height = 3;
    const ctx = mmCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 3, 3);
    this.textures.addCanvas('minimap-dot', mmCanvas);

    const npcCanvas = document.createElement('canvas');
    npcCanvas.width = 3; npcCanvas.height = 3;
    const nctx = npcCanvas.getContext('2d');
    nctx.fillStyle = '#7BA87B';
    nctx.fillRect(0, 0, 3, 3);
    this.textures.addCanvas('minimap-npc', npcCanvas);

    // Fog of war reveal texture
    const fogSize = 160;
    const fogCanvas = document.createElement('canvas');
    fogCanvas.width = fogSize;
    fogCanvas.height = fogSize;
    const fogCtx = fogCanvas.getContext('2d');
    const gradient = fogCtx.createRadialGradient(
      fogSize / 2, fogSize / 2, 0,
      fogSize / 2, fogSize / 2, fogSize / 2
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.3, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.25)');
    gradient.addColorStop(0.75, 'rgba(0,0,0,0.55)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    fogCtx.fillStyle = gradient;
    fogCtx.fillRect(0, 0, fogSize, fogSize);
    this.textures.addCanvas('fog-reveal', fogCanvas);
  }
}
