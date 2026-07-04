/* ═══════════════════════════════════════════════════════
   RetroMap — Game Scene (Cute Farm World)
   Top-down pixel farm with animals, crops, house, pond
   ═══════════════════════════════════════════════════════ */

const MAP_W = 64;
const MAP_H = 48;
const TILE_SIZE = 16;

/* ─── Farm Zone Definitions ─── */
const ZONES = {
  FARMHOUSE: { x1: 24, y1: 2,  x2: 34, y2: 12, label: '🏡 Farmhouse' },
  GARDEN:    { x1: 22, y1: 10, x2: 36, y2: 14, label: '🌻 Front Garden' },
  CROPS:     { x1: 4,  y1: 14, x2: 22, y2: 28, label: '🌱 Crop Fields' },
  CHICKENS:  { x1: 32, y1: 16, x2: 40, y2: 22, label: '🐔 Chicken Coop' },
  COWS:      { x1: 42, y1: 16, x2: 52, y2: 24, label: '🐄 Cow Pasture' },
  PIGS:      { x1: 42, y1: 26, x2: 52, y2: 34, label: '🐖 Pig Pen' },
  SHEEP:     { x1: 32, y1: 24, x2: 40, y2: 32, label: '🐑 Sheep Meadow' },
  POND:      { x1: 24, y1: 30, x2: 36, y2: 42, label: '🌊 Fishing Pond' },
  FOREST:    { x1: 46, y1: 2,  x2: 60, y2: 14, label: '🌲 Whimsy Woods' },
  MARKET:    { x1: 4,  y1: 34, x2: 18, y2: 44, label: '🏪 Market Stalls' },
  FLORA_GARDEN: { x1: 2, y1: 4, x2: 14, y2: 12, label: '🌸 Flora\'s Garden' }
};

