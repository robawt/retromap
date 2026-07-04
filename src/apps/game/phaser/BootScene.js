/* ═══════════════════════════════════════════════════════
   RetroMap — Phaser Boot Scene (RotMG-style Textures)
   Generates detailed pixel-art textures programmatically
   ═══════════════════════════════════════════════════════ */

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(width / 2, height / 2 - 40, 'RetroMap', {
      fontFamily: 'Tahoma', fontSize: '18px', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 16, 'Loading world...', {
      fontFamily: 'Tahoma', fontSize: '11px', color: '#AAAAAA'
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRect(width / 2 - 100, height / 2 + 10, 200, 16);

    const barFill = this.add.graphics();
    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0x4A90D9, 1);
      barFill.fillRect(width / 2 - 99, height / 2 + 11, 198 * value, 14);
    });

    this._generateTextures();
  }

  /* ─── Generate all game textures ─── */
  _generateTextures() {
    this._genPlayerSprite();
    this._genTiles();
    this._genWalls();
    this._genObjects();
    this._genProjectiles();
    this._genUI();
  }

  /* ═══════════════════════════════════════════════════
     PLAYER SPRITE — RotMG-style 16×24
     ═══════════════════════════════════════════════════ */

  _genPlayerSprite() {
    const w = 16, h = 24;
    const dirs = ['down', 'left', 'right', 'up'];
    const skin = 0xFFD5B4;
    const hair = 0x8B5E3C;
    const shirt = 0x2563EB;
    const pants = 0x1A3F8C;
    const shoes = 0x4A3728;
    const eye = 0x1a1a1a;

    for (let di = 0; di < dirs.length; di++) {
      const dir = dirs[di];
      const isUp = dir === 'up';
      const isSide = dir === 'left' || dir === 'right';

      for (let frame = 0; frame < 4; frame++) {
        const gfx = this.make.graphics({ add: false });
        const legSwing = frame === 1 ? 2 : frame === 3 ? -2 : 0;
        const armSwing = frame === 1 ? -1 : frame === 3 ? 1 : 0;

        if (isUp) {
          // Back of head (hair)
          gfx.fillStyle(hair, 1);
          gfx.fillRect(3, 0, 10, 8);
          gfx.fillRect(2, 2, 12, 4);
          // Neck
          gfx.fillStyle(skin, 1);
          gfx.fillRect(6, 8, 4, 2);
          // Body (shirt)
          gfx.fillStyle(shirt, 1);
          gfx.fillRect(3, 10, 10, 8);
          // Arms
          gfx.fillStyle(skin, 1);
          gfx.fillRect(1, 10 + armSwing, 3, 6);
          gfx.fillRect(12, 10 - armSwing, 3, 6);
          // Legs
          gfx.fillStyle(pants, 1);
          gfx.fillRect(4, 18, 3, 5);
          gfx.fillRect(9, 18, 3, 5);
          // Shoes
          gfx.fillStyle(shoes, 1);
          gfx.fillRect(3, 21, 4, 3);
          gfx.fillRect(9, 21, 4, 3);
        } else if (isSide) {
          const flip = dir === 'left' ? 0 : 0;
          // Hair (side)
          gfx.fillStyle(hair, 1);
          gfx.fillRect(2, 0, 12, 7);
          gfx.fillRect(1, 2, 14, 3);
          // Face profile
          gfx.fillStyle(skin, 1);
          gfx.fillRect(2, 7, 12, 7);
          // Eye
          gfx.fillStyle(eye, 1);
          gfx.fillRect(dir === 'right' ? 10 : 4, 9, 2, 1);
          // Body
          gfx.fillStyle(shirt, 1);
          gfx.fillRect(2, 14, 12, 6);
          // Arm (one visible from side)
          gfx.fillStyle(skin, 1);
          gfx.fillRect(dir === 'right' ? 0 : 13, 14 + armSwing, 3, 5);
          // Legs
          gfx.fillStyle(pants, 1);
          gfx.fillRect(3, 18, 5, 5);
          gfx.fillRect(8, 18, 5, 5);
          // Shoes
          gfx.fillStyle(shoes, 1);
          gfx.fillRect(3, 21, 5, 3);
          gfx.fillRect(8, 21, 5, 3);
        } else {
          // Front: Hair
          gfx.fillStyle(hair, 1);
          gfx.fillRect(3, 0, 10, 5);
          gfx.fillRect(2, 1, 12, 3);
          // Face
          gfx.fillStyle(skin, 1);
          gfx.fillRect(2, 5, 12, 7);
          // Eyes
          gfx.fillStyle(eye, 1);
          gfx.fillRect(4, 8, 2, 2);
          gfx.fillRect(10, 8, 2, 2);
          // Mouth
          gfx.fillStyle(0xCC9980, 1);
          gfx.fillRect(6, 11, 4, 1);
          // Body (shirt)
          gfx.fillStyle(shirt, 1);
          gfx.fillRect(2, 12, 12, 6);
          // Arms
          gfx.fillStyle(skin, 1);
          gfx.fillRect(0, 12 + armSwing, 3, 6);
          gfx.fillRect(13, 12 - armSwing, 3, 6);
          // Hands
          gfx.fillStyle(skin, 1);
          gfx.fillRect(0, 16 + armSwing, 3, 2);
          gfx.fillRect(13, 16 - armSwing, 3, 2);
          // Legs
          gfx.fillStyle(pants, 1);
          gfx.fillRect(4, 18, 3, 5);
          gfx.fillRect(9, 18, 3, 5);
          // Shoes
          gfx.fillStyle(shoes, 1);
          gfx.fillRect(3, 21, 5, 3);
          gfx.fillRect(8, 21, 5, 3);
        }

        gfx.generateTexture('player-' + dir + '-' + frame, w, h);
        gfx.destroy();
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     TILES — Multiple variants for visual variety
     ═══════════════════════════════════════════════════ */

  _genTiles() {
    // Grass variants (6 variants for variety)
    this._makeTile('grass-0', 16, 16, (g) => {
      g.fillStyle(0x5ABE5A, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x4DA64D, 1); g.fillRect(0, 0, 1, 1); g.fillRect(8, 8, 1, 1);
      g.fillStyle(0x6CCE6C, 1); g.fillRect(4, 4, 2, 1); g.fillRect(10, 12, 2, 1);
    });
    this._makeTile('grass-1', 16, 16, (g) => {
      g.fillStyle(0x56B456, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x4AA44A, 1); g.fillRect(7, 7, 2, 2);
      g.fillStyle(0x6CC86C, 1); g.fillRect(2, 3, 1, 1); g.fillRect(12, 8, 1, 1);
      g.fillStyle(0x3A8C3A, 1); g.fillRect(6, 1, 2, 1);
    });
    this._makeTile('grass-2', 16, 16, (g) => {
      g.fillStyle(0x4EB84E, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x3DA63D, 1); g.fillRect(0, 0, 2, 2); g.fillRect(10, 10, 2, 2);
      g.fillStyle(0x5AC85A, 1); g.fillRect(5, 12, 3, 1); g.fillRect(3, 3, 1, 2);
      // Small flower detail
      g.fillStyle(0xFFD700, 1); g.fillRect(11, 4, 1, 1);
      g.fillStyle(0xFFFFFF, 1); g.fillRect(12, 4, 1, 1);
    });

    // Path / stone variants
    this._makeTile('path-0', 16, 16, (g) => {
      g.fillStyle(0xBF9B7A, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xA6805F, 1); g.fillRect(0, 0, 1, 1); g.fillRect(8, 8, 1, 1);
      g.fillStyle(0xCCA888, 1); g.fillRect(3, 5, 2, 1); g.fillRect(10, 12, 3, 1);
    });
    this._makeTile('path-1', 16, 16, (g) => {
      g.fillStyle(0xB59170, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xA07D5C, 1); g.fillRect(7, 7, 2, 2);
      g.fillStyle(0xCCA080, 1); g.fillRect(2, 2, 2, 2); g.fillRect(11, 4, 2, 1);
    });

    // Stone floor variants
    this._makeTile('stone-0', 16, 16, (g) => {
      g.fillStyle(0x9C9C9C, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x8A8A8A, 1); g.fillRect(0, 0, 1, 1); g.fillRect(8, 8, 1, 1);
      g.fillStyle(0xB0B0B0, 1); g.fillRect(4, 3, 3, 1);
      // Crack
      g.fillStyle(0x707070, 1); g.fillRect(10, 10, 1, 3);
    });
    this._makeTile('stone-1', 16, 16, (g) => {
      g.fillStyle(0x909090, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x7E7E7E, 1); g.fillRect(7, 7, 2, 2);
      g.fillStyle(0xA8A8A8, 1); g.fillRect(1, 4, 3, 1); g.fillRect(11, 2, 2, 2);
    });
    this._makeTile('stone-2', 16, 16, (g) => {
      g.fillStyle(0x888888, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x9A9A9A, 1); g.fillRect(2, 2, 3, 3); g.fillRect(10, 10, 4, 3);
      g.fillStyle(0x767676, 1); g.fillRect(0, 8, 2, 1);
    });

    // Dirt variants
    this._makeTile('dirt-0', 16, 16, (g) => {
      g.fillStyle(0xC47D4A, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xB06E3C, 1); g.fillRect(0, 0, 1, 1); g.fillRect(8, 8, 1, 1);
      g.fillStyle(0xD08D5A, 1); g.fillRect(5, 3, 2, 1);
    });
    this._makeTile('dirt-1', 16, 16, (g) => {
      g.fillStyle(0xBA733F, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xA86331, 1); g.fillRect(7, 7, 2, 2);
      g.fillStyle(0xCE8350, 1); g.fillRect(3, 10, 3, 1);
      // Small rocks in dirt
      g.fillStyle(0x808080, 1); g.fillRect(11, 3, 1, 1); g.fillRect(4, 6, 1, 1);
    });

    // Water variants (animated via tint/overlay in game scene)
    this._makeTile('water-0', 16, 16, (g) => {
      g.fillStyle(0x2C6BB8, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x3A7DC4, 1); g.fillRect(2, 3, 4, 1); g.fillRect(10, 9, 4, 1);
      g.fillStyle(0x1A5BA8, 1); g.fillRect(7, 6, 3, 1);
      g.fillStyle(0x5A9DE0, 1); g.fillRect(5, 12, 3, 1);
    });
    this._makeTile('water-1', 16, 16, (g) => {
      g.fillStyle(0x3A6EA5, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x4A80B5, 1); g.fillRect(1, 5, 3, 1); g.fillRect(9, 2, 4, 1);
      g.fillStyle(0x2A5A95, 1); g.fillRect(11, 7, 2, 2);
      g.fillStyle(0x6A9ED0, 1); g.fillRect(4, 10, 2, 1);
    });
    this._makeTile('water-2', 16, 16, (g) => {
      g.fillStyle(0x1E5A99, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x2E6AA9, 1); g.fillRect(3, 2, 5, 1); g.fillRect(0, 8, 3, 1);
      g.fillStyle(0x0E4A89, 1); g.fillRect(8, 11, 4, 1);
    });

    // Sand
    this._makeTile('sand-0', 16, 16, (g) => {
      g.fillStyle(0xD4B96A, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xC4A95A, 1); g.fillRect(0, 0, 1, 1); g.fillRect(8, 8, 1, 1);
      g.fillStyle(0xE0C97A, 1); g.fillRect(5, 4, 2, 1); g.fillRect(11, 12, 2, 1);
    });

    // Dark grass (for woods/shaded areas)
    this._makeTile('darkgrass-0', 16, 16, (g) => {
      g.fillStyle(0x3A8C3A, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x2E7A2E, 1); g.fillRect(7, 7, 2, 2);
      g.fillStyle(0x4A9E4A, 1); g.fillRect(2, 4, 1, 1); g.fillRect(12, 10, 1, 1);
      g.fillStyle(0x2A6E2A, 1); g.fillRect(5, 1, 3, 1);
    });
    this._makeTile('darkgrass-1', 16, 16, (g) => {
      g.fillStyle(0x348634, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x287628, 1); g.fillRect(0, 0, 2, 2); g.fillRect(10, 10, 2, 2);
      g.fillStyle(0x449644, 1); g.fillRect(8, 3, 2, 1);
    });
  }

  /* ═══════════════════════════════════════════════════
     WALLS — Dungeon/Structure tiles
     ═══════════════════════════════════════════════════ */

  _genWalls() {
    // Stone wall
    this._makeTile('wall-stone', 16, 16, (g) => {
      g.fillStyle(0x707070, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x808080, 1); g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8);
      g.fillStyle(0x606060, 1); g.fillRect(8, 0, 8, 8); g.fillRect(0, 8, 8, 8);
      g.fillStyle(0x585858, 1); g.fillRect(0, 0, 1, 16); g.fillRect(15, 0, 1, 16);
      g.fillStyle(0x909090, 1); g.fillRect(1, 1, 6, 1); g.fillRect(9, 9, 6, 1);
    });

    // Wooden wall
    this._makeTile('wall-wood', 16, 16, (g) => {
      g.fillStyle(0x6B4423, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x7B5433, 1); g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8);
      g.fillStyle(0x5B3413, 1); g.fillRect(8, 0, 8, 8); g.fillRect(0, 8, 8, 8);
      // Wood grain
      g.fillStyle(0x5B3413, 1); g.fillRect(0, 4, 8, 1); g.fillRect(8, 12, 8, 1);
      g.fillStyle(0x7B5433, 1); g.fillRect(0, 10, 8, 1); g.fillRect(8, 2, 8, 1);
    });

    // Wooden fence
    this._makeTile('fence', 16, 16, (g) => {
      g.fillStyle(0x6B4423, 1); g.fillRect(6, 0, 4, 16);
      g.fillStyle(0x5B3413, 1); g.fillRect(7, 0, 2, 16);
      g.fillStyle(0x7B5433, 1); g.fillRect(0, 2, 16, 3);
      g.fillStyle(0x5B3413, 1); g.fillRect(0, 3, 16, 1);
      g.fillStyle(0x7B5433, 1); g.fillRect(0, 10, 16, 3);
      g.fillStyle(0x5B3413, 1); g.fillRect(0, 11, 16, 1);
      g.fillStyle(0x8B6443, 1); g.fillRect(6, 3, 4, 9);
    });

    // Cobblestone (for market/structures)
    this._makeTile('cobble', 16, 16, (g) => {
      g.fillStyle(0x8A8A8A, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x7A7A7A, 1); g.fillRect(0, 0, 7, 7); g.fillRect(8, 8, 8, 7);
      g.fillStyle(0x9A9A9A, 1); g.fillRect(0, 8, 7, 8); g.fillRect(8, 0, 8, 7);
      g.fillStyle(0x6A6A6A, 1);
      g.fillRect(7, 0, 1, 16); g.fillRect(0, 7, 16, 1);
    });
  }

  /* ═══════════════════════════════════════════════════
     OBJECTS — Trees, rocks, bushes, NPC, etc.
     ═══════════════════════════════════════════════════ */

  _genObjects() {
    // Oak tree (20x28 — extends above tile)
    this._makeTile('tree-oak', 20, 28, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.2); g.fillRect(2, 20, 16, 6);
      // Trunk
      g.fillStyle(0x6B4423, 1); g.fillRect(7, 14, 6, 14);
      g.fillStyle(0x5B3413, 1); g.fillRect(8, 14, 4, 14);
      // Canopy (dense, round)
      g.fillStyle(0x2D7D2D, 1);
      g.fillRect(4, 0, 12, 10);
      g.fillRect(2, 2, 16, 8);
      g.fillRect(1, 4, 18, 8);
      g.fillRect(3, 8, 14, 8);
      // Highlight
      g.fillStyle(0x3A8C3A, 1);
      g.fillRect(3, 2, 5, 3);
      g.fillRect(12, 4, 4, 3);
      g.fillRect(6, 6, 4, 2);
      // Dark detail
      g.fillStyle(0x1A6C1A, 1);
      g.fillRect(2, 6, 3, 2);
      g.fillRect(13, 8, 3, 2);
    });

    // Pine tree (18x28)
    this._makeTile('tree-pine', 18, 28, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.2); g.fillRect(2, 22, 14, 4);
      // Trunk
      g.fillStyle(0x6B4423, 1); g.fillRect(7, 18, 4, 10);
      // Canopy (cone shape)
      g.fillStyle(0x1A6C1A, 1);
      g.fillRect(5, 0, 8, 6);     // Top
      g.fillRect(3, 4, 12, 6);     // Middle top
      g.fillRect(2, 8, 14, 6);     // Middle
      g.fillRect(1, 12, 16, 6);    // Bottom
      // Highlights
      g.fillStyle(0x2A8C2A, 1);
      g.fillRect(4, 1, 4, 3);
      g.fillRect(6, 5, 6, 2);
      g.fillRect(4, 9, 8, 2);
      g.fillRect(3, 13, 10, 2);
    });

    // Large rock
    this._makeTile('rock-big', 18, 14, (g) => {
      g.fillStyle(0x808080, 1);
      g.fillRect(2, 2, 14, 10);
      g.fillRect(1, 3, 16, 8);
      g.fillStyle(0x909090, 1);
      g.fillRect(3, 3, 8, 4);
      g.fillRect(4, 4, 6, 2);
      g.fillStyle(0x707070, 1);
      g.fillRect(1, 6, 4, 5);
      g.fillRect(12, 5, 4, 6);
      g.fillStyle(0xA0A0A0, 1);
      g.fillRect(5, 3, 3, 2);
    });

    // Small rock
    this._makeTile('rock-small', 10, 8, (g) => {
      g.fillStyle(0x808080, 1); g.fillRect(1, 1, 8, 6);
      g.fillStyle(0x909090, 1); g.fillRect(2, 2, 4, 3);
      g.fillStyle(0x707070, 1); g.fillRect(1, 4, 3, 3); g.fillRect(6, 3, 3, 4);
    });

    // Bush
    this._makeTile('bush', 16, 14, (g) => {
      g.fillStyle(0x2D7D2D, 1);
      g.fillRect(2, 2, 12, 10);
      g.fillRect(1, 4, 14, 8);
      g.fillRect(3, 8, 10, 6);
      g.fillStyle(0x3A8C3A, 1);
      g.fillRect(3, 3, 5, 3);
      g.fillRect(9, 5, 4, 3);
      g.fillStyle(0x1A6C1A, 1);
      g.fillRect(2, 7, 3, 2);
      g.fillRect(11, 8, 3, 2);
      // Shadow
      g.fillStyle(0x1A5C1A, 1);
      g.fillRect(3, 10, 10, 3);
    });

    // Tall grass/weed
    this._makeTile('weed', 12, 14, (g) => {
      g.fillStyle(0x4AA44A, 1);
      g.fillRect(3, 0, 2, 3);
      g.fillRect(5, 2, 2, 4);
      g.fillRect(4, 4, 2, 3);
      g.fillRect(7, 3, 2, 2);
      g.fillStyle(0x3A8C3A, 1);
      g.fillRect(4, 6, 2, 4);
      g.fillRect(6, 5, 1, 3);
      g.fillStyle(0x5AC85A, 1);
      g.fillRect(5, 0, 2, 2);
      g.fillRect(3, 3, 1, 2);
      g.fillRect(8, 2, 1, 1);
    });

    // Mushroom
    this._makeTile('mushroom', 10, 10, (g) => {
      g.fillStyle(0xECE9D8, 1);
      g.fillRect(4, 6, 2, 4); // Stem
      g.fillStyle(0xE81123, 1);
      g.fillRect(1, 0, 8, 5); // Cap
      g.fillRect(2, 1, 6, 3);
      g.fillStyle(0xFF3333, 1);
      g.fillRect(2, 1, 3, 2);
      g.fillStyle(0xFFFFFF, 1);
      g.fillRect(3, 1, 1, 1);
      g.fillRect(6, 2, 1, 1);
    });

    // ─── Flowers (RotMG-style, more detailed) ───
    this._genFlowers();

    // ─── NPC Flora ───
    this._makeTile('npc-flora', 16, 24, (g) => {
      // Leafy hair
      g.fillStyle(0x2D7D2D, 1);
      g.fillRect(2, 0, 12, 6);
      g.fillRect(0, 2, 16, 4);
      g.fillStyle(0x3A8C3A, 1);
      g.fillRect(1, 1, 6, 3);
      g.fillRect(9, 2, 5, 2);
      // Face
      g.fillStyle(0xFFD5B4, 1);
      g.fillRect(2, 6, 12, 7);
      // Glasses (round)
      g.fillStyle(0x8B4513, 1);
      g.fillRect(3, 8, 5, 4);
      g.fillRect(8, 8, 5, 4);
      g.fillStyle(0x87CEEB, 0.4);
      g.fillRect(4, 9, 3, 2);
      g.fillRect(9, 9, 3, 2);
      // Smile
      g.fillStyle(0xCC6680, 1);
      g.fillRect(6, 12, 4, 1);
      // Robe body
      g.fillStyle(0x4A7C3F, 1);
      g.fillRect(2, 13, 12, 8);
      g.fillStyle(0x3A6C2F, 1);
      g.fillRect(1, 15, 14, 3);
      // Leaf belt
      g.fillStyle(0x5A8C4F, 1);
      g.fillRect(3, 17, 10, 2);
      // Legs
      g.fillStyle(0x6B4423, 1);
      g.fillRect(3, 18, 4, 6);
      g.fillRect(9, 18, 4, 6);
    });

    // ─── Sign post ───
    this._makeTile('sign', 14, 16, (g) => {
      g.fillStyle(0x6B4423, 1); g.fillRect(6, 10, 2, 6);
      g.fillStyle(0x8B6443, 1); g.fillRect(3, 0, 8, 10);
      g.fillStyle(0x5B3413, 1); g.fillRect(3, 0, 2, 10); g.fillRect(9, 0, 2, 10);
      // Text lines
      g.fillStyle(0x000000, 1);
      g.fillRect(5, 2, 4, 1);
      g.fillRect(5, 4, 4, 1);
      g.fillRect(6, 6, 2, 1);
    });

    // ─── Chest ───
    this._makeTile('chest', 14, 10, (g) => {
      g.fillStyle(0x6B4423, 1); g.fillRect(0, 2, 14, 8);
      g.fillStyle(0x8B6443, 1); g.fillRect(1, 3, 12, 6);
      g.fillStyle(0x5B3413, 1); g.fillRect(0, 2, 14, 2);
      // Lock
      g.fillStyle(0xDAA520, 1); g.fillRect(6, 3, 2, 3);
      g.fillStyle(0xB8860B, 1); g.fillRect(6, 5, 2, 1);
      // Highlights
      g.fillStyle(0x7B5433, 1); g.fillRect(2, 4, 3, 1);
    });

    // ─── Dungeon entrance ───
    this._makeTile('dungeon', 20, 20, (g) => {
      // Dark portal
      g.fillStyle(0x0A0A1A, 1); g.fillRect(4, 4, 12, 12);
      g.fillStyle(0x1A1A3A, 1); g.fillRect(5, 5, 10, 10);
      g.fillStyle(0x0A0A2A, 1); g.fillRect(6, 6, 8, 8);
      // Glow
      g.fillStyle(0x4A4A8A, 0.5); g.fillRect(4, 4, 12, 1);
      g.fillStyle(0x4A4A8A, 0.3); g.fillRect(4, 15, 12, 1);
      // Frame
      g.fillStyle(0x404060, 1); g.fillRect(2, 2, 16, 2);
      g.fillRect(2, 16, 16, 2);
      g.fillRect(2, 2, 2, 16);
      g.fillRect(16, 2, 2, 16);
      g.fillStyle(0x606080, 1); g.fillRect(3, 3, 14, 1);
    });
  }

  /* ─── Generate flower textures ─── */
  _genFlowers() {
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
      this._makeTile('flower-' + f.type, 12, 12, (g) => {
        // Shadow
        g.fillStyle(0x000000, 0.15); g.fillRect(3, 8, 6, 3);
        // Stem
        g.fillStyle(f.stem, 1);
        g.fillRect(5, 6, 2, 6);
        // Leaves
        g.fillStyle(f.stem, 1);
        g.fillRect(3, 8, 2, 1);
        g.fillRect(7, 9, 2, 1);
        // Petals (round flower head)
        g.fillStyle(f.petals, 1);
        g.fillRect(3, 0, 6, 6);
        g.fillRect(2, 1, 8, 4);
        g.fillRect(1, 2, 10, 3);
        g.fillRect(2, 0, 2, 2);
        g.fillRect(8, 0, 2, 2);
        g.fillRect(3, 4, 6, 2);
        // Center
        g.fillStyle(f.center, 1);
        g.fillRect(5, 2, 2, 2);
        // Highlight petal
        g.fillStyle(0xFFFFFF, 0.3);
        g.fillRect(3, 1, 2, 2);
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     PROJECTILES & EFFECTS
     ═══════════════════════════════════════════════════ */

  _genProjectiles() {
    // Sparkle/particle
    this._makeTile('sparkle', 4, 4, (g) => {
      g.fillStyle(0xFFFFFF, 1); g.fillRect(1, 0, 2, 4);
      g.fillRect(0, 1, 4, 2);
      g.fillStyle(0xFFFFAA, 1); g.fillRect(1, 1, 2, 2);
    });

    // Circle particle
    this._makeTile('particle', 4, 4, (g) => {
      g.fillStyle(0xFFFFFF, 1); g.fillRect(1, 1, 2, 2);
    });

    // Coin sparkle
    this._makeTile('coin-sparkle', 6, 6, (g) => {
      g.fillStyle(0xFFD700, 1); g.fillRect(1, 0, 4, 6);
      g.fillRect(0, 1, 6, 4);
      g.fillStyle(0xFFFFFF, 0.6); g.fillRect(2, 1, 2, 1);
    });
  }

  /* ═══════════════════════════════════════════════════
     UI ELEMENTS
     ═══════════════════════════════════════════════════ */

  _genUI() {
    // Player dot for minimap
    this._makeTile('minimap-dot', 3, 3, (g) => {
      g.fillStyle(0xFFFFFF, 1); g.fillRect(0, 0, 3, 3);
    });

    // NPC dot for minimap
    this._makeTile('minimap-npc', 3, 3, (g) => {
      g.fillStyle(0x00FF00, 1); g.fillRect(0, 0, 3, 3);
    });

    // Fog of war reveal texture (soft circle for erase)
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
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    gradient.addColorStop(0.75, 'rgba(0,0,0,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    fogCtx.fillStyle = gradient;
    fogCtx.fillRect(0, 0, fogSize, fogSize);

    // Convert canvas to Phaser texture
    this.textures.addCanvas('fog-reveal', fogCanvas);
  }

  /* ─── Helper: make a tile texture ─── */
  _makeTile(key, w, h, drawFn) {
    const gfx = this.make.graphics({ add: false });
    drawFn(gfx);
    gfx.generateTexture(key, w, h);
    gfx.destroy();
  }

  create() {
    this.scene.start('GameScene');
  }
}
