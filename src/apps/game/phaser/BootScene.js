/* ═══════════════════════════════════════════════════════
   RetroMap — Phaser Boot Scene (OMORI-style Textures)
   Pastel colors, chibi characters, black outlines
   ═══════════════════════════════════════════════════════ */

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#f0ebe0');

    this.add.text(width / 2, height / 2 - 40, 'RetroMap', {
      fontFamily: 'Tahoma', fontSize: '18px', color: '#7B6B5A', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 16, 'Loading world...', {
      fontFamily: 'Tahoma', fontSize: '11px', color: '#B0A090'
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0xD8D0C8, 1);
    barBg.fillRect(width / 2 - 100, height / 2 + 10, 200, 16);

    const barFill = this.add.graphics();
    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0x8B7B6B, 1);
      barFill.fillRect(width / 2 - 99, height / 2 + 11, 198 * value, 14);
    });

    this._generateTextures();
  }

  /* ─── OMORI-inspired Color Palette ─── */
  get _P() {
    return {
      // Pastel palette
      skin:    0xFFE8D0,
      skinShadow: 0xF0D4B8,
      hair:    0x8B6B5A,
      hairLight: 0xA0806E,
      eyeWhite:0xFFFFFF,
      eye:     0x2C2C2C,
      eyeLight:0x4A4A4A,
      mouth:   0xCC8877,
      blush:   0xFFB8A0,

      // Clothing - pastel
      shirt:   0xC8D8E8,
      shirtShadow: 0xB0C4D4,
      pants:   0x8BA8C8,
      pantsShadow: 0x7894B4,
      shoes:   0x5A4A3A,
      shoesShadow: 0x4A3A2A,

      // Environment
      grass:   0xB8D8A8,
      grassLight: 0xD0E8C0,
      grassDark: 0x98C088,
      darkGrass: 0x88A878,
      darkGrassLight: 0xA0C090,
      path:    0xD0C0A0,
      pathLight: 0xE0D0B8,
      stone:   0xC8C0B8,
      stoneLight: 0xD8D0C8,
      cobble:  0xB8B0A8,
      water:   0x90B8D8,
      waterLight: 0xA8C8E0,
      waterDark: 0x78A0C0,

      // Foliage
      treeGreen:  0x88B878,
      treeLight:  0xA0D090,
      treeDark:   0x689858,
      trunk:   0x8B6B5A,
      trunkDark:  0x6B4B3A,

      // Decor
      brown:   0x9B7B5A,
      brownLight: 0xB09070,
      brownDark:  0x7B5B3A,
      grey:    0x989088,
      greyLight:  0xA8A098,
      greyDark:   0x787068,

      // Flowers - pastel
      daisyPetals:    0xFFF8E0,
      poppyPetals:    0xE8A0A0,
      tulipPetals:    0xFFB8D0,
      bluebellPetals: 0xA0C8E8,
      orchidPetals:   0xC8A8D8,
      lotusPetals:    0xF0D090,
      sunbloomPetals: 0xF0E080,
      starfleurPetals:0xE0A0C0,
      flowerCenter:   0xE0D0A0,
      flowerStem:     0x80A870,

      // Outline colors
      hairDark:  0x6B4B3A,
      shirtDark: 0x4A5A6A,
      white:   0xFFFFFF,
      black:   0x1A1A1A,
      shadow:  0x000000,
    };
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
     PLAYER SPRITE — OMORI-style chibi 18×26
     Larger head, small body, pastel colors, black outline
     ═══════════════════════════════════════════════════ */

  _genPlayerSprite() {
    const w = 18, h = 26;
    const dirs = ['down', 'left', 'right', 'up'];
    const P = this._P;

    for (let di = 0; di < dirs.length; di++) {
      const dir = dirs[di];
      const isUp = dir === 'up';
      const isSide = dir === 'left' || dir === 'right';

      for (let frame = 0; frame < 4; frame++) {
        const gfx = this.make.graphics({ add: false });
        const legOff = frame === 1 ? 2 : frame === 3 ? -2 : 0;
        const armOff = frame === 1 ? -1 : frame === 3 ? 1 : 0;

        if (isUp) {
          // Hair (back)
          gfx.fillStyle(P.hair, 1);
          gfx.fillRect(3, 0, 12, 10);
          gfx.fillRect(2, 2, 14, 6);
          // Hair shine
          gfx.fillStyle(P.hairLight, 1);
          gfx.fillRect(5, 1, 4, 3);
          // Neck
          gfx.fillStyle(P.skin, 1);
          gfx.fillRect(7, 10, 4, 2);
          // Body
          gfx.fillStyle(P.shirt, 1);
          gfx.fillRect(3, 12, 12, 8);
          gfx.fillStyle(P.shirtShadow, 1);
          gfx.fillRect(3, 16, 12, 2);
          // Arms
          gfx.fillStyle(P.skin, 1);
          gfx.fillRect(1, 12 + armOff, 3, 6);
          gfx.fillRect(14, 12 - armOff, 3, 6);
          // Legs
          gfx.fillStyle(P.pants, 1);
          gfx.fillRect(4, 19, 4, 5);
          gfx.fillRect(10, 19, 4, 5);
          gfx.fillStyle(P.pantsShadow, 1);
          gfx.fillRect(4, 21, 4, 2);
          gfx.fillRect(10, 21, 4, 2);
          // Shoes
          gfx.fillStyle(P.shoes, 1);
          gfx.fillRect(3, 23, 5, 3);
          gfx.fillRect(10, 23, 5, 3);
          // Hair outline
          gfx.lineStyle(1, P.hairDark, 1);
          gfx.strokeRect(3, 0, 12, 9);
          gfx.lineStyle(1, P.shirtDark, 0.4);
          gfx.strokeRect(1, 12, 16, 7);
        } else if (isSide) {
          const dirSign = dir === 'right' ? 1 : -1;
          // Hair
          gfx.fillStyle(P.hair, 1);
          gfx.fillRect(2, 0, 14, 9);
          gfx.fillRect(1, 2, 16, 5);
          gfx.fillStyle(P.hairLight, 1);
          gfx.fillRect(dir === 'right' ? 10 : 4, 1, 4, 3);
          // Face profile
          gfx.fillStyle(P.skin, 1);
          gfx.fillRect(2, 8, 14, 7);
          // Eye (one visible from side)
          gfx.fillStyle(P.eyeWhite, 1);
          gfx.fillRect(dir === 'right' ? 11 : 5, 10, 3, 3);
          gfx.fillStyle(P.eye, 1);
          gfx.fillRect(dir === 'right' ? 12 : 6, 11, 2, 2);
          gfx.fillStyle(P.eyeLight, 1);
          gfx.fillRect(dir === 'right' ? 12 : 6, 11, 1, 1);
          // Mouth
          gfx.fillStyle(P.mouth, 1);
          gfx.fillRect(dir === 'right' ? 10 : 6, 13, 3, 1);
          // Body
          gfx.fillStyle(P.shirt, 1);
          gfx.fillRect(2, 15, 14, 6);
          gfx.fillStyle(P.shirtShadow, 1);
          gfx.fillRect(2, 19, 14, 2);
          // Arm (one visible)
          gfx.fillStyle(P.skin, 1);
          gfx.fillRect(dir === 'right' ? 0 : 15, 15 + armOff, 3, 5);
          // Legs
          gfx.fillStyle(P.pants, 1);
          gfx.fillRect(4, 19, 5, 5);
          gfx.fillRect(9, 19, 5, 5);
          // Shoes
          gfx.fillStyle(P.shoes, 1);
          gfx.fillRect(3, 23, 6, 3);
          gfx.fillRect(9, 23, 6, 3);
          // Outline
          gfx.lineStyle(1, P.black, 0.6);
          gfx.strokeRect(2, 0, 14, 8);
          gfx.strokeRect(2, 15, 14, 5);
        } else {
          // Front — large head, chibi
          // Hair
          gfx.fillStyle(P.hair, 1);
          gfx.fillRect(3, 0, 12, 7);
          gfx.fillRect(2, 1, 14, 5);
          gfx.fillRect(1, 2, 16, 4);
          // Bangs highlight
          gfx.fillStyle(P.hairLight, 1);
          gfx.fillRect(4, 1, 4, 2);
          gfx.fillRect(12, 1, 3, 2);
          // Face
          gfx.fillStyle(P.skin, 1);
          gfx.fillRect(2, 6, 14, 8);
          // Blush
          gfx.fillStyle(P.blush, 1);
          gfx.fillRect(3, 10, 3, 2);
          gfx.fillRect(12, 10, 3, 2);
          // Eyes (big, expressive)
          gfx.fillStyle(P.eyeWhite, 1);
          gfx.fillRect(4, 8, 4, 4);
          gfx.fillRect(10, 8, 4, 4);
          gfx.fillStyle(P.eye, 1);
          gfx.fillRect(5, 9, 3, 3);
          gfx.fillRect(11, 9, 3, 3);
          gfx.fillStyle(P.eyeLight, 1);
          gfx.fillRect(6, 9, 1, 1);
          gfx.fillRect(12, 9, 1, 1);
          // Mouth (small smile)
          gfx.fillStyle(P.mouth, 1);
          gfx.fillRect(7, 12, 4, 1);
          // Body (small body, big head chibi)
          gfx.fillStyle(P.shirt, 1);
          gfx.fillRect(3, 14, 12, 6);
          gfx.fillStyle(P.shirtShadow, 1);
          gfx.fillRect(3, 18, 12, 2);
          // Arms
          gfx.fillStyle(P.skin, 1);
          gfx.fillRect(1, 14 + armOff, 3, 5);
          gfx.fillRect(14, 14 - armOff, 3, 5);
          // Hands
          gfx.fillStyle(P.skin, 1);
          gfx.fillRect(1, 17 + armOff, 3, 2);
          gfx.fillRect(14, 17 - armOff, 3, 2);
          // Legs
          gfx.fillStyle(P.pants, 1);
          gfx.fillRect(4, 19, 4, 5);
          gfx.fillRect(10, 19, 4, 5);
          gfx.fillStyle(P.pantsShadow, 1);
          gfx.fillRect(4, 21, 4, 2);
          gfx.fillRect(10, 21, 4, 2);
          // Shoes
          gfx.fillStyle(P.shoes, 1);
          gfx.fillRect(3, 23, 5, 3);
          gfx.fillRect(10, 23, 5, 3);
          // Outline
          gfx.lineStyle(1, P.black, 0.5);
          gfx.strokeRect(2, 3, 14, 10);
          gfx.strokeRect(3, 14, 12, 5);
        }

        gfx.generateTexture('player-' + dir + '-' + frame, w, h);
        gfx.destroy();
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     TILES — Pastel OMORI-style with outlines
     ═══════════════════════════════════════════════════ */

  _genTiles() {
    const P = this._P;

    // Grass — pastel green
    this._makeTile('grass-0', 16, 16, (g) => {
      g.fillStyle(P.grass, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.grassLight, 1); g.fillRect(1, 2, 3, 1); g.fillRect(10, 8, 3, 1);
      g.fillStyle(P.grassDark, 1); g.fillRect(6, 6, 2, 2);
      g.lineStyle(1, P.black, 0.15);
      g.strokeRect(0, 0, 16, 16);
    });
    this._makeTile('grass-1', 16, 16, (g) => {
      g.fillStyle(P.grassLight, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.grass, 1); g.fillRect(2, 3, 2, 1); g.fillRect(12, 5, 2, 1);
      g.fillStyle(P.grassDark, 1); g.fillRect(8, 10, 2, 2);
      g.lineStyle(1, P.black, 0.12);
      g.strokeRect(0, 0, 16, 16);
    });
    this._makeTile('grass-2', 16, 16, (g) => {
      g.fillStyle(P.grassDark, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.grass, 1); g.fillRect(2, 0, 4, 2); g.fillRect(8, 6, 4, 2);
      g.fillStyle(P.grassLight, 1); g.fillRect(6, 3, 2, 1);
      // Small flower detail
      g.fillStyle(P.lotusPetals, 1); g.fillRect(11, 4, 1, 1);
      g.fillStyle(P.white, 1); g.fillRect(12, 4, 1, 1);
      g.lineStyle(1, P.black, 0.12);
      g.strokeRect(0, 0, 16, 16);
    });

    // Dark grass — for woods
    this._makeTile('darkgrass-0', 16, 16, (g) => {
      g.fillStyle(P.darkGrass, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.darkGrassLight, 1); g.fillRect(2, 3, 2, 1); g.fillRect(10, 8, 2, 1);
      g.fillStyle(P.grassDark, 1); g.fillRect(7, 6, 2, 2);
      g.lineStyle(1, P.black, 0.18);
      g.strokeRect(0, 0, 16, 16);
    });
    this._makeTile('darkgrass-1', 16, 16, (g) => {
      g.fillStyle(P.darkGrassLight, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.darkGrass, 1); g.fillRect(0, 0, 3, 2); g.fillRect(8, 8, 3, 2);
      g.fillStyle(P.grassDark, 1); g.fillRect(4, 4, 2, 1);
      g.lineStyle(1, P.black, 0.16);
      g.strokeRect(0, 0, 16, 16);
    });

    // Path — warm beige
    this._makeTile('path-0', 16, 16, (g) => {
      g.fillStyle(P.path, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.pathLight, 1); g.fillRect(2, 3, 2, 1); g.fillRect(10, 10, 3, 1);
      g.fillStyle(P.stone, 1); g.fillRect(6, 6, 2, 2);
      g.lineStyle(1, P.black, 0.12);
      g.strokeRect(0, 0, 16, 16);
    });
    this._makeTile('path-1', 16, 16, (g) => {
      g.fillStyle(P.pathLight, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.path, 1); g.fillRect(3, 2, 3, 1); g.fillRect(8, 5, 2, 1);
      g.fillStyle(P.stone, 1); g.fillRect(11, 8, 2, 2);
      g.lineStyle(1, P.black, 0.12);
      g.strokeRect(0, 0, 16, 16);
    });

    // Stone floor — warm grey
    this._makeTile('stone-0', 16, 16, (g) => {
      g.fillStyle(P.stone, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.stoneLight, 1); g.fillRect(1, 1, 4, 2);
      g.fillStyle(P.grey, 1); g.fillRect(10, 10, 2, 3);
      g.lineStyle(1, P.black, 0.2);
      g.strokeRect(0, 0, 16, 16);
    });
    this._makeTile('stone-1', 16, 16, (g) => {
      g.fillStyle(P.stoneLight, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.stone, 1); g.fillRect(7, 7, 3, 3);
      g.fillStyle(P.grey, 1); g.fillRect(2, 4, 3, 1);
      g.lineStyle(1, P.black, 0.18);
      g.strokeRect(0, 0, 16, 16);
    });
    this._makeTile('stone-2', 16, 16, (g) => {
      g.fillStyle(P.grey, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.stone, 1); g.fillRect(1, 1, 5, 5);
      g.fillStyle(P.stoneLight, 1); g.fillRect(9, 9, 4, 4);
      g.lineStyle(1, P.black, 0.22);
      g.strokeRect(0, 0, 16, 16);
    });

    // Dirt — warm brown
    this._makeTile('dirt-0', 16, 16, (g) => {
      g.fillStyle(P.brown, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.brownLight, 1); g.fillRect(3, 3, 2, 1);
      g.fillStyle(P.brownDark, 1); g.fillRect(8, 8, 2, 2);
      g.lineStyle(1, P.black, 0.18);
      g.strokeRect(0, 0, 16, 16);
    });
    this._makeTile('dirt-1', 16, 16, (g) => {
      g.fillStyle(P.brownLight, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.brown, 1); g.fillRect(7, 7, 3, 3);
      g.fillStyle(P.brownDark, 1); g.fillRect(2, 10, 2, 1);
      g.lineStyle(1, P.black, 0.16);
      g.strokeRect(0, 0, 16, 16);
    });

    // Water — soft pastel blue
    this._makeTile('water-0', 16, 16, (g) => {
      g.fillStyle(P.water, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.waterLight, 1); g.fillRect(2, 3, 4, 1); g.fillRect(10, 8, 3, 1);
      g.fillStyle(P.waterDark, 1); g.fillRect(7, 6, 2, 1);
    });
    this._makeTile('water-1', 16, 16, (g) => {
      g.fillStyle(P.waterLight, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.water, 1); g.fillRect(1, 5, 3, 1); g.fillRect(9, 2, 4, 1);
      g.fillStyle(P.waterDark, 1); g.fillRect(11, 7, 2, 2);
    });
    this._makeTile('water-2', 16, 16, (g) => {
      g.fillStyle(P.waterDark, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.water, 1); g.fillRect(3, 2, 5, 1); g.fillRect(0, 8, 3, 1);
      g.fillStyle(P.waterLight, 1); g.fillRect(8, 11, 4, 1);
    });

    // Sand
    this._makeTile('sand-0', 16, 16, (g) => {
      g.fillStyle(0xD8C8A0, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xC8B890, 1); g.fillRect(0, 0, 2, 2); g.fillRect(8, 8, 2, 2);
      g.fillStyle(0xE0D0B0, 1); g.fillRect(5, 4, 2, 1);
      g.lineStyle(1, P.black, 0.1);
      g.strokeRect(0, 0, 16, 16);
    });
  }

  /* ═══════════════════════════════════════════════════
     WALLS — Soft outline style
     ═══════════════════════════════════════════════════ */

  _genWalls() {
    const P = this._P;

    this._makeTile('wall-stone', 16, 16, (g) => {
      g.fillStyle(P.grey, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.greyLight, 1); g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8);
      g.fillStyle(P.greyDark, 1); g.fillRect(8, 0, 8, 8); g.fillRect(0, 8, 8, 8);
      g.lineStyle(1, P.black, 0.35);
      g.strokeRect(0, 0, 16, 16);
      g.strokeRect(8, 0, 8, 8);
      g.strokeRect(0, 8, 8, 8);
    });

    this._makeTile('wall-wood', 16, 16, (g) => {
      g.fillStyle(P.brown, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.brownLight, 1); g.fillRect(0, 0, 8, 8); g.fillRect(8, 8, 8, 8);
      g.fillStyle(P.brownDark, 1); g.fillRect(8, 0, 8, 8); g.fillRect(0, 8, 8, 8);
      g.lineStyle(1, P.black, 0.35);
      g.strokeRect(0, 0, 16, 16);
      g.fillStyle(P.brownDark, 1);
      g.fillRect(0, 4, 8, 1); g.fillRect(8, 12, 8, 1);
    });

    this._makeTile('fence', 16, 16, (g) => {
      g.fillStyle(P.brown, 1); g.fillRect(6, 0, 4, 16);
      g.fillStyle(P.brownDark, 1); g.fillRect(7, 0, 2, 16);
      g.fillStyle(P.brownLight, 1); g.fillRect(0, 2, 16, 3);
      g.fillStyle(P.brownDark, 1); g.fillRect(0, 3, 16, 1);
      g.fillStyle(P.brownLight, 1); g.fillRect(0, 10, 16, 3);
      g.fillStyle(P.brownDark, 1); g.fillRect(0, 11, 16, 1);
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(6, 0, 4, 16);
    });

    this._makeTile('cobble', 16, 16, (g) => {
      g.fillStyle(P.cobble, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(P.stone, 1); g.fillRect(0, 0, 7, 7); g.fillRect(8, 8, 8, 7);
      g.fillStyle(P.stoneLight, 1); g.fillRect(0, 8, 7, 8); g.fillRect(8, 0, 8, 7);
      g.lineStyle(1, P.black, 0.25);
      g.strokeRect(7, 0, 1, 16); g.strokeRect(0, 7, 16, 1);
    });
  }

  /* ═══════════════════════════════════════════════════
     OBJECTS — OMORI-style: round, soft, cute
     ═══════════════════════════════════════════════════ */

  _genObjects() {
    const P = this._P;

    // Oak tree — round, soft canopy
    this._makeTile('tree-oak', 22, 30, (g) => {
      // Shadow
      g.fillStyle(P.shadow, 0.12); g.fillRect(3, 22, 16, 6);
      // Trunk
      g.fillStyle(P.trunk, 1); g.fillRect(8, 16, 6, 14);
      g.fillStyle(P.trunkDark, 1); g.fillRect(9, 16, 4, 14);
      // Canopy — round, soft, pastel
      g.fillStyle(P.treeGreen, 1);
      g.fillRect(4, 2, 14, 10);
      g.fillRect(2, 4, 18, 8);
      g.fillRect(1, 6, 20, 8);
      g.fillRect(3, 10, 16, 6);
      // Highlights
      g.fillStyle(P.treeLight, 1);
      g.fillRect(3, 4, 5, 3);
      g.fillRect(13, 5, 4, 3);
      g.fillRect(7, 8, 4, 2);
      // Dark detail
      g.fillStyle(P.treeDark, 1);
      g.fillRect(2, 8, 3, 2);
      g.fillRect(15, 9, 3, 2);
      // Outline
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(2, 4, 18, 10);
      g.strokeRect(8, 16, 6, 14);
    });

    // Pine tree — cone shape
    this._makeTile('tree-pine', 20, 30, (g) => {
      g.fillStyle(P.shadow, 0.12); g.fillRect(3, 24, 14, 4);
      g.fillStyle(P.trunk, 1); g.fillRect(8, 20, 4, 10);
      g.fillStyle(P.trunkDark, 1); g.fillRect(9, 20, 2, 10);
      // Cone canopy
      g.fillStyle(P.treeDark, 1);
      g.fillRect(6, 2, 8, 6);
      g.fillRect(4, 6, 12, 6);
      g.fillRect(3, 10, 14, 6);
      g.fillRect(2, 14, 16, 6);
      // Highlights
      g.fillStyle(P.treeGreen, 1);
      g.fillRect(5, 3, 4, 3);
      g.fillRect(7, 7, 6, 2);
      g.fillRect(5, 11, 8, 2);
      g.fillRect(4, 15, 10, 2);
      // Outline
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(4, 2, 12, 17);
    });

    // Large rock — round
    this._makeTile('rock-big', 18, 14, (g) => {
      g.fillStyle(P.grey, 1);
      g.fillRect(2, 2, 14, 10);
      g.fillRect(1, 3, 16, 8);
      g.fillStyle(P.greyLight, 1);
      g.fillRect(3, 3, 6, 4);
      g.fillStyle(P.greyDark, 1);
      g.fillRect(1, 6, 4, 5);
      g.fillRect(12, 5, 4, 6);
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(2, 2, 14, 10);
    });

    // Small rock
    this._makeTile('rock-small', 10, 8, (g) => {
      g.fillStyle(P.grey, 1); g.fillRect(1, 1, 8, 6);
      g.fillStyle(P.greyLight, 1); g.fillRect(2, 2, 3, 2);
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(1, 1, 8, 6);
    });

    // Bush — round, soft
    this._makeTile('bush', 16, 14, (g) => {
      g.fillStyle(P.treeGreen, 1);
      g.fillRect(2, 3, 12, 9);
      g.fillRect(1, 5, 14, 7);
      g.fillRect(3, 8, 10, 6);
      g.fillStyle(P.treeLight, 1);
      g.fillRect(3, 4, 4, 3);
      g.fillRect(9, 6, 4, 3);
      g.fillStyle(P.treeDark, 1);
      g.fillRect(2, 8, 3, 2);
      g.fillRect(11, 8, 3, 2);
      g.lineStyle(1, P.black, 0.25);
      g.strokeRect(2, 3, 12, 10);
    });

    // Weed/tall grass
    this._makeTile('weed', 12, 14, (g) => {
      g.fillStyle(P.grass, 1);
      g.fillRect(3, 0, 2, 4);
      g.fillRect(5, 2, 2, 5);
      g.fillRect(4, 4, 2, 4);
      g.fillRect(7, 3, 2, 3);
      g.fillStyle(P.grassDark, 1);
      g.fillRect(4, 7, 2, 4);
      g.fillRect(6, 6, 1, 3);
      g.fillStyle(P.grassLight, 1);
      g.fillRect(5, 0, 2, 2);
      g.fillRect(3, 3, 1, 2);
      g.lineStyle(1, P.black, 0.2);
      g.strokeRect(3, 0, 6, 10);
    });

    // Mushroom — cute
    this._makeTile('mushroom', 10, 10, (g) => {
      g.fillStyle(P.skinShadow, 1);
      g.fillRect(4, 6, 2, 4);
      g.fillStyle(P.poppyPetals, 1);
      g.fillRect(1, 0, 8, 5);
      g.fillRect(2, 1, 6, 3);
      g.fillStyle(P.tulipPetals, 1);
      g.fillRect(2, 1, 3, 2);
      g.fillStyle(P.white, 1);
      g.fillRect(3, 1, 1, 1);
      g.fillRect(6, 2, 1, 1);
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(1, 0, 8, 5);
    });

    // ─── Flowers — OMORI-style, soft, cute ───
    this._genFlowers();

    // ─── NPC Flora — chibi, cute, glasses ───
    this._makeTile('npc-flora', 18, 26, (g) => {
      // Leafy hair — soft green
      g.fillStyle(P.treeGreen, 1);
      g.fillRect(2, 0, 14, 7);
      g.fillRect(0, 2, 18, 5);
      g.fillStyle(P.treeLight, 1);
      g.fillRect(1, 2, 6, 3);
      g.fillRect(10, 3, 5, 2);
      // Face
      g.fillStyle(P.skin, 1);
      g.fillRect(2, 7, 14, 8);
      // Blush
      g.fillStyle(P.blush, 1);
      g.fillRect(3, 11, 3, 2);
      g.fillRect(12, 11, 3, 2);
      // Glasses (round, cute)
      g.fillStyle(P.brownDark, 1);
      g.fillRect(3, 9, 5, 4);
      g.fillRect(10, 9, 5, 4);
      g.fillStyle(P.waterLight, 0.3);
      g.fillRect(4, 10, 3, 2);
      g.fillRect(11, 10, 3, 2);
      // Eyes behind glasses
      g.fillStyle(P.eye, 1);
      g.fillRect(5, 10, 1, 1);
      g.fillRect(12, 10, 1, 1);
      // Smile
      g.fillStyle(P.mouth, 1);
      g.fillRect(7, 13, 4, 1);
      // Body — green dress/robe
      g.fillStyle(P.treeDark, 1);
      g.fillRect(2, 15, 14, 8);
      g.fillStyle(P.treeGreen, 1);
      g.fillRect(1, 17, 16, 3);
      // Leaf belt
      g.fillStyle(P.treeLight, 1);
      g.fillRect(3, 19, 12, 2);
      // Legs
      g.fillStyle(P.brown, 1);
      g.fillRect(3, 20, 5, 6);
      g.fillRect(10, 20, 5, 6);
      g.fillStyle(P.brownDark, 1);
      g.fillRect(3, 23, 5, 3);
      g.fillRect(10, 23, 5, 3);
      // Outline
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(2, 7, 14, 7);
      g.strokeRect(2, 15, 14, 7);
    });

    // Sign post
    this._makeTile('sign', 14, 16, (g) => {
      g.fillStyle(P.brown, 1); g.fillRect(6, 10, 2, 6);
      g.fillStyle(P.brownLight, 1); g.fillRect(3, 0, 8, 10);
      g.fillStyle(P.brownDark, 1); g.fillRect(3, 0, 2, 10); g.fillRect(9, 0, 2, 10);
      g.fillStyle(P.black, 1);
      g.fillRect(5, 2, 4, 1);
      g.fillRect(5, 4, 4, 1);
      g.fillRect(6, 6, 2, 1);
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(3, 0, 8, 10);
    });

    // Chest
    this._makeTile('chest', 14, 10, (g) => {
      g.fillStyle(P.brown, 1); g.fillRect(0, 2, 14, 8);
      g.fillStyle(P.brownLight, 1); g.fillRect(1, 3, 12, 6);
      g.fillStyle(P.brownDark, 1); g.fillRect(0, 2, 14, 2);
      g.fillStyle(P.lotusPetals, 1); g.fillRect(6, 3, 2, 3);
      g.fillStyle(P.flowerStem, 1); g.fillRect(6, 5, 2, 1);
      g.lineStyle(1, P.black, 0.3);
      g.strokeRect(0, 2, 14, 8);
    });

    // Dungeon entrance
    this._makeTile('dungeon', 20, 20, (g) => {
      g.fillStyle(0x2A2040, 1); g.fillRect(4, 4, 12, 12);
      g.fillStyle(0x3A3050, 1); g.fillRect(5, 5, 10, 10);
      g.fillStyle(0x1A102A, 1); g.fillRect(6, 6, 8, 8);
      g.fillStyle(0x6A5A8A, 0.4); g.fillRect(4, 4, 12, 1);
      g.fillStyle(0x6A5A8A, 0.2); g.fillRect(4, 15, 12, 1);
      g.fillStyle(P.greyDark, 1); g.fillRect(2, 2, 16, 2);
      g.fillRect(2, 16, 16, 2);
      g.fillRect(2, 2, 2, 16);
      g.fillRect(16, 2, 2, 16);
      g.fillStyle(P.grey, 1); g.fillRect(3, 3, 14, 1);
      g.lineStyle(1, P.black, 0.35);
      g.strokeRect(2, 2, 16, 16);
    });
  }

  /* ─── Generate flower textures ─── */
  _genFlowers() {
    const P = this._P;
    const flowers = [
      { type: 'daisy',    petals: 0xFFF8E0, center: 0xE0D0A0, stem: 0x80A870 },
      { type: 'poppy',    petals: 0xE8A0A0, center: 0x4A3A3A, stem: 0x80A870 },
      { type: 'tulip',    petals: 0xFFB8D0, center: 0xE08090, stem: 0x80A870 },
      { type: 'bluebell', petals: 0xA0C8E8, center: 0x78A0C0, stem: 0x80A870 },
      { type: 'orchid',   petals: 0xC8A8D8, center: 0xA880B8, stem: 0x80A870 },
      { type: 'lotus',    petals: 0xF0D090, center: 0xD0B070, stem: 0x80A870 },
      { type: 'sunbloom', petals: 0xF0E080, center: 0xD0A040, stem: 0x80A870 },
      { type: 'starfleur',petals: 0xE0A0C0, center: 0xC080A0, stem: 0x80A870 }
    ];

    for (const f of flowers) {
      this._makeTile('flower-' + f.type, 12, 12, (g) => {
        // Shadow
        g.fillStyle(P.shadow, 0.1); g.fillRect(3, 8, 6, 3);
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
        g.fillStyle(P.white, 0.25);
        g.fillRect(3, 1, 2, 2);
        // Outline
        g.lineStyle(1, P.black, 0.2);
        g.strokeRect(2, 1, 8, 4);
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     EFFECTS
     ═══════════════════════════════════════════════════ */

  _genProjectiles() {
    const P = this._P;
    this._makeTile('sparkle', 4, 4, (g) => {
      g.fillStyle(P.white, 0.8); g.fillRect(1, 0, 2, 4);
      g.fillRect(0, 1, 4, 2);
      g.fillStyle(0xFFF8D0, 1); g.fillRect(1, 1, 2, 2);
    });

    this._makeTile('particle', 4, 4, (g) => {
      g.fillStyle(P.white, 0.7); g.fillRect(1, 1, 2, 2);
    });

    this._makeTile('coin-sparkle', 6, 6, (g) => {
      g.fillStyle(0xF0D080, 1); g.fillRect(1, 0, 4, 6);
      g.fillRect(0, 1, 6, 4);
      g.fillStyle(P.white, 0.5); g.fillRect(2, 1, 2, 1);
    });
  }

  /* ═══════════════════════════════════════════════════
     UI ELEMENTS
     ═══════════════════════════════════════════════════ */

  _genUI() {
    const P = this._P;
    this._makeTile('minimap-dot', 3, 3, (g) => {
      g.fillStyle(P.white, 1); g.fillRect(0, 0, 3, 3);
    });

    this._makeTile('minimap-npc', 3, 3, (g) => {
      g.fillStyle(P.grassLight, 1); g.fillRect(0, 0, 3, 3);
    });

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