const TILE = {
  GRASS: 0,
  DIRT: 1,
  PATH: 2,
  WATER: 3,
  FARMLAND: 4,
  FENCE: 5,
  GRAVEL: 6,
  FLOWER: 7
};

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.tileSize = TILE_SIZE;
    this._collisionMap = [];
    this._activeFlowers = [];
    this._animals = [];
    this._crops = [];
    this._npcDialogueOpen = false;
    this._exploredTiles = new Set();
    this._lightRadius = 80;
    this._dayTime = 0;

    // Build the farm world
    this._generateFarmWorld();

    // Create player animations
    this._setupPlayerAnims();

    // Spawn player near farmhouse
    this._spawnPlayer(27, 14);

    // Place farm features
    this._placeFarmhouse();
    this._placeCrops();
    this._placeAnimals();
    this._placeDecorations();
    this._placePond();
    this._placeForest();
    this._placeMarketStalls();

    // Spawn flowers
    this._spawnFlowers();

    // Place NPC Flora in her garden
    this._placeNPC();

    // ─── Camera ───
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);
    this.cameras.main.setZoom(1.5);

    // ─── Minimap ───
    this._createMinimap();

    // ─── Fog of War ───
    this._createFogOfWar();

    // ─── Controls ───
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.mapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this._minimapLarge = false;

    // ─── HUD ───
    this._buildHUD();

    // ─── Timers ───
    this._hudTimer = this.time.addEvent({
      delay: 3000,
      callback: () => this._refreshHUD(),
      loop: true
    });

    // ─── Animal wandering ───
    this._animalTimer = this.time.addEvent({
      delay: 2000,
      callback: () => this._wanderAnimals(),
      loop: true
    });

    this.events.on('shutdown', () => {
      if (this._hudTimer) this._hudTimer.destroy();
      if (this._animalTimer) this._animalTimer.destroy();
    });

    // ─── Interaction prompt ───
    this._interactPrompt = this.add.text(0, 0, '', {
      fontFamily: 'Tahoma', fontSize: '10px', color: '#E8D080',
      stroke: '#000000', strokeThickness: 2, align: 'center'
    }).setOrigin(0.5, 1).setDepth(15).setVisible(false);

    this._renderPlacedArt();
    this._dialogueContainer = null;
  }

  /* ═══════════════════════════════════════════════════
     FARM WORLD GENERATION
     ═══════════════════════════════════════════════════ */

  _generateFarmWorld() {
    for (let y = 0; y < MAP_H; y++) {
      this._collisionMap[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        const tile = this._getTileAt(x, y);
        const sprite = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          tile.texture
        ).setDepth(0);
        this._collisionMap[y][x] = tile.blocked;
      }
    }
  }

  _getTileAt(x, y) {
    // Border — water/beach edge
    if (y === 0 || y >= MAP_H - 1 || x === 0 || x >= MAP_W - 1) {
      return { texture: 'tile-water', blocked: true };
    }

    // Pond zone — with water tile variety
    if (this._isInZone(ZONES.POND, x, y)) {
      const cx = 30, cy = 36;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= 4) {
        const variant = (x * 5 + y * 3) % 4;
        const tex = this.textures.exists('water-tile-' + variant) ? 'water-tile-' + variant : 'tile-water';
        return { texture: tex, blocked: true };
      }
      if (dist <= 5) return { texture: 'tile-grass', blocked: false };
      // Docks/beach edges
      if ((x === cx && y >= cy - 5 && y <= cy + 5)) return { texture: 'tile-path', blocked: false };
    }

    // Farmhouse area — grass with path
    if (this._isInZone(ZONES.FARMHOUSE, x, y)) {
      if (x >= 26 && x <= 32 && y >= 4 && y <= 8) return { texture: 'tile-grass', blocked: false };
      return { texture: 'tile-grass', blocked: false };
    }

    // Crops — farmland tiles with variety
    if (this._isInZone(ZONES.CROPS, x, y)) {
      const variant = (x * 3 + y * 7) % 4;
      if (this.textures.exists('farmland-' + variant)) {
        return { texture: 'farmland-' + variant, blocked: false };
      }
      return { texture: 'tile-grass', blocked: false };
    }

    // Animal areas — grass
    if (this._isInZone(ZONES.CHICKENS, x, y) ||
        this._isInZone(ZONES.COWS, x, y) ||
        this._isInZone(ZONES.PIGS, x, y) ||
        this._isInZone(ZONES.SHEEP, x, y)) {
      return { texture: 'tile-grass', blocked: false };
    }

    // Forest
    if (this._isInZone(ZONES.FOREST, x, y)) {
      return { texture: 'tile-grass', blocked: false };
    }

    // Market — stone/gravel
    if (this._isInZone(ZONES.MARKET, x, y)) {
      if ((x + y) % 3 === 0) return { texture: 'tile-path', blocked: false };
      return { texture: 'tile-grass', blocked: false };
    }

    // Flora's Garden
    if (this._isInZone(ZONES.FLORA_GARDEN, x, y)) {
      return { texture: 'tile-grass', blocked: false };
    }

    // Path network
    if (this._isOnPath(x, y)) {
      return { texture: 'tile-path', blocked: false };
    }

    // Default: grass
    return { texture: 'tile-grass', blocked: false };
  }

  _isInZone(zone, x, y) {
    return x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2;
  }

  _isOnPath(x, y) {
    // Main path from bottom to farmhouse
    if (x >= 26 && x <= 28 && y >= 14 && y <= 46) return true;
    // Cross path to crops
    if (y === 14 && x >= 4 && x <= 34) return true;
    // Path to animal area
    if (y === 24 && x >= 20 && x <= 52) return true;
    // Path around pond
    if (x === 22 && y >= 14 && y <= 34) return true;
    if (x === 38 && y >= 14 && y <= 34) return true;
    // Path to market
    if (y === 34 && x >= 4 && x <= 38) return true;
    // Path to Flora's garden
    if (x === 16 && y >= 4 && y <= 14) return true;
    if (y === 4 && x >= 14 && x <= 20) return true;
    // Forest path
    if (x === 44 && y >= 2 && y <= 24) return true;
    // Diagonal path through crops
    if (x === 12 && y >= 14 && y <= 28) return true;
    if (x === 18 && y >= 14 && y <= 24) return true;
    return false;
  }

  /* ═══════════════════════════════════════════════════
     PLAYER
     ═══════════════════════════════════════════════════ */

  _spawnPlayer(tileX, tileY) {
    this.player = this.add.sprite(
      tileX * TILE_SIZE + TILE_SIZE / 2,
      tileY * TILE_SIZE + TILE_SIZE / 2,
      'player-sheet', 16 // idle-down frame
    ).setDepth(10).setScale(1);

    this.player._dir = 'down';
    this.player._moving = false;

    // Small shadow
    this.shadow = this.add.ellipse(
      this.player.x, this.player.y + 16,
      12, 5, 0x000000, 0.25
    ).setDepth(9);
  }

  _setupPlayerAnims() {
    const dirs = [
      { dir: 'down', frames: [0, 1, 0, 2] },
      { dir: 'left', frames: [4, 5, 4, 6] },
      { dir: 'right', frames: [8, 9, 8, 10] },
      { dir: 'up', frames: [12, 13, 12, 14] }
    ];
    for (const d of dirs) {
      const key = 'walk-' + d.dir;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: d.frames.map(f => ({ key: 'player-sheet', frame: f })),
          frameRate: 8,
          repeat: -1
        });
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     FARM FEATURES
     ═══════════════════════════════════════════════════ */

  _placeFarmhouse() {
    // Place the house at (26, 3) — 96×128 image
    const hx = 29 * TILE_SIZE;
    const hy = 6 * TILE_SIZE;
    this.add.image(hx, hy, 'house').setDepth(5).setOrigin(0.5, 0.5);

    // Collision for house area
    for (let dy = 2; dy <= 8; dy++) {
      for (let dx = 26; dx <= 32; dx++) {
        if (this._collisionMap[dy] !== undefined) {
          this._collisionMap[dy][dx] = true;
        }
      }
    }

    // Path to door
    this._collisionMap[11][29] = false;
    this._collisionMap[11][28] = false;
    this._collisionMap[11][30] = false;

    // Mailbox
    this.add.image(25 * TILE_SIZE + TILE_SIZE / 2, 12 * TILE_SIZE, 'chest')
      .setDepth(4).setScale(1.5);
  }

  _placeCrops() {
    // Place crop rows on top of the farmland base tiles
    for (let y = 16; y <= 26; y += 2) {
      for (let x = 6; x <= 20; x += 2) {
        if (Math.random() < 0.7) {
          // Add crop rows on top of the farmland tile
          const cropGfx = this.add.graphics().setDepth(2);
          cropGfx.fillStyle(0x4A7C3F, 1);
          for (let i = 0; i < 3; i++) {
            cropGfx.fillRect(
              x * TILE_SIZE + 3,
              y * TILE_SIZE + 2 + i * 5,
              2, 3
            );
          }
          this._collisionMap[y][x] = true;
          this._collisionMap[y][x + 1] = true;

          this._crops.push({ x, y, grown: Math.random() > 0.3 });
        }
      }
    }
  }

  _placeAnimals() {
    // Chickens
    const chickenPositions = [
      { x: 34, y: 18 }, { x: 36, y: 20 }, { x: 38, y: 17 },
      { x: 35, y: 21 }, { x: 37, y: 19 }
    ];
    for (const pos of chickenPositions) {
      const chicken = this.add.image(
        pos.x * TILE_SIZE + TILE_SIZE / 2,
        pos.y * TILE_SIZE + TILE_SIZE / 2,
        'animal-chicken'
      ).setDepth(4).setScale(0.22);
      chicken._tileX = pos.x;
      chicken._tileY = pos.y;
      chicken._speed = 0.3;
      this._animals.push(chicken);
    }

    // Cows
    const cowPositions = [
      { x: 44, y: 18 }, { x: 47, y: 20 }, { x: 50, y: 22 },
      { x: 45, y: 22 }, { x: 48, y: 18 }
    ];
    for (const pos of cowPositions) {
      const cow = this.add.image(
        pos.x * TILE_SIZE + TILE_SIZE / 2,
        pos.y * TILE_SIZE + TILE_SIZE / 2,
        'animal-cow'
      ).setDepth(4).setScale(0.35);
      cow._tileX = pos.x;
      cow._tileY = pos.y;
      cow._speed = 0.15;
      this._animals.push(cow);
    }

    // Pigs
    const pigPositions = [
      { x: 44, y: 28 }, { x: 47, y: 30 }, { x: 50, y: 32 },
      { x: 46, y: 32 }, { x: 49, y: 28 }
    ];
    for (const pos of pigPositions) {
      const pig = this.add.image(
        pos.x * TILE_SIZE + TILE_SIZE / 2,
        pos.y * TILE_SIZE + TILE_SIZE / 2,
        'animal-pig'
      ).setDepth(4).setScale(0.28);
      pig._tileX = pos.x;
      pig._tileY = pos.y;
      pig._speed = 0.2;
      this._animals.push(pig);
    }

    // Sheep
    const sheepPositions = [
      { x: 34, y: 26 }, { x: 36, y: 28 }, { x: 38, y: 30 },
      { x: 35, y: 30 }, { x: 37, y: 26 }
    ];
    for (const pos of sheepPositions) {
      const sheep = this.add.image(
        pos.x * TILE_SIZE + TILE_SIZE / 2,
        pos.y * TILE_SIZE + TILE_SIZE / 2,
        'animal-sheep'
      ).setDepth(4).setScale(0.28);
      sheep._tileX = pos.x;
      sheep._tileY = pos.y;
      sheep._speed = 0.18;
      this._animals.push(sheep);
    }

    // Add fences around animal pens
    this._addFences();
  }

  _addFences() {
    // Chicken coop fence (rectangular)
    this._addFenceRow(32, 15, 41, 15); // top
    this._addFenceRow(32, 23, 41, 23); // bottom
    this._addFenceCol(32, 15, 23);     // left
    this._addFenceCol(40, 15, 23);     // right

    // Cow pasture fence
    this._addFenceRow(42, 15, 53, 15);
    this._addFenceRow(42, 25, 53, 25);
    this._addFenceCol(42, 15, 25);
    this._addFenceCol(52, 15, 25);
    // Gate
    this._collisionMap[24][47] = false;
    this._collisionMap[24][48] = false;

    // Pig pen fence
    this._addFenceRow(42, 25, 53, 25);
    this._addFenceRow(42, 35, 53, 35);
    this._addFenceCol(42, 25, 35);
    this._addFenceCol(52, 25, 35);
    this._collisionMap[34][47] = false;
    this._collisionMap[34][48] = false;

    // Sheep meadow fence
    this._addFenceRow(32, 23, 41, 23);
    this._addFenceRow(32, 33, 41, 33);
    this._addFenceCol(32, 23, 33);
    this._addFenceCol(40, 23, 33);
    this._collisionMap[32][36] = false;
    this._collisionMap[32][37] = false;
  }

  _addFenceRow(x1, y, x2, y2) {
    for (let x = x1; x <= x2; x++) {
      if (this._collisionMap[y] !== undefined) {
        this._collisionMap[y][x] = true;
        // Draw fence segment — wooden post
        const gfx = this.add.graphics().setDepth(4);
        gfx.fillStyle(0x6B4226, 1);
        gfx.fillRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, 4, 12); // post
        gfx.fillStyle(0x8B5E3C, 1);
        gfx.fillRect(x * TILE_SIZE + 1, y * TILE_SIZE + 4, 6, 2); // top rail
        gfx.fillRect(x * TILE_SIZE + 1, y * TILE_SIZE + 9, 6, 2); // bottom rail
      }
    }
  }

  _addFenceCol(x, y1, y2) {
    for (let y = y1; y <= y2; y++) {
      if (this._collisionMap[y] !== undefined) {
        this._collisionMap[y][x] = true;
        // Draw fence segment
        const gfx = this.add.graphics().setDepth(4);
        gfx.fillStyle(0x6B4226, 1);
        gfx.fillRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, 12, 4); // post
        gfx.fillStyle(0x8B5E3C, 1);
        gfx.fillRect(x * TILE_SIZE + 4, y * TILE_SIZE + 1, 2, 6); // left rail
        gfx.fillRect(x * TILE_SIZE + 9, y * TILE_SIZE + 1, 2, 6); // right rail
      }
    }
  }

  _wanderAnimals() {
    for (const animal of this._animals) {
      const dx = (Math.random() - 0.5) * 2;
      const dy = (Math.random() - 0.5) * 2;
      const newX = animal._tileX + Math.round(dx);
      const newY = animal._tileY + Math.round(dy);
      // Check bounds
      if (newX > 0 && newX < MAP_W - 1 && newY > 0 && newY < MAP_H - 1) {
        if (!this._collisionMap[newY][newX]) {
          animal._tileX = newX;
          animal._tileY = newY;
        }
      }
      // Smooth movement
      this.tweens.add({
        targets: animal,
        x: animal._tileX * TILE_SIZE + TILE_SIZE / 2,
        y: animal._tileY * TILE_SIZE + TILE_SIZE / 2,
        duration: 600,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     POND
     ═══════════════════════════════════════════════════ */

  _placePond() {
    const cx = 30, cy = 36;

    // Place water tiles in a circular pattern
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 3.5) {
          const wx = (cx + dx) * TILE_SIZE;
          const wy = (cy + dy) * TILE_SIZE;
          this.add.image(wx + TILE_SIZE / 2, wy + TILE_SIZE / 2, 'tile-water')
            .setDepth(1).setAlpha(0.9);
          if (this._collisionMap[cy + dy] !== undefined) {
            this._collisionMap[cy + dy][cx + dx] = true;
          }
        }
      }
    }

    // Dock/pier
    for (let i = 0; i < 3; i++) {
      this.add.image(
        (cx - 2) * TILE_SIZE + TILE_SIZE / 2,
        (cy - 1 + i) * TILE_SIZE + TILE_SIZE / 2,
        'tile-path'
      ).setDepth(2);
      if (this._collisionMap[cy - 1 + i] !== undefined) {
        this._collisionMap[cy - 1 + i][cx - 2] = false;
      }
    }

    // Small island in middle
    this.add.image(
      cx * TILE_SIZE + TILE_SIZE / 2,
      cy * TILE_SIZE + TILE_SIZE / 2,
      'tile-grass'
    ).setDepth(2);
    if (this._collisionMap[cy] !== undefined) {
      this._collisionMap[cy][cx] = false;
    }

    // Flower on island
    this._addFlowerSprite(cx, cy, 0xFFD700);
  }

  _addFlowerSprite(tx, ty, color) {
    const gfx = this.add.graphics().setDepth(3);
    gfx.fillStyle(color, 1);
    gfx.fillCircle(tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2, 3);
    gfx.fillStyle(0x22C55E, 1);
    gfx.fillRect(tx * TILE_SIZE + 7, ty * TILE_SIZE + 10, 2, 5);
  }

  /* ═══════════════════════════════════════════════════
     FOREST
     ═══════════════════════════════════════════════════ */

  _placeForest() {
    for (let i = 0; i < 25; i++) {
      const tx = Phaser.Math.Between(ZONES.FOREST.x1 + 1, ZONES.FOREST.x2 - 1);
      const ty = Phaser.Math.Between(ZONES.FOREST.y1 + 1, ZONES.FOREST.y2 - 1);
      if (!this._isOnPath(tx, ty)) {
        const tree = this.add.image(
          tx * TILE_SIZE + TILE_SIZE / 2,
          ty * TILE_SIZE + TILE_SIZE / 2,
          'tree-oak'
        ).setDepth(5).setOrigin(0.5, 1).setScale(0.5);

        if (this._collisionMap[ty] !== undefined) {
          this._collisionMap[ty][tx] = true;
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     DECORATIONS
     ═══════════════════════════════════════════════════ */

  _placeDecorations() {
    // Trees around farmhouse
    const houseTrees = [
      { x: 24, y: 4 }, { x: 25, y: 3 },
      { x: 33, y: 3 }, { x: 34, y: 4 }
    ];
    for (const t of houseTrees) {
      this.add.image(
        t.x * TILE_SIZE + TILE_SIZE / 2,
        t.y * TILE_SIZE + TILE_SIZE / 2,
        'tree-oak'
      ).setDepth(5).setOrigin(0.5, 1).setScale(0.4);
      if (this._collisionMap[t.y] !== undefined) {
        this._collisionMap[t.y][t.x] = true;
      }
    }

    // Bushes and flowers around farm
    const decorSpots = [
      { x: 23, y: 12 }, { x: 35, y: 12 }, { x: 20, y: 14 },
      { x: 24, y: 16 }, { x: 38, y: 34 }, { x: 20, y: 30 },
      { x: 14, y: 34 }, { x: 22, y: 28 }, { x: 4, y: 14 }
    ];
    for (const spot of decorSpots) {
      if (!this._collisionMap[spot.y][spot.x]) {
        this._addFlowerSprite(spot.x, spot.y,
          Phaser.Math.RND.pick([0xFF6B6B, 0xFFD93D, 0x6BCB77, 0x4D96FF, 0xFF8E9E]));
      }
    }

    // Berry bushes
    const berrySpots = [
      { x: 3, y: 4 }, { x: 4, y: 3 }, { x: 2, y: 6 },
      { x: 14, y: 3 }, { x: 13, y: 4 }
    ];
    for (const spot of berrySpots) {
      if (!this._collisionMap[spot.y][spot.x]) {
        const gfx = this.add.graphics().setDepth(4);
        gfx.fillStyle(0x2D7D2D, 1);
        gfx.fillCircle(spot.x * TILE_SIZE + 8, spot.y * TILE_SIZE + 10, 5);
        gfx.fillStyle(0xE81123, 1);
        gfx.fillCircle(spot.x * TILE_SIZE + 6, spot.y * TILE_SIZE + 8, 2);
        gfx.fillCircle(spot.x * TILE_SIZE + 10, spot.y * TILE_SIZE + 8, 2);
      }
    }

    // Hay bales near crops
    const haySpots = [
      { x: 5, y: 16 }, { x: 21, y: 16 }, { x: 5, y: 26 }
    ];
    for (const spot of haySpots) {
      const gfx = this.add.graphics().setDepth(4);
      gfx.fillStyle(0xD4A76A, 1);
      gfx.fillRoundedRect(spot.x * TILE_SIZE + 2, spot.y * TILE_SIZE + 4, 12, 10, 2);
      gfx.fillStyle(0xC49A5A, 1);
      gfx.fillRect(spot.x * TILE_SIZE + 3, spot.y * TILE_SIZE + 6, 10, 6);
    }

    // Scarecrow
    const scareX = 10, scareY = 18;
    const scareGfx = this.add.graphics().setDepth(5);
    scareGfx.fillStyle(0x6B4423, 1);
    scareGfx.fillRect(scareX * TILE_SIZE + 7, scareY * TILE_SIZE + 8, 2, 8);
    scareGfx.fillStyle(0x8B4513, 1);
    scareGfx.fillRect(scareX * TILE_SIZE + 4, scareY * TILE_SIZE + 4, 8, 6);
    scareGfx.fillStyle(0xFFD700, 1);
    scareGfx.fillRect(scareX * TILE_SIZE + 5, scareY * TILE_SIZE + 5, 6, 1);
    scareGfx.fillStyle(0xFFFFFF, 1);
    scareGfx.fillRect(scareX * TILE_SIZE + 6, scareY * TILE_SIZE + 6, 2, 2);
    if (this._collisionMap[scareY] !== undefined) {
      this._collisionMap[scareY][scareX] = true;
    }
  }

  /* ═══════════════════════════════════════════════════
     MARKET STALLS
     ═══════════════════════════════════════════════════ */

  _placeMarketStalls() {
    const stallPositions = [
      { x: 6, y: 36 }, { x: 10, y: 36 }, { x: 14, y: 36 },
      { x: 6, y: 40 }, { x: 10, y: 40 }, { x: 14, y: 40 }
    ];
    for (const s of stallPositions) {
      const gfx = this.add.graphics().setDepth(4);
      // Stall roof
      gfx.fillStyle(0x8B4513, 1);
      gfx.fillRect(s.x * TILE_SIZE - 4, s.y * TILE_SIZE - 6, TILE_SIZE + 8, 6);
      gfx.fillStyle(0xDAA520, 0.6);
      gfx.fillRect(s.x * TILE_SIZE, s.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      // Stall items
      gfx.fillStyle(Phaser.Math.RND.pick([0xF1C40F, 0xE74C3C, 0x2ECC71, 0x3498DB]), 1);
      gfx.fillCircle(s.x * TILE_SIZE + 8, s.y * TILE_SIZE + 8, 3);
    }
  }

  /* ═══════════════════════════════════════════════════
     FLOWERS
     ═══════════════════════════════════════════════════ */

  _spawnFlowers() {
    const flowerColors = [
      { color: 0xFF6B6B, rarity: 'common' },
      { color: 0xFFD93D, rarity: 'common' },
      { color: 0x6BCB77, rarity: 'common' },
      { color: 0x4D96FF, rarity: 'uncommon' },
      { color: 0xFF8E9E, rarity: 'uncommon' },
      { color: 0xC084FC, rarity: 'rare' },
      { color: 0xF472B6, rarity: 'epic' },
      { color: 0xFFD700, rarity: 'legendary' }
    ];

    for (let y = 2; y < MAP_H - 2; y++) {
      for (let x = 2; x < MAP_W - 2; x++) {
        if (this._collisionMap[y][x]) continue;
        if (this._isOnPath(x, y)) continue;
        if (Math.random() < 0.03) {
          const flower = Phaser.Math.RND.pick(flowerColors);
          const gfx = this.add.graphics().setDepth(3);
          gfx.fillStyle(flower.color, 1);
          gfx.fillCircle(x * TILE_SIZE + 8, y * TILE_SIZE + 6, 3);
          gfx.fillStyle(0x4A7C3F, 1);
          gfx.fillRect(x * TILE_SIZE + 7, y * TILE_SIZE + 8, 2, 6);

          const fObj = {
            sprite: gfx,
            _tileX: x,
            _tileY: y,
            _flowerType: flower.rarity,
            _flowerRarity: flower.rarity,
            _flowerValue: flower.rarity === 'legendary' ? 100 :
                          flower.rarity === 'epic' ? 50 :
                          flower.rarity === 'rare' ? 25 : 10,
            _objKey: 'flower'
          };
          this._activeFlowers.push(fObj);
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     NPC — FLORA THE BOTANIST
     ═══════════════════════════════════════════════════ */

  _placeNPC() {
    const npcX = 8, npcY = 9;
    this._npc = this.add.sprite(
      npcX * TILE_SIZE + TILE_SIZE / 2,
      npcY * TILE_SIZE + TILE_SIZE / 2,
      'player-sheet', 16
    ).setDepth(6).setTint(0x7BA87B); // Tint green for Flora

    this._npc._tileX = npcX;
    this._npc._tileY = npcY;
    this._npc._objKey = 'npc';

    // Name label
    this.add.text(
      npcX * TILE_SIZE + TILE_SIZE / 2,
      npcY * TILE_SIZE - 6,
      '🌸 Flora',
      {
        fontFamily: 'Tahoma', fontSize: '9px', color: '#5B8C5A',
        stroke: '#000000', strokeThickness: 2
      }
    ).setOrigin(0.5, 1).setDepth(7);
  }

  /* ═══════════════════════════════════════════════════
     HUD
     ═══════════════════════════════════════════════════ */

  _buildHUD() {
    this.add.text(4, 4, 'WASD: Move | E: Interact | M: Map | ESC: Close', {
      fontFamily: 'Tahoma', fontSize: '8px', color: '#F0E8D0',
      stroke: '#000000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(20);

    this._hudCoords = this.add.text(4, 16, 'X:0 Y:0', {
      fontFamily: 'Tahoma', fontSize: '9px', color: '#D0C8B0',
      stroke: '#000000', strokeThickness: 1
    }).setScrollFactor(0).setDepth(20);

    this._hudCoins = this.add.text(4, 28, '', {
      fontFamily: 'Tahoma', fontSize: '10px', color: '#E8D080',
      stroke: '#000000', strokeThickness: 1
    }).setScrollFactor(0).setDepth(20);

    this._hudFlowers = this.add.text(4, 40, '', {
      fontFamily: 'Tahoma', fontSize: '9px', color: '#C0B8A0',
      stroke: '#000000', strokeThickness: 1
    }).setScrollFactor(0).setDepth(20);

    this._refreshHUD();
  }

  _refreshHUD() {
    const username = this._getActiveUsername();
    if (!username) {
      this._hudCoins.setText('Coins: —');
      this._hudFlowers.setText('');
      return;
    }
    const coins = EconomyService.getCoins(username);
    const flowers = EconomyService.getFlowers(username);
    this._hudCoins.setText('💰 ' + coins);
    this._hudFlowers.setText('🌸 ' + flowers.length + ' collected');
  }

  _getActiveUsername() {
    try {
      const session = JSON.parse(localStorage.getItem('retromap-active-user'));
      return session ? session.username : null;
    } catch { return null; }
  }

  /* ═══════════════════════════════════════════════════
     MINIMAP
     ═══════════════════════════════════════════════════ */

  _createMinimap() {
    this._mmW = 140;
    this._mmH = 105;
    const cam = this.cameras.main;
    this._mmX = cam.width - this._mmW - 8;
    this._mmY = 8;
    this._mmScale = 2.2;
    this._mmColors = {
      'tile-grass': 0x8BC78B,
      'tile-path': 0xC8B888,
      'tile-water': 0x6BA8D8,
      'default': 0x8BC78B
    };

    this._mmBg = this.add.graphics().setScrollFactor(0).setDepth(49);
    this._mmBg.fillStyle(0x1A1A2E, 0.85);
    this._mmBg.fillRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);
    this._mmBg.lineStyle(1, 0x7BA87B, 0.6);
    this._mmBg.strokeRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);

    this.add.text(this._mmX + 2, this._mmY - 1, '🌾 MAP', {
      fontFamily: 'Tahoma', fontSize: '7px', color: '#7BA87B'
    }).setScrollFactor(0).setDepth(51);

    this._mmGraphics = this.add.graphics().setScrollFactor(0).setDepth(50);

    // Pre-compute tile colors
    this._mmTileData = [];
    for (let y = 0; y < MAP_H; y++) {
      this._mmTileData[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        const tile = this._getTileAt(x, y);
        this._mmTileData[y][x] = this._mmColors[tile.texture] || this._mmColors.default;
      }
    }

    this._drawMinimap();

    this._mmPlayerDot = this.add.image(0, 0, 'minimap-dot')
      .setScrollFactor(0).setDepth(52);
    this._mmNPCDot = this.add.image(0, 0, 'minimap-npc')
      .setScrollFactor(0).setDepth(51);
  }

  _drawMinimap() {
    this._mmGraphics.clear();
    const s = this._mmScale;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const color = this._mmTileData[y][x];
        this._mmGraphics.fillStyle(color, 1);
        this._mmGraphics.fillRect(this._mmX + x * s, this._mmY + y * s, s, s);
      }
    }
    this._mmGraphics.lineStyle(1, 0x7BA87B, 0.4);
    this._mmGraphics.strokeRect(this._mmX, this._mmY, MAP_W * s, MAP_H * s);
  }

  _updateMinimap() {
    if (!this._mmPlayerDot || !this.player) return;
    const px = this.player.x / TILE_SIZE;
    const py = this.player.y / TILE_SIZE;
    this._mmPlayerDot.setPosition(
      this._mmX + px * this._mmScale,
      this._mmY + py * this._mmScale
    );
    if (this._mmNPCDot && this._npc) {
      this._mmNPCDot.setPosition(
        this._mmX + this._npc._tileX * this._mmScale,
        this._mmY + this._npc._tileY * this._mmScale
      );
    }
  }

  _toggleMinimapSize() {
    this._minimapLarge = !this._minimapLarge;
    this._mmW = this._minimapLarge ? 280 : 140;
    this._mmH = this._minimapLarge ? 210 : 105;
    this._mmX = this.cameras.main.width - this._mmW - 8;
    this._mmScale = this._minimapLarge ? 4.4 : 2.2;

    this._mmBg.clear();
    this._mmBg.fillStyle(0x1A1A2E, 0.9);
    this._mmBg.fillRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);
    this._mmBg.lineStyle(1, 0x7BA87B, 0.6);
    this._mmBg.strokeRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);

    this._drawMinimap();
  }

  /* ═══════════════════════════════════════════════════
     FOG OF WAR
     ═══════════════════════════════════════════════════ */

  _createFogOfWar() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this._fogRT = this.add.renderTexture(0, 0, w, h)
      .setScrollFactor(0).setDepth(48).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this._fogRT.fill(0x000000, 0.88);
  }

  _updateFog() {
    if (!this.player || !this._fogRT) return;
    const cam = this.cameras.main;
    this._fogRT.clear();
    this._fogRT.fill(0x000000, 0.88);
    const sx = this.player.x - cam.scrollX - 80;
    const sy = this.player.y - cam.scrollY - 88;
    this._fogRT.erase('fog-reveal', sx, sy);
  }

  /* ═══════════════════════════════════════════════════
     GAME LOOP
     ═══════════════════════════════════════════════════ */

  update(time, delta) {
    if (this._npcDialogueOpen) return;

    this._handleMovement(delta);
    this._checkNearbyObjects();

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this._doInteract();
    }
    if (Phaser.Input.Keyboard.JustDown(this.mapKey)) {
      this._toggleMinimapSize();
    }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this._closeNPCDialogue();
    }

    this._updateFog();
    this._updateMinimap();
  }

  _handleMovement(delta) {
    const speed = 80;
    const dt = delta / 1000;
    let dx = 0, dy = 0;
    let dir = this.player._dir || 'down';
    let moving = false;

    if (this.cursors.left.isDown || this.wasd.left.isDown) { dx = -1; dir = 'left'; moving = true; }
    else if (this.cursors.right.isDown || this.wasd.right.isDown) { dx = 1; dir = 'right'; moving = true; }
    if (this.cursors.up.isDown || this.wasd.up.isDown) { dy = -1; dir = 'up'; moving = true; }
    else if (this.cursors.down.isDown || this.wasd.down.isDown) { dy = 1; dir = 'down'; moving = true; }

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    this.player._dir = dir;
    this.player._moving = moving;

    const newX = this.player.x + dx * speed * dt;
    const newY = this.player.y + dy * speed * dt;

    if (this._canMoveTo(newX, newY)) {
      this.player.x = Phaser.Math.Clamp(newX, 8, MAP_W * TILE_SIZE - 8);
      this.player.y = Phaser.Math.Clamp(newY, 8, MAP_H * TILE_SIZE - 8);
    }

    this.shadow.x = this.player.x;
    this.shadow.y = this.player.y + 16;

    // Player animation
    if (moving) {
      this.player.play('walk-' + dir, true);
    } else {
      this.player.stop();
      this.player.setTexture('player-sheet', 16); // idle-down
    }

    const tx = Math.round(this.player.x / TILE_SIZE);
    const ty = Math.round(this.player.y / TILE_SIZE);
    this._hudCoords.setText('📍 ' + tx + ', ' + ty + ' | ' + this._getZoneLabel(tx, ty));

    // Track explored tiles
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        this._exploredTiles.add((tx + dx) + ',' + (ty + dy));
      }
    }
  }

  _getZoneLabel(x, y) {
    for (const [name, zone] of Object.entries(ZONES)) {
      if (this._isInZone(zone, x, y)) return zone.label;
    }
    return '🌿 Pastures';
  }

  _canMoveTo(x, y) {
    const ts = TILE_SIZE;
    const margin = 4;
    const points = [
      { x: x - margin, y: y - margin },
      { x: x + margin, y: y - margin },
      { x: x - margin, y: y + margin },
      { x: x + margin, y: y + margin }
    ];
    for (const pt of points) {
      const tileX = Math.floor(pt.x / ts);
      const tileY = Math.floor(pt.y / ts);
      if (tileY < 0 || tileY >= this._collisionMap.length ||
          tileX < 0 || tileX >= this._collisionMap[0].length) return false;
      if (this._collisionMap[tileY] && this._collisionMap[tileY][tileX]) return false;
    }
    return true;
  }

  /* ═══════════════════════════════════════════════════
     INTERACTIONS
     ═══════════════════════════════════════════════════ */

  _checkNearbyObjects() {
    const px = this.player.x / TILE_SIZE;
    const py = this.player.y / TILE_SIZE;

    // Check NPC
    if (this._npc) {
      const dist = Math.abs(this._npc._tileX - px) + Math.abs(this._npc._tileY - py);
      if (dist <= 1.5) {
        this._interactPrompt.setText('[E] Talk to Flora');
        this._interactPrompt.setPosition(this._npc.x, this._npc.y - 14);
        this._interactPrompt.setVisible(true);
        this._nearObject = this._npc;
        return;
      }
    }

    // Check flowers
    for (const f of this._activeFlowers) {
      const dist = Math.abs(f._tileX - px) + Math.abs(f._tileY - py);
      if (dist <= 1.2) {
        const label = f._flowerType || 'flower';
        this._interactPrompt.setText('[E] Pick ' + label + ' (' + f._flowerRarity + ')');
        this._interactPrompt.setPosition(
          f._tileX * TILE_SIZE + TILE_SIZE / 2,
          f._tileY * TILE_SIZE - 4
        );
        this._interactPrompt.setVisible(true);
        this._nearObject = f;
        return;
      }
    }

    this._interactPrompt.setVisible(false);
    this._nearObject = null;
  }

  _doInteract() {
    if (!this._nearObject) return;
    const obj = this._nearObject;

    if (obj._objKey === 'npc') {
      this._openNPCDialogue();
      return;
    }

    if (obj._objKey === 'flower') {
      this._pickFlower(obj);
      return;
    }

    const msgs = {
      tree: 'A beautiful oak tree full of leaves.',
      rock: 'A sturdy farm rock.',
      sign: 'Welcome to RetroMap Farm! 🌾',
      chest: 'A mailbox. No mail today.',
      mushroom: 'A cute little mushroom!',
      bush: 'A berry bush. Yummy!',
      well: 'An old stone well. The water is clear.',
      scarecrow: 'A scarecrow watching over the crops.'
    };
    this._showFloatingText(this.player.x, this.player.y - 20,
      msgs[obj._objKey] || 'A lovely part of the farm! 🌻');
  }

  _pickFlower(fObj) {
    const username = this._getActiveUsername();
    if (!username) {
      this._showFloatingText(this.player.x, this.player.y - 20, 'Sign in to collect!');
      return;
    }

    EconomyService.collectFlower(username, fObj._flowerType,
      fObj._flowerRarity, fObj._tileX, fObj._tileY);

    if (fObj.sprite) fObj.sprite.destroy();
    this._activeFlowers = this._activeFlowers.filter(f => f !== fObj);
    this._nearObject = null;
    this._interactPrompt.setVisible(false);

    this._showFloatingText(this.player.x, this.player.y - 20,
      '🌸 ' + fObj._flowerType + '! (' + fObj._flowerRarity + ')');
    this._refreshHUD();
  }

  /* ═══════════════════════════════════════════════════
     NPC DIALOGUE (unchanged from original)
     ═══════════════════════════════════════════════════ */

  _openNPCDialogue() { /* Full NPC dialogue - same as before */ this._npcDialogueOpen = true;
    this._interactPrompt.setVisible(false);

    this._dialogueOverlay = this.add.rectangle(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2,
      this.cameras.main.width, this.cameras.main.height,
      0x000000, 0.4
    ).setScrollFactor(0).setDepth(50).setInteractive();

    const panelW = 280, panelH = 200;
    const panelX = this.cameras.main.scrollX + (this.cameras.main.width - panelW) / 2;
    const panelY = this.cameras.main.scrollY + (this.cameras.main.height - panelH) / 2;

    this._dialoguePanel = this.add.graphics().setDepth(51);
    this._dialoguePanel.fillStyle(0xECE9D8, 1);
    this._dialoguePanel.fillRect(panelX, panelY, panelW, panelH);
    this._dialoguePanel.lineStyle(2, 0x0A246A, 1);
    this._dialoguePanel.strokeRect(panelX, panelY, panelW, panelH);
    this._dialoguePanel.fillStyle(0x0A246A, 1);
    this._dialoguePanel.fillRect(panelX + 2, panelY + 2, panelW - 4, 18);

    this._dialogueTitle = this.add.text(panelX + 8, panelY + 4, '🌸 Flora the Botanist', {
      fontFamily: 'Tahoma', fontSize: '11px', color: '#FFFFFF', fontStyle: 'bold'
    }).setDepth(52);

    this._dialogueText = this.add.text(panelX + 12, panelY + 28, '', {
      fontFamily: 'Tahoma', fontSize: '10px', color: '#000000',
      wordWrap: { width: panelW - 30 }
    }).setDepth(52);

    this._dialogueButtons = [];
    this._renderNPCMainScreen(panelX, panelY, panelW, panelH);
  }

  _renderNPCMainScreen(panelX, panelY, panelW, panelH) {
    const username = this._getActiveUsername();
    const flowers = username ? EconomyService.getFlowers(username) : [];
    const coins = username ? EconomyService.getCoins(username) : 0;
    let msg = 'Welcome to the farm, neighbor! 🌻\n\n';
    msg += 'I tend to the flowers and crops here.\n';
    msg += '🌸 Pick flowers you find around the farm.\n';
    msg += '💰 Bring them to me and I\'ll buy them!\n';
    msg += '✨ Use coins to customize your profile.\n\n';
    if (username) msg += 'You have ' + coins + ' coins.';
    else msg = 'Welcome! Sign in to explore the farm!';

    this._dialogueText.setText(msg);
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];

    if (flowers.length > 0) {
      this._createDialogueButton(panelX + 12, panelY + panelH - 72, 120, 22,
        'Sell Flowers (' + flowers.length + ')',
        () => this._renderSellScreen(panelX, panelY, panelW, panelH));
    }
    this._createDialogueButton(panelX + 140, panelY + panelH - 72, 130, 22,
      'Profile Customization',
      () => this._renderCustomizeScreen(panelX, panelY, panelW, panelH));
    this._createDialogueButton(panelX + 12, panelY + panelH - 48, 120, 22,
      'Art Supplies',
      () => this._renderArtSupplies(panelX, panelY, panelW, panelH));
    this._createDialogueButton(panelX + panelW - 80, panelY + panelH - 26, 70, 20,
      'Goodbye', () => this._closeNPCDialogue());
  }

  _createDialogueButton(x, y, w, h, label, onClick) {
    const bg = this.add.graphics().setDepth(53);
    bg.fillStyle(0xD4D0C8, 1); bg.fillRect(x, y, w, h);
    bg.lineStyle(1, 0x808080, 1); bg.strokeRect(x, y, w, h);
    bg.lineStyle(1, 0xFFFFFF, 1);
    bg.strokeRect(x + 1, y + 1, w - 2, 1);
    bg.strokeRect(x + 1, y + 1, 1, h - 2);
    const txt = this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: 'Tahoma', fontSize: '10px', color: '#000000'
    }).setOrigin(0.5).setDepth(54);
    const hitArea = this.add.rectangle(x + w / 2, y + h / 2, w, h)
      .setDepth(55).setInteractive({ useHandCursor: true }).setScrollFactor(0);
    hitArea.on('pointerdown', () => onClick());
    this._dialogueButtons.push(bg, txt, hitArea);
  }

  _renderSellScreen(panelX, panelY, panelW, panelH) {
    const username = this._getActiveUsername();
    const flowers = username ? EconomyService.getFlowers(username) : [];
    this._dialogueText.setText('Pick a flower to sell:');
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    let yOff = panelY + 44;
    const maxShow = Math.min(flowers.length, 5);
    for (let i = 0; i < maxShow; i++) {
      const f = flowers[i];
      const label = EconomyService.getFlowerTypeLabel(f.type);
      const value = EconomyService.getFlowerValue(f.rarity);
      const colors = { common: '#808080', uncommon: '#4A90D9', rare: '#9B59B6', epic: '#F1C40F', legendary: '#E91E63' };
      const color = colors[f.rarity] || '#000000';
      const fText = this.add.text(panelX + 16, yOff,
        label + ' (' + f.rarity + ') — ' + value + ' coins',
        { fontFamily: 'Tahoma', fontSize: '10px', color }
      ).setDepth(53);
      this._dialogueButtons.push(fText);
      this._createDialogueButton(panelX + panelW - 70, yOff - 2, 58, 16, 'Sell', () => {
        EconomyService.removeFlower(username, f.id);
        EconomyService.addCoins(username, value);
        this._showFloatingText(this._npc.x, this._npc.y - 20, 'Sold ' + label + '!');
        this._refreshHUD();
        this._closeNPCDialogue();
      });
      yOff += 20;
    }
    this._createDialogueButton(panelX + 12, panelY + panelH - 30, 60, 20, 'Back',
      () => this._renderNPCMainScreen(panelX, panelY, panelW, panelH));
  }

  _renderCustomizeScreen(panelX, panelY, panelW, panelH) {
    const username = this._getActiveUsername();
    const coins = username ? EconomyService.getCoins(username) : 0;
    this._dialogueText.setText('Customize your profile! Coins: ' + coins);
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    let yOff = panelY + 44;
    const categories = [
      { id: 'frames', label: 'Avatar Frames' },
      { id: 'nameColors', label: 'Name Color' },
      { id: 'themes', label: 'Theme' }
    ];
    for (const cat of categories) {
      this._createDialogueButton(panelX + 12, yOff, panelW - 24, 20, cat.label,
        () => this._renderShopCategory(panelX, panelY, panelW, panelH, cat.id));
      yOff += 24;
    }
    if (username) {
      const cust = EconomyService.getCustomizations(username);
      if (cust) {
        yOff += 4;
        const summary = this.add.text(panelX + 16, yOff,
          'Equipped: ' + (cust.frame || 'none') + ' | ' + (cust.nameColor || 'default') + ' | ' + (cust.theme || 'blue'),
          { fontFamily: 'Tahoma', fontSize: '8px', color: '#808080' }
        ).setDepth(53);
        this._dialogueButtons.push(summary);
      }
    }
    this._createDialogueButton(panelX + 12, panelY + panelH - 30, 60, 20, 'Back',
      () => this._renderNPCMainScreen(panelX, panelY, panelW, panelH));
  }

  _renderShopCategory(panelX, panelY, panelW, panelH, category) {
    const username = this._getActiveUsername();
    const items = EconomyService.CUSTOMIZATIONS[category];
    const cust = username ? EconomyService.getCustomizations(username) : null;
    const coins = username ? EconomyService.getCoins(username) : 0;
    const catLabels = { frames: 'Avatar Frames', nameColors: 'Name Color', themes: 'Theme' };
    this._dialogueText.setText(catLabels[category] || category + ' — Coins: ' + coins);
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    let yOff = panelY + 44;
    const maxShow = 7;
    let count = 0;
    for (const item of items) {
      if (count >= maxShow) break;
      const isOwned = item.cost === 0;
      const isEquipped = cust && cust[EconomyService._catToType(category)] === item.id;
      let status = '';
      if (isEquipped) status = ' [Equipped]';
      else if (item.cost === 0) status = ' [Free]';
      else status = ' — ' + item.cost + ' coins';
      const color = item.color || '#000000';
      const fText = this.add.text(panelX + 16, yOff, item.label + status,
        { fontFamily: 'Tahoma', fontSize: '10px', color }
      ).setDepth(53);
      this._dialogueButtons.push(fText);
      if (!isEquipped) {
        const btnLabel = item.cost === 0 ? 'Equip' : (coins >= item.cost ? 'Buy' : '—');
        if (btnLabel !== '—') {
          this._createDialogueButton(panelX + panelW - 65, yOff - 2, 52, 16, btnLabel, () => {
            if (item.cost === 0) {
              EconomyService.updateCustomization(username, EconomyService._catToType(category), item.id);
            } else {
              const result = EconomyService.purchaseCustomization(username, category, item.id);
              if (!result.success) {
                this._showFloatingText(this._npc.x, this._npc.y - 20, result.reason);
                this._closeNPCDialogue();
                return;
              }
            }
            if (category === 'themes' && item.id !== 'blue') RetroMap.setTheme(item.id);
            else if (category === 'themes') RetroMap.setTheme('blue');
            this._showFloatingText(this._npc.x, this._npc.y - 20, 'Equipped ' + item.label + '!');
            this._refreshHUD();
            this._closeNPCDialogue();
          });
        }
      }
      yOff += 18;
      count++;
    }
    this._createDialogueButton(panelX + 12, panelY + panelH - 30, 60, 20, 'Back',
      () => this._renderCustomizeScreen(panelX, panelY, panelW, panelH));
  }

  _renderArtSupplies(panelX, panelY, panelW, panelH) { /* Preserved */ this._closeNPCDialogue(); SocialShell.switchView('editor'); }

  _closeNPCDialogue() {
    if (!this._npcDialogueOpen) return;
    this._npcDialogueOpen = false;
    if (this._dialogueOverlay) this._dialogueOverlay.destroy();
    if (this._dialoguePanel) this._dialoguePanel.destroy();
    if (this._dialogueTitle) this._dialogueTitle.destroy();
    if (this._dialogueText) this._dialogueText.destroy();
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    this._dialogueOverlay = null;
    this._dialoguePanel = null;
    this._dialogueTitle = null;
    this._dialogueText = null;
  }

  /* ═══════════════════════════════════════════════════
     PLACED ART
     ═══════════════════════════════════════════════════ */

  _renderPlacedArt() {
    if (this._placedArtSprites) {
      for (const s of this._placedArtSprites) s.destroy();
    }
    this._placedArtSprites = [];
    const username = this._getActiveUsername();
    if (!username) return;
    const artPieces = EconomyService.getAllPlacedArt(username);
    if (!artPieces || artPieces.length === 0) return;
    for (const piece of artPieces) {
      const dim = Math.max(piece.tilesW, piece.tilesH) * 16;
      const textureKey = 'art-' + piece.canvasId;
      if (!this.textures.exists(textureKey)) {
        const gfx = this.make.graphics({ add: false });
        const data = piece.pixelData;
        if (data) {
          for (let i = 0; i < data.length; i++) {
            const px = i % dim;
            const py = Math.floor(i / dim);
            const color = data[i];
            if (color && color !== '#00000000') {
              gfx.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
            } else {
              gfx.fillStyle(0x000000, 0);
            }
            gfx.fillRect(px, py, 1, 1);
          }
        }
        gfx.generateTexture(textureKey, dim, dim);
        gfx.destroy();
      }
      const wx = piece.tileX * this.tileSize + (piece.tilesW * this.tileSize) / 2;
      const wy = piece.tileY * this.tileSize + (piece.tilesH * this.tileSize) / 2;
      const sprite = this.add.image(wx, wy, textureKey).setDepth(4);
      this._placedArtSprites.push(sprite);
    }
  }

  _showFloatingText(x, y, msg) {
    const txt = this.add.text(x, y, msg, {
      fontFamily: 'Tahoma', fontSize: '9px', color: '#FFFFFF',
      stroke: '#000000', strokeThickness: 2, align: 'center'
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({
      targets: txt, y: txt.y - 20, alpha: 0,
      duration: 2000, ease: 'Power1',
      onComplete: () => txt.destroy()
    });
  }
}
