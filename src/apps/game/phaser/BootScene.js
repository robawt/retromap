/* ═══════════════════════════════════════════════════════
   RetroMap — Phaser Boot Scene (Cute Fantasy Sprites)
   Loads sprite pack with CORRECT frame sizes & animations
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
    this.add.text(Math.max(w / 2, 200), h / 2 - 60, '🌾 RetroMap Farm', {
      fontFamily: 'Tahoma', fontSize: '18px', color: '#5B8C5A', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(Math.max(w / 2, 200), h / 2 - 36, 'Setting up the farm...', {
      fontFamily: 'Tahoma', fontSize: '11px', color: '#8B7B6B'
    }).setOrigin(0.5);
    const barBg = this.add.graphics();
    barBg.fillStyle(0xD8D0C8, 1);
    barBg.fillRect(Math.max(w / 2 - 100, 100), h / 2 + 10, 200, 16);
    const barFill = this.add.graphics();
    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0x7BA87B, 1);
      barFill.fillRect(Math.max(w / 2 - 99, 101), h / 2 + 11, 198 * value, 14);
    });

    // ─── PLAYER (192×320, 48×64 frames, 4×5=20 frames) ───
    this.load.spritesheet('player-sheet', 'assets/game/Player.png', {
      frameWidth: 48, frameHeight: 64
    });
    // Player Actions (96×576, 48×48 frames, 2×12=24 frames)
    this.load.spritesheet('player-actions', 'assets/game/Player_Actions.png', {
      frameWidth: 48, frameHeight: 48
    });

    // ─── TILES ───
    // Basic 16×16 tiles
    this.load.image('tile-grass', 'assets/game/Grass_Middle.png');
    this.load.image('tile-water', 'assets/game/Water_Middle.png');
    this.load.image('tile-path', 'assets/game/Path_Middle.png');
    // Larger tile sheets (need slicing at 16×16)
    this.load.image('farmland', 'assets/game/FarmLand_Tile.png');     // 48×48 → 3×3=9
    this.load.image('water-tile', 'assets/game/Water_Tile.png');     // 48×96 → 3×6=18
    this.load.image('path-tile', 'assets/game/Path_Tile.png');       // 48×96 → 3×6=18
    this.load.image('beach-tile', 'assets/game/Beach_Tile.png');     // 80×48 → 5×3=15
    this.load.image('cliff-tile', 'assets/game/Cliff_Tile.png');     // 48×96 → 3×6=18

    // ─── STRUCTURES ───
    this.load.image('house', 'assets/game/House_1_Wood_Base_Blue.png');  // 96×128
    this.load.image('chest', 'assets/game/Chest.png');                   // 16×16

    // ─── TREES ───
    this.load.image('tree-oak', 'assets/game/Oak_Tree.png');            // 64×80 single
    this.load.spritesheet('tree-oak-small', 'assets/game/Oak_Tree_Small.png', {
      frameWidth: 48, frameHeight: 48                                   // 96×48 → 2×1=2 frames
    });

    // ─── FENCES (64×64, 32×32 frames, 2×2=4) ───
    this.load.image('fences', 'assets/game/Fences.png');

    // ─── OUTDOOR DECOR (112×192, sliced at 16×16) ───
    this.load.image('outdoor-decor', 'assets/game/Outdoor_Decor_Free.png');

    // ─── BRIDGE (144×64, sliced into 48×64 segments) ───
    this.load.image('bridge', 'assets/game/Bridge_Wood.png');

    // ─── ANIMALS (64×64 each, 32×32 frames, 2×2=4 frames each) ───
    this.load.spritesheet('animal-chicken', 'assets/game/Chicken.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('animal-cow', 'assets/game/Cow.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('animal-pig', 'assets/game/Pig.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('animal-sheep', 'assets/game/Sheep.png', { frameWidth: 32, frameHeight: 32 });

    // ─── ENEMIES / DECOR ───
    this.load.spritesheet('skeleton', 'assets/game/Skeleton.png', {   // 192×320, 48×64 frames
      frameWidth: 48, frameHeight: 64
    });
    this.load.spritesheet('slime-green', 'assets/game/Slime_Green.png', { // 512×192, 32×96 frames
      frameWidth: 32, frameHeight: 96
    });
  }

  create() {
    // ─── Slice tile sheets into individual 16×16 textures ───
    this._sliceTileSheet('farmland', 16, 16, 'farmland-');       // 9 tiles
    this._sliceTileSheet('water-tile', 16, 16, 'water-tile-');   // 18 tiles
    this._sliceTileSheet('path-tile', 16, 16, 'path-tile-');     // 18 tiles
    this._sliceTileSheet('beach-tile', 16, 16, 'beach-tile-');   // 15 tiles
    this._sliceTileSheet('cliff-tile', 16, 16, 'cliff-tile-');   // 18 tiles
    this._sliceTileSheet('fences', 32, 32, 'fence-');            // 4 fence pieces
    this._sliceTileSheet('outdoor-decor', 16, 16, 'decor-');     // 84 decor items
    this._sliceTileSheet('bridge', 48, 64, 'bridge-');            // 3 bridge segments

    // ─── Create Player Animations ───
    this._createAnim('player-walk-down',  'player-sheet', [0, 1, 2, 3], 8);
    this._createAnim('player-walk-left',  'player-sheet', [4, 5, 6, 7], 8);
    this._createAnim('player-walk-right', 'player-sheet', [8, 9, 10, 11], 8);
    this._createAnim('player-walk-up',   'player-sheet', [12, 13, 14, 15], 8);
    // Idle: use standing frame from each row (frame 1 is standing, frame 17 is idle-left, etc.)
    this.anims.create({ key: 'player-idle', frames: [{ key: 'player-sheet', frame: 1 }], frameRate: 1, repeat: 0 });

    // ─── Create Animal Animations (4 frames each) ───
    for (const animal of ['chicken', 'cow', 'pig', 'sheep']) {
      const key = 'animal-' + animal;
      // Idle animation: gentle bobbing using frames 0-2-0-1
      this._createAnim(key + '-idle', key, [0, 1, 2, 1], 4);
    }

    // ─── Create Bridge segments ───
    // Frame 0: left segment, Frame 1: middle, Frame 2: right
    // Just use them as static images, no animation needed

    // ─── Generate UI textures ───
    this._genUI();

    // Start the game
    this.scene.start('GameScene');
  }

  /* ─── Helper: create animation ─── */
  _createAnim(key, sheet, frames, rate) {
    if (this.anims.exists(key)) return;
    this.anims.create({
      key,
      frames: frames.map(f => ({ key: sheet, frame: f })),
      frameRate: rate,
      repeat: -1
    });
  }

  /* ─── Helper: slice a tile sheet into individual textures ─── */
  _sliceTileSheet(key, fw, fh, prefix) {
    const tex = this.textures.get(key);
    if (!tex || !tex.source || !tex.source[0]) return;
    const srcCanvas = tex.source[0].image;
    if (!srcCanvas) return;
    const srcW = tex.source[0].width;
    const srcH = tex.source[0].height;
    const cols = Math.floor(srcW / fw);
    const rows = Math.floor(srcH / fh);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const canvas = document.createElement('canvas');
        canvas.width = fw; canvas.height = fh;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(srcCanvas, c * fw, r * fh, fw, fh, 0, 0, fw, fh);
        this.textures.addCanvas(prefix + idx, canvas);
        idx++;
      }
    }
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
  }
}
