/* ═══════════════════════════════════════════════════════
   RetroMap — Phaser Boot Scene
   ═══════════════════════════════════════════════════════ */

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#3A6EA5');

    this.add.text(width / 2, height / 2 - 40, 'RetroMap', {
      fontFamily: 'Tahoma', fontSize: '18px', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 16, 'Loading world...', {
      fontFamily: 'Tahoma', fontSize: '11px', color: '#FFFFFF'
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0xFFFFFF, 1);
    barBg.fillRoundedRect(width / 2 - 100, height / 2 + 10, 200, 16, 0);

    const barFill = this.add.graphics();
    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0x3A6EA5, 1);
      barFill.fillRoundedRect(width / 2 - 99, height / 2 + 11, 198 * value, 14, 0);
    });

    this._generateTextures();
  }

  /* ─── Generate all placeholder textures ─── */
  _generateTextures() {
    this._genPlayerSprites();
    this._genTiles();
    this._genObjects();
  }

  /* ─── Player sprites: 4 directions x 3 frames ─── */
  _genPlayerSprites() {
    const frameW = 16, frameH = 24;
    const dirs = ['down', 'left', 'right', 'up'];

    for (let di = 0; di < dirs.length; di++) {
      const dir = dirs[di];

      // Skin/hair offset for side/back views
      const isSide = (dir === 'left' || dir === 'right');
      const isUp = (dir === 'up');
      const hairColor = 0x3A6EA5;
      const skinColor = 0xFFD5B4;
      const bodyColor = 0x2563EB;

      for (let frame = 0; frame < 3; frame++) {
        const gfx = this.make.graphics({ x: 0, y: 0, add: false });
        const legOffset = (frame === 1 ? 1 : (frame === 2 ? -1 : 0));

        if (isUp) {
          // Back view: hair on top, body below (no face visible)
          gfx.fillStyle(hairColor, 1);
          gfx.fillRect(3, 0, 10, 10);
          gfx.fillStyle(bodyColor, 1);
          gfx.fillRect(3, 8, 10, 10);
          // Legs
          gfx.fillStyle(0x1A3F8C, 1);
          gfx.fillRect(4, 18, 3, 6 + legOffset);
          gfx.fillRect(9, 18, 3, 6 - legOffset);
        } else if (isSide) {
          // Side view
          const flipX = (dir === 'left') ? 0 : 0;
          gfx.fillStyle(hairColor, 1);
          gfx.fillRect(2, 0, 12, 8);
          gfx.fillStyle(skinColor, 1);
          gfx.fillRect(2, 8, 12, 8);
          gfx.fillStyle(bodyColor, 1);
          gfx.fillRect(3, 14, 10, 8);
          // Legs
          gfx.fillStyle(0x1A3F8C, 1);
          gfx.fillRect(5, 18, 3, 6 + legOffset);
          gfx.fillRect(9, 18, 3, 6 - legOffset);
        } else {
          // Front view (down)
          gfx.fillStyle(hairColor, 1);
          gfx.fillRect(2, 0, 12, 5);
          gfx.fillStyle(skinColor, 1);
          gfx.fillRect(2, 5, 12, 10);
          // Eyes
          gfx.fillStyle(0x000000, 1);
          gfx.fillRect(5, 8, 2, 2);
          gfx.fillRect(9, 8, 2, 2);
          // Smile
          gfx.fillStyle(0x000000, 1);
          gfx.fillRect(6, 12, 4, 1);
          // Body
          gfx.fillStyle(bodyColor, 1);
          gfx.fillRect(3, 14, 10, 8);
          // Legs
          gfx.fillStyle(0x1A3F8C, 1);
          gfx.fillRect(4, 18, 3, 6 + legOffset);
          gfx.fillRect(9, 18, 3, 6 - legOffset);
        }

        gfx.generateTexture('player-' + dir + '-' + frame, frameW, frameH);
        gfx.destroy();
      }
    }
  }

  /* ─── Tiles (16x16) ─── */
  _genTiles() {
    this._genTile('grass', 0x5ABE5A, 0x4DA64D);
    this._genTile('dirt', 0xC47D4A, 0xB06E3C);
    this._genTile('water', 0x4A90D9, 0x2C6BB8, [0x3A7DC4, 0x5A9DE0]);
    this._genTile('path', 0xBF9B7A, 0xA6805F);
    this._genTile('stone', 0x9C9C9C, 0x8A8A8A);
  }

  _genTile(key, color1, color2, waterColors) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(color1, 1);
    gfx.fillRect(0, 0, 16, 16);
    gfx.fillStyle(color2, 1);
    // Corner pixel
    gfx.fillRect(0, 0, 1, 1);
    gfx.fillRect(8, 8, 1, 1);
    // Center cross
    gfx.fillRect(7, 7, 2, 2);

    if (waterColors) {
      // Water ripple detail
      gfx.fillStyle(waterColors[0], 1);
      gfx.fillRect(2, 4, 4, 1);
      gfx.fillRect(10, 10, 4, 1);
      gfx.fillStyle(waterColors[1], 1);
      gfx.fillRect(4, 8, 3, 1);
    }

    gfx.generateTexture(key, 16, 16);
    gfx.destroy();
  }

  /* ─── Interactive objects ─── */
  _genObjects() {
    // Tree (16x24)
    this._genObj('tree', 16, 24, (gfx) => {
      gfx.fillStyle(0x6B4423, 1);
      gfx.fillRect(5, 16, 6, 8);   // trunk
      gfx.fillStyle(0x2D7D2D, 1);
      gfx.fillRect(2, 0, 12, 10);
      gfx.fillRect(0, 4, 16, 8);
      gfx.fillRect(3, 8, 10, 8);
      gfx.fillStyle(0x3A8C3A, 1);
      gfx.fillRect(2, 2, 4, 3);
      gfx.fillRect(10, 4, 3, 3);
    });

    // Rock (16x12)
    this._genObj('rock', 16, 12, (gfx) => {
      gfx.fillStyle(0x808080, 1);
      gfx.fillRect(2, 2, 12, 8);
      gfx.fillStyle(0x909090, 1);
      gfx.fillRect(4, 4, 6, 4);
      gfx.fillStyle(0x707070, 1);
      gfx.fillRect(1, 5, 4, 5);
      gfx.fillRect(10, 4, 4, 6);
    });

    /* ─── Flower types by rarity ─── */
    // All flowers are 12x12 with stem + petals
    this._genFlowerTextures();

    /* ─── NPC Guide (16x24) ─── */
    this._genObj('npc', 16, 24, (gfx) => {
      // Hair (green/leafy)
      gfx.fillStyle(0x2D7D2D, 1);
      gfx.fillRect(2, 0, 12, 6);
      gfx.fillRect(0, 2, 16, 4);
      // Face
      gfx.fillStyle(0xFFD5B4, 1);
      gfx.fillRect(2, 6, 12, 8);
      // Eyes
      gfx.fillStyle(0x2D7D2D, 1);
      gfx.fillRect(5, 9, 2, 2);
      gfx.fillRect(9, 9, 2, 2);
      // Smile
      gfx.fillStyle(0x2D7D2D, 1);
      gfx.fillRect(6, 13, 4, 1);
      // Robe (earthy green)
      gfx.fillStyle(0x4A7C3F, 1);
      gfx.fillRect(2, 14, 12, 10);
      // Leaf detail on robe
      gfx.fillStyle(0x3A6C2F, 1);
      gfx.fillRect(3, 16, 4, 1);
      gfx.fillRect(9, 18, 4, 1);
      // Legs
      gfx.fillStyle(0x6B4423, 1);
      gfx.fillRect(4, 18, 3, 6);
      gfx.fillRect(9, 18, 3, 6);
    });
  }

  /* ─── Generate flower textures for all 8 types ─── */
  _genFlowerTextures() {
    const flowers = [
      { type: 'daisy',    petals: 0xFFFFFF, center: 0xFFD700, stem: 0x22C55E },
      { type: 'poppy',    petals: 0xE81123, center: 0x2C2C2C, stem: 0x22C55E },
      { type: 'tulip',    petals: 0xFF69B4, center: 0xFF1493, stem: 0x2ECC71 },
      { type: 'bluebell', petals: 0x4A90D9, center: 0x2C6BB8, stem: 0x27AE60 },
      { type: 'orchid',   petals: 0x9B59B6, center: 0x8E44AD, stem: 0x1ABC9C },
      { type: 'lotus',    petals: 0xF39C12, center: 0xE67E22, stem: 0x2ECC71 },
      { type: 'sunbloom', petals: 0xF1C40F, center: 0xE74C3C, stem: 0x1ABC9C },
      { type: 'starfleur',petals: 0xE91E63, center: 0x9B59B6, stem: 0x2ECC71 }
    ];

    for (const f of flowers) {
      this._genObj('flower-' + f.type, 12, 12, (gfx) => {
        // Stem
        gfx.fillStyle(f.stem, 1);
        gfx.fillRect(5, 6, 2, 6);
        // Petals
        gfx.fillStyle(f.petals, 1);
        gfx.fillRect(3, 0, 6, 6);
        gfx.fillRect(1, 2, 10, 4);
        gfx.fillRect(5, 0, 2, 8);
        // Center
        gfx.fillStyle(f.center, 1);
        gfx.fillRect(5, 3, 2, 2);
      });
    }
  }

  _genObj(key, w, h, drawFn) {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    drawFn(gfx);
    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  create() {
    this.scene.start('GameScene');
  }
}
