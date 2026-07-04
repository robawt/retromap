/* ═══════════════════════════════════════════════════════
   RetroMap — Game Scene (Cute Farm World)
   CORRECTED sprite sizes, animations, tile usage
   ═══════════════════════════════════════════════════════ */

const MAP_W = 64;
const MAP_H = 48;
const TILE_SIZE = 16;

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
  FLORA_GARDEN: { x1: 2, y1: 4, x2: 14, y2: 12, label: "🌸 Flora's Garden" }
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

    // Build the farm world
    this._generateFarmWorld();
    this._spawnPlayer(27, 14);
    this._placeFarmhouse();
    this._placeCrops();
    this._placeAnimals();
    this._placeDecorations();
    this._placePond();
    this._placeForest();
    this._placeMarketStalls();
    this._spawnFlowers();
    this._placeNPC();

    // ─── Camera ───
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);
    this.cameras.main.setZoom(1.5);

    // ─── Minimap ───
    this._createMinimap();

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

    this._hudTimer = this.time.addEvent({ delay: 3000, callback: () => this._refreshHUD(), loop: true });
    this._animalTimer = this.time.addEvent({ delay: 2000, callback: () => this._wanderAnimals(), loop: true });

    this.events.on('shutdown', () => {
      if (this._hudTimer) this._hudTimer.destroy();
      if (this._animalTimer) this._animalTimer.destroy();
    });

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
        this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          tile.texture
        ).setDepth(0);
        this._collisionMap[y][x] = tile.blocked;
      }
    }
  }

  _getTileAt(x, y) {
    // Border — water
    if (y === 0 || y >= MAP_H - 1 || x === 0 || x >= MAP_W - 1) {
      const variant = (x * 3 + y * 7) % 18;
      if (this.textures.exists('water-tile-' + variant)) return { texture: 'water-tile-' + variant, blocked: true };
      return { texture: 'tile-water', blocked: true };
    }
    // Cliff transition ring — elevation edge between water and land (tinyswords principle)
    if (y === 1 || y === MAP_H - 2 || x === 1 || x === MAP_W - 2) {
      const cliffIdx = (x * 5 + y * 7) % 18;
      if (this.textures.exists('cliff-tile-' + cliffIdx)) return { texture: 'cliff-tile-' + cliffIdx, blocked: true };
      return { texture: 'tile-grass', blocked: true };
    }

    // Pond zone — water tile variants with beach edge transition (tinyswords terrain color variants)
    if (this._isInZone(ZONES.POND, x, y)) {
      const cx = 30, cy = 36;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= 4) {
        const variant = (x * 5 + y * 3) % 18;
        if (this.textures.exists('water-tile-' + variant)) return { texture: 'water-tile-' + variant, blocked: true };
        return { texture: 'tile-water', blocked: true };
      }
      // Beach/sand transition between water and grass (terrain color variant)
      if (dist <= 5) {
        const beachIdx = (x * 7 + y * 11) % 15;
        if (this.textures.exists('beach-tile-' + beachIdx)) return { texture: 'beach-tile-' + beachIdx, blocked: false };
        return { texture: 'tile-grass', blocked: false };
      }
      return { texture: 'tile-path', blocked: false };
    }

    // Farmhouse area — elevated feel with path border
    if (this._isInZone(ZONES.FARMHOUSE, x, y)) {
      // Use path tiles for the house foundation/patio area
      if (y >= 8 && y <= 12 && x >= 27 && x <= 31) {
        return { texture: 'tile-path', blocked: y <= 10 }; // patio walkable at door level
      }
      return { texture: 'tile-grass', blocked: false };
    }

    // Crops — farmland tile variants
    if (this._isInZone(ZONES.CROPS, x, y)) {
      const variant = (x * 3 + y * 7) % 9;
      if (this.textures.exists('farmland-' + variant)) return { texture: 'farmland-' + variant, blocked: false };
      return { texture: 'tile-grass', blocked: false };
    }

    // Animal areas — grass
    if (this._isInZone(ZONES.CHICKENS, x, y) || this._isInZone(ZONES.COWS, x, y) ||
        this._isInZone(ZONES.PIGS, x, y) || this._isInZone(ZONES.SHEEP, x, y)) {
      return { texture: 'tile-grass', blocked: false };
    }

    // Forest — darker grass with path edges (elevated forest feel)
    if (this._isInZone(ZONES.FOREST, x, y)) {
      if (x === ZONES.FOREST.x1 || x === ZONES.FOREST.x2 || y === ZONES.FOREST.y1 || y === ZONES.FOREST.y2) {
        const cliffIdx = (x * 3 + y * 5) % 18;
        if (this.textures.exists('cliff-tile-' + cliffIdx)) return { texture: 'cliff-tile-' + cliffIdx, blocked: false };
      }
      return { texture: 'tile-grass', blocked: false };
    }

    // Market — path/gravel tiles
    if (this._isInZone(ZONES.MARKET, x, y)) {
      const variant = (x * 3 + y * 7) % 18;
      if ((x + y) % 3 === 0 && this.textures.exists('path-tile-' + variant)) {
        return { texture: 'path-tile-' + variant, blocked: false };
      }
      return { texture: 'tile-grass', blocked: false };
    }

    // Flora's Garden — lighter grass with flower patches
    if (this._isInZone(ZONES.FLORA_GARDEN, x, y)) {
      if ((x + y) % 3 === 0) {
        const beachIdx = (x * 5 + y * 7) % 15;
        if (this.textures.exists('beach-tile-' + beachIdx)) return { texture: 'beach-tile-' + beachIdx, blocked: false };
      }
      return { texture: 'tile-grass', blocked: false };
    }

    // Path network — use path tile variants
    if (this._isOnPath(x, y)) {
      const variant = (x * 3 + y * 7) % 18;
      if (this.textures.exists('path-tile-' + variant)) return { texture: 'path-tile-' + variant, blocked: false };
      return { texture: 'tile-path', blocked: false };
    }

    return { texture: 'tile-grass', blocked: false };
  }

  _isInZone(zone, x, y) { return x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2; }

  _isOnPath(x, y) {
    if (x >= 26 && x <= 28 && y >= 14 && y <= 46) return true;
    if (y === 14 && x >= 4 && x <= 34) return true;
    if (y === 24 && x >= 20 && x <= 52) return true;
    if (x === 22 && y >= 14 && y <= 34) return true;
    if (x === 38 && y >= 14 && y <= 34) return true;
    if (y === 34 && x >= 4 && x <= 38) return true;
    if (x === 16 && y >= 4 && y <= 14) return true;
    if (y === 4 && x >= 14 && x <= 20) return true;
    if (x === 44 && y >= 2 && y <= 24) return true;
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
      'player-sheet', 1  // Frame 1 = standing/center facing down
    ).setDepth(10).setScale(0.55);  // 48×64 → ~26×35px (1.6×2.2 tiles)

    this.player._dir = 'down';
    this.player._moving = false;

    this.shadow = this.add.ellipse(
      this.player.x, this.player.y + 16, 12, 5, 0x000000, 0.25
    ).setDepth(9);
  }

  /* ═══════════════════════════════════════════════════
     FARM FEATURES
     ═══════════════════════════════════════════════════ */

  _placeFarmhouse() {
    // ─── Shadow under house (tinyswords elevation principle) ───
    this.add.ellipse(29 * TILE_SIZE, 9 * TILE_SIZE + 6, 64, 12, 0x000000, 0.12).setDepth(4);
    // House sprite (96×128) — placed at its bottom-center
    this.add.image(29 * TILE_SIZE, 9 * TILE_SIZE, 'house')
      .setDepth(5).setOrigin(0.5, 1).setScale(1);

    // Collision for house area
    for (let dy = 2; dy <= 9; dy++) {
      for (let dx = 25; dx <= 32; dx++) {
        if (this._collisionMap[dy] !== undefined) this._collisionMap[dy][dx] = true;
      }
    }
    // Path to door
    for (let dx = 28; dx <= 30; dx++) {
      if (this._collisionMap[11] !== undefined) this._collisionMap[11][dx] = false;
    }
    // Mailbox with shadow
    this.add.ellipse(25 * TILE_SIZE + TILE_SIZE / 2, 12 * TILE_SIZE + 4, 10, 4, 0x000000, 0.12).setDepth(3);
    this.add.image(25 * TILE_SIZE + TILE_SIZE / 2, 12 * TILE_SIZE, 'chest')
      .setDepth(4).setScale(1.5);
  }

  _placeCrops() {
    for (let y = 16; y <= 26; y += 2) {
      for (let x = 6; x <= 20; x += 2) {
        if (Math.random() < 0.7) {
          const cropGfx = this.add.graphics().setDepth(2);
          cropGfx.fillStyle(0x4A7C3F, 1);
          for (let i = 0; i < 3; i++) {
            cropGfx.fillRect(x * TILE_SIZE + 3, y * TILE_SIZE + 2 + i * 5, 2, 3);
          }
          this._collisionMap[y][x] = true;
          this._collisionMap[y][x + 1] = true;
          this._crops.push({ x, y, grown: Math.random() > 0.3 });
        }
      }
    }
  }

  _placeAnimals() {
    const ANIMALS_CONFIG = [
      { type: 'chicken', positions: [{x:34,y:18},{x:36,y:20},{x:38,y:17},{x:35,y:21},{x:37,y:19}],
        scale: 0.45, speed: 0.3, depth: 4 },
      { type: 'cow', positions: [{x:44,y:18},{x:47,y:20},{x:50,y:22},{x:45,y:22},{x:48,y:18}],
        scale: 0.65, speed: 0.15, depth: 4 },
      { type: 'pig', positions: [{x:44,y:28},{x:47,y:30},{x:50,y:32},{x:46,y:32},{x:49,y:28}],
        scale: 0.55, speed: 0.2, depth: 4 },
      { type: 'sheep', positions: [{x:34,y:26},{x:36,y:28},{x:38,y:30},{x:35,y:30},{x:37,y:26}],
        scale: 0.55, speed: 0.18, depth: 4 }
    ];

    for (const cfg of ANIMALS_CONFIG) {
      for (const pos of cfg.positions) {
        const animal = this.add.sprite(
          pos.x * TILE_SIZE + TILE_SIZE / 2,
          pos.y * TILE_SIZE + TILE_SIZE / 2,
          'animal-' + cfg.type, 0
        ).setDepth(cfg.depth).setScale(cfg.scale);
        animal._tileX = pos.x;
        animal._tileY = pos.y;
        animal._speed = cfg.speed;
        animal._animalType = cfg.type;
        // Play idle animation if available — staggered start (tinyswords stagger principle)
        const animKey = 'animal-' + cfg.type + '-idle';
        if (this.anims.exists(animKey)) {
          animal.play(animKey);
          // Stagger animation offset to prevent synchronized movement
          animal.anims.setTimeScale(0.8 + Math.random() * 0.4);
          animal.anims.setProgress(Math.random());
        }
        this._animals.push(animal);
      }
    }

    this._addFences();
  }

  _addFences() {
    const fenceConfigs = [
      { x1: 32, x2: 41, y: 15 }, { x1: 32, x2: 41, y: 23 },
      { x: 32, y1: 15, y2: 23 }, { x: 40, y1: 15, y2: 23 },
      { x1: 42, x2: 53, y: 15 }, { x1: 42, x2: 53, y: 25 },
      { x: 42, y1: 15, y2: 25 }, { x: 52, y1: 15, y2: 25 },
      { x1: 42, x2: 53, y: 25 }, { x1: 42, x2: 53, y: 35 },
      { x: 42, y1: 25, y2: 35 }, { x: 52, y1: 25, y2: 35 },
      { x1: 32, x2: 41, y: 23 }, { x1: 32, x2: 41, y: 33 },
      { x: 32, y1: 23, y2: 33 }, { x: 40, y1: 23, y2: 33 }
    ];
    for (const cfg of fenceConfigs) {
      if (cfg.y !== undefined) {
        for (let x = cfg.x1; x <= cfg.x2; x++) {
          if (this._collisionMap[cfg.y] !== undefined) this._collisionMap[cfg.y][x] = true;
        }
      } else {
        for (let y = cfg.y1; y <= cfg.y2; y++) {
          if (this._collisionMap[y] !== undefined) this._collisionMap[y][cfg.x] = true;
        }
      }
    }
    // Render fence visuals using sliced textures
    for (const cfg of fenceConfigs) {
      if (cfg.y !== undefined) {
        for (let x = cfg.x1; x <= cfg.x2; x++) {
          const gfx = this.add.graphics().setDepth(4);
          gfx.fillStyle(0x6B4226, 1);
          gfx.fillRect(x * TILE_SIZE + 2, cfg.y * TILE_SIZE + 2, 4, 12);
          gfx.fillStyle(0x8B5E3C, 1);
          gfx.fillRect(x * TILE_SIZE + 1, cfg.y * TILE_SIZE + 4, 6, 2);
          gfx.fillRect(x * TILE_SIZE + 1, cfg.y * TILE_SIZE + 9, 6, 2);
        }
      } else {
        for (let y = cfg.y1; y <= cfg.y2; y++) {
          const gfx = this.add.graphics().setDepth(4);
          gfx.fillStyle(0x6B4226, 1);
          gfx.fillRect(cfg.x * TILE_SIZE + 2, y * TILE_SIZE + 2, 12, 4);
          gfx.fillStyle(0x8B5E3C, 1);
          gfx.fillRect(cfg.x * TILE_SIZE + 4, y * TILE_SIZE + 1, 2, 6);
          gfx.fillRect(cfg.x * TILE_SIZE + 9, y * TILE_SIZE + 1, 2, 6);
        }
      }
    }
    // Gates
    this._collisionMap[24][47] = false; this._collisionMap[24][48] = false;
    this._collisionMap[34][47] = false; this._collisionMap[34][48] = false;
    this._collisionMap[32][36] = false; this._collisionMap[32][37] = false;
  }

  _wanderAnimals() {
    for (const animal of this._animals) {
      const dx = Math.round((Math.random() - 0.5) * 2);
      const dy = Math.round((Math.random() - 0.5) * 2);
      const nx = animal._tileX + dx;
      const ny = animal._tileY + dy;
      if (nx > 0 && nx < MAP_W - 1 && ny > 0 && ny < MAP_H - 1) {
        if (!this._collisionMap[ny][nx]) {
          animal._tileX = nx;
          animal._tileY = ny;
        }
      }
      this.tweens.add({
        targets: animal,
        x: animal._tileX * TILE_SIZE + TILE_SIZE / 2,
        y: animal._tileY * TILE_SIZE + TILE_SIZE / 2,
        duration: 600, ease: 'Sine.easeInOut'
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     POND with BRIDGE
     ═══════════════════════════════════════════════════ */

  _placePond() {
    const cx = 30, cy = 36;
    // Bridge over the pond — segments placed 48px apart (3 tiles) for seamless tiling
    const bridgeY = 36;
    if (this.textures.exists('bridge-0')) {
      this.add.image(27 * TILE_SIZE + TILE_SIZE / 2, bridgeY * TILE_SIZE + 32, 'bridge-0').setDepth(3).setOrigin(0.5, 0.5);
      this.add.image(30 * TILE_SIZE + TILE_SIZE / 2, bridgeY * TILE_SIZE + 32, 'bridge-1').setDepth(3).setOrigin(0.5, 0.5);
      this.add.image(33 * TILE_SIZE + TILE_SIZE / 2, bridgeY * TILE_SIZE + 32, 'bridge-2').setDepth(3).setOrigin(0.5, 0.5);
      // Make bridge walkable
      for (let bx = 27; bx <= 35; bx++) {
        if (this._collisionMap[bridgeY] !== undefined) this._collisionMap[bridgeY][bx] = false;
      }
    } else {
      // Fallback: use path tiles as dock
      for (let i = 0; i < 3; i++) {
        if (this._collisionMap[cy] !== undefined) this._collisionMap[cy][cx - 3 + i] = false;
      }
    }

    // Dock/pier on the south side
    for (let i = 0; i < 3; i++) {
      this.add.image((cx - 2) * TILE_SIZE + TILE_SIZE / 2, (cy - 1 + i) * TILE_SIZE + TILE_SIZE / 2, 'tile-path').setDepth(2);
      if (this._collisionMap[cy - 1 + i] !== undefined) this._collisionMap[cy - 1 + i][cx - 2] = false;
    }

    // Small island in middle
    this.add.image(cx * TILE_SIZE + TILE_SIZE / 2, cy * TILE_SIZE + TILE_SIZE / 2, 'tile-grass').setDepth(2);
    if (this._collisionMap[cy] !== undefined) this._collisionMap[cy][cx] = false;
    this._addFlowerSprite(cx, cy, 0xFFD700);
  }

  _addFlowerSprite(tx, ty, color) {
    const gfx = this.add.graphics().setDepth(3);
    gfx.fillStyle(color, 1);
    gfx.fillCircle(tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2 - 2, 3);
    gfx.fillStyle(0x22C55E, 1);
    gfx.fillRect(tx * TILE_SIZE + 7, ty * TILE_SIZE + 8, 2, 5);
  }

  /* ═══════════════════════════════════════════════════
     FOREST with oak trees (big + small)
     ═══════════════════════════════════════════════════ */

  _placeForest() {
    for (let i = 0; i < 20; i++) {
      const tx = Phaser.Math.Between(ZONES.FOREST.x1 + 1, ZONES.FOREST.x2 - 1);
      const ty = Phaser.Math.Between(ZONES.FOREST.y1 + 1, ZONES.FOREST.y2 - 1);
      if (!this._isOnPath(tx, ty)) {
        // Shadow one tile below (tinyswords shadow principle)
        this.add.ellipse(tx * TILE_SIZE + TILE_SIZE / 2, (ty + 1) * TILE_SIZE + TILE_SIZE / 2, 16, 6, 0x000000, 0.2).setDepth(4);
        const useSmall = Math.random() < 0.4;
        if (useSmall && this.textures.exists('tree-oak-small')) {
          const frame = Math.floor(Math.random() * 2);
          this.add.image(tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2, 'tree-oak-small', frame)
            .setDepth(5).setOrigin(0.5, 0.65).setScale(0.55);
        } else {
          this.add.image(tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2, 'tree-oak')
            .setDepth(5).setOrigin(0.5, 0.65).setScale(0.5);
        }
        if (this._collisionMap[ty] !== undefined) this._collisionMap[ty][tx] = true;
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     DECORATIONS (uses outdoor decor slices + graphics)
     ═══════════════════════════════════════════════════ */

  _placeDecorations() {
    // Trees around farmhouse
    const houseTrees = [
      { x: 24, y: 4 }, { x: 25, y: 3 }, { x: 33, y: 3 }, { x: 34, y: 4 }
    ];
    for (const t of houseTrees) {
      // Shadow one tile below (tinyswords principle)
      this.add.ellipse(t.x * TILE_SIZE + TILE_SIZE / 2, (t.y + 1) * TILE_SIZE + TILE_SIZE / 2, 14, 5, 0x000000, 0.2).setDepth(4);
      this.add.image(t.x * TILE_SIZE + TILE_SIZE / 2, t.y * TILE_SIZE + TILE_SIZE / 2, 'tree-oak')
        .setDepth(5).setOrigin(0.5, 0.65).setScale(0.4);
      if (this._collisionMap[t.y] !== undefined) this._collisionMap[t.y][t.x] = true;
    }

    // Decorative items using specific outdoor decor slices (purposeful, not random)
    const decorSpots = [
      { x: 23, y: 12, type: 'flower' }, { x: 35, y: 12, type: 'flower' },
      { x: 20, y: 14, type: 'mushroom' }, { x: 24, y: 16, type: 'stone' },
      { x: 38, y: 34, type: 'flower' }, { x: 20, y: 30, type: 'stone' },
      { x: 14, y: 34, type: 'mushroom' }, { x: 22, y: 28, type: 'pot' },
      { x: 4, y: 14, type: 'flower' }
    ];
    const decorRanges = {
      flower:   [0, 14],    // Rows 0-1: flowers & plants
      mushroom: [21, 28],   // Row 3: mushrooms
      stone:    [35, 42],   // Row 5: stones/rocks
      pot:      [63, 70]    // Row 9: pots & tools
    };
    for (const spot of decorSpots) {
      if (this._collisionMap[spot.y] && !this._collisionMap[spot.y][spot.x]) {
        const range = decorRanges[spot.type] || [0, 84];
        const decorIdx = Phaser.Math.Between(range[0], range[1] - 1);
        if (this.textures.exists('decor-' + decorIdx)) {
          this.add.image(
            spot.x * TILE_SIZE + TILE_SIZE / 2, spot.y * TILE_SIZE + TILE_SIZE / 2,
            'decor-' + decorIdx
          ).setDepth(4).setScale(0.8);
        } else {
          this._addFlowerSprite(spot.x, spot.y,
            Phaser.Math.RND.pick([0xFF6B6B, 0xFFD93D, 0x6BCB77, 0x4D96FF, 0xFF8E9E]));
        }
      }
    }

    // Berry bushes
    const berrySpots = [
      { x: 3, y: 4 }, { x: 4, y: 3 }, { x: 2, y: 6 }, { x: 14, y: 3 }, { x: 13, y: 4 }
    ];
    for (const spot of berrySpots) {
      if (this._collisionMap[spot.y] && !this._collisionMap[spot.y][spot.x]) {
        const gfx = this.add.graphics().setDepth(4);
        gfx.fillStyle(0x2D7D2D, 1);
        gfx.fillCircle(spot.x * TILE_SIZE + 8, spot.y * TILE_SIZE + 10, 5);
        gfx.fillStyle(0xE81123, 1);
        gfx.fillCircle(spot.x * TILE_SIZE + 6, spot.y * TILE_SIZE + 8, 2);
        gfx.fillCircle(spot.x * TILE_SIZE + 10, spot.y * TILE_SIZE + 8, 2);
      }
    }

    // Hay bales
    const haySpots = [{ x: 5, y: 16 }, { x: 21, y: 16 }, { x: 5, y: 26 }];
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
    if (this._collisionMap[scareY] !== undefined) this._collisionMap[scareY][scareX] = true;

    // Slime decoration near pond
    const slimeX = 38, slimeY = 38;
    if (this.textures.exists('slime-green') && this._collisionMap[slimeY] && !this._collisionMap[slimeY][slimeX]) {
      this.add.sprite(slimeX * TILE_SIZE + TILE_SIZE / 2, slimeY * TILE_SIZE + TILE_SIZE / 2, 'slime-green', 0)
        .setDepth(4).setScale(0.3).setAlpha(0.8);
      this._collisionMap[slimeY][slimeX] = true;
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
      gfx.fillStyle(0x8B4513, 1);
      gfx.fillRect(s.x * TILE_SIZE - 4, s.y * TILE_SIZE - 6, TILE_SIZE + 8, 6);
      gfx.fillStyle(0xDAA520, 0.6);
      gfx.fillRect(s.x * TILE_SIZE, s.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      gfx.fillStyle(Phaser.Math.RND.pick([0xF1C40F, 0xE74C3C, 0x2ECC71, 0x3498DB]), 1);
      gfx.fillCircle(s.x * TILE_SIZE + 8, s.y * TILE_SIZE + 8, 3);
    }
  }

  /* ═══════════════════════════════════════════════════
     FLOWERS
     ═══════════════════════════════════════════════════ */

  _spawnFlowers() {
    const flowerColors = [
      { color: 0xFF6B6B, rarity: 'common' }, { color: 0xFFD93D, rarity: 'common' },
      { color: 0x6BCB77, rarity: 'common' }, { color: 0x4D96FF, rarity: 'uncommon' },
      { color: 0xFF8E9E, rarity: 'uncommon' }, { color: 0xC084FC, rarity: 'rare' },
      { color: 0xF472B6, rarity: 'epic' },     { color: 0xFFD700, rarity: 'legendary' }
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
          this._activeFlowers.push({
            sprite: gfx, _tileX: x, _tileY: y,
            _flowerType: flower.rarity, _flowerRarity: flower.rarity,
            _flowerValue: flower.rarity === 'legendary' ? 100 : flower.rarity === 'epic' ? 50 : flower.rarity === 'rare' ? 25 : 10,
            _objKey: 'flower'
          });
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     NPC — FLORA
     ═══════════════════════════════════════════════════ */

  _placeNPC() {
    const npcX = 8, npcY = 9;
    this._npc = this.add.sprite(
      npcX * TILE_SIZE + TILE_SIZE / 2, npcY * TILE_SIZE + TILE_SIZE / 2,
      'player-sheet', 1
    ).setDepth(6).setTint(0x7BA87B).setScale(0.55);
    this._npc._tileX = npcX;
    this._npc._tileY = npcY;
    this._npc._objKey = 'npc';
    this.add.text(npcX * TILE_SIZE + TILE_SIZE / 2, npcY * TILE_SIZE - 6, '🌸 Flora', {
      fontFamily: 'Tahoma', fontSize: '9px', color: '#5B8C5A', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 1).setDepth(7);
  }

  /* ═══════════════════════════════════════════════════
     HUD
     ═══════════════════════════════════════════════════ */

  _buildHUD() {
    this.add.text(4, 4, 'WASD: Move | E: Interact | M: Map | ESC: Close', {
      fontFamily: 'Tahoma', fontSize: '8px', color: '#F0E8D0', stroke: '#000000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(20);
    this._hudCoords = this.add.text(4, 16, 'X:0 Y:0', {
      fontFamily: 'Tahoma', fontSize: '9px', color: '#D0C8B0', stroke: '#000000', strokeThickness: 1
    }).setScrollFactor(0).setDepth(20);
    this._hudCoins = this.add.text(4, 28, '', {
      fontFamily: 'Tahoma', fontSize: '10px', color: '#E8D080', stroke: '#000000', strokeThickness: 1
    }).setScrollFactor(0).setDepth(20);
    this._hudFlowers = this.add.text(4, 40, '', {
      fontFamily: 'Tahoma', fontSize: '9px', color: '#C0B8A0', stroke: '#000000', strokeThickness: 1
    }).setScrollFactor(0).setDepth(20);
    this._refreshHUD();
  }

  _refreshHUD() {
    const username = this._getActiveUsername();
    if (!username) { this._hudCoins.setText('Coins: \u2014'); this._hudFlowers.setText(''); return; }
    const coins = EconomyService.getCoins(username);
    const flowers = EconomyService.getFlowers(username);
    this._hudCoins.setText('\uD83D\uDCB0 ' + coins);
    this._hudFlowers.setText('\uD83C\uDF38 ' + flowers.length + ' collected');
  }

  _getActiveUsername() {
    try { const s = JSON.parse(localStorage.getItem('retromap-active-user')); return s ? s.username : null; } catch { return null; }
  }

  /* ═══════════════════════════════════════════════════
     MINIMAP
     ═══════════════════════════════════════════════════ */

  _createMinimap() {
    this._mmW = 140; this._mmH = 105;
    const gw = this.game.config.width;
    this._mmX = gw - this._mmW - 8; this._mmY = 8;
    this._mmScale = 2.2;
    this._mmColors = { 'tile-grass': 0x8BC78B, 'tile-path': 0xC8B888, 'tile-water': 0x6BA8D8, 'default': 0x8BC78B };

    this._mmBg = this.add.graphics().setScrollFactor(0).setDepth(49);
    this._mmBg.fillStyle(0x1A1A2E, 0.85);
    this._mmBg.fillRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);
    this._mmBg.lineStyle(1, 0x7BA87B, 0.6);
    this._mmBg.strokeRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);
    this.add.text(this._mmX + 2, this._mmY - 1, '\uD83C\uDF3E MAP', {
      fontFamily: 'Tahoma', fontSize: '7px', color: '#7BA87B'
    }).setScrollFactor(0).setDepth(51);

    this._mmGraphics = this.add.graphics().setScrollFactor(0).setDepth(50);
    this._mmTileData = [];
    for (let y = 0; y < MAP_H; y++) {
      this._mmTileData[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        const tile = this._getTileAt(x, y);
        this._mmTileData[y][x] = this._minimapColor(tile.texture);
      }
    }
    this._drawMinimap();
    this._mmPlayerDot = this.add.image(0, 0, 'minimap-dot').setScrollFactor(0).setDepth(52);
    this._mmNPCDot = this.add.image(0, 0, 'minimap-npc').setScrollFactor(0).setDepth(51);
  }

  _minimapColor(texture) {
    if (texture.startsWith('beach-tile')) return 0xD4C484;
    if (texture.startsWith('cliff-tile')) return 0x8B7355;
    if (texture.startsWith('farmland')) return 0x7C9A5A;
    if (texture.startsWith('water-tile') || texture === 'tile-water') return 0x6BA8D8;
    if (texture.startsWith('path-tile') || texture === 'tile-path') return 0xC8B888;
    return this._mmColors[texture] || this._mmColors.default;
  }

  _drawMinimap() {
    this._mmGraphics.clear();
    const s = this._mmScale;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        this._mmGraphics.fillStyle(this._mmTileData[y][x], 1);
        this._mmGraphics.fillRect(this._mmX + x * s, this._mmY + y * s, s, s);
      }
    }
    this._mmGraphics.lineStyle(1, 0x7BA87B, 0.4);
    this._mmGraphics.strokeRect(this._mmX, this._mmY, MAP_W * s, MAP_H * s);
  }

  _updateMinimap() {
    if (!this._mmPlayerDot || !this.player) return;
    this._mmPlayerDot.setPosition(
      this._mmX + (this.player.x / TILE_SIZE) * this._mmScale,
      this._mmY + (this.player.y / TILE_SIZE) * this._mmScale
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
    const gw = this.game.config.width;
    this._mmX = gw - this._mmW - 8;
    this._mmScale = this._minimapLarge ? 4.4 : 2.2;
    this._mmBg.clear();
    this._mmBg.fillStyle(0x1A1A2E, 0.9);
    this._mmBg.fillRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);
    this._mmBg.lineStyle(1, 0x7BA87B, 0.6);
    this._mmBg.strokeRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);
    this._drawMinimap();
  }

  /* ═══════════════════════════════════════════════════
     GAME LOOP
     ═══════════════════════════════════════════════════ */

  update(time, delta) {
    if (this._npcDialogueOpen) return;
    this._handleMovement(delta);
    this._checkNearbyObjects();
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this._doInteract();
    if (Phaser.Input.Keyboard.JustDown(this.mapKey)) this._toggleMinimapSize();
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) this._closeNPCDialogue();
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

    // Player animation — use new animation keys
    const animKey = 'player-walk-' + dir;
    if (moving && this.anims.exists(animKey)) {
      this.player.play(animKey, true);
    } else if (!moving) {
      this.player.stop();
      this.player.setTexture('player-sheet', 1); // Frame 1 = standing/center
    }

    const tx = Math.round(this.player.x / TILE_SIZE);
    const ty = Math.round(this.player.y / TILE_SIZE);
    this._hudCoords.setText('\uD83D\uDCCD ' + tx + ', ' + ty + ' | ' + this._getZoneLabel(tx, ty));
  }

  _getZoneLabel(x, y) {
    for (const [, zone] of Object.entries(ZONES)) {
      if (this._isInZone(zone, x, y)) return zone.label;
    }
    return '\uD83C\uDF3F Pastures';
  }

  _canMoveTo(x, y) {
    const ts = TILE_SIZE, m = 4;
    const pts = [{x:x-m,y:y-m},{x:x+m,y:y-m},{x:x-m,y:y+m},{x:x+m,y:y+m}];
    for (const pt of pts) {
      const tx = Math.floor(pt.x / ts), ty = Math.floor(pt.y / ts);
      if (ty < 0 || ty >= this._collisionMap.length || tx < 0 || tx >= this._collisionMap[0].length) return false;
      if (this._collisionMap[ty] && this._collisionMap[ty][tx]) return false;
    }
    return true;
  }

  /* ═══════════════════════════════════════════════════
     INTERACTIONS
     ═══════════════════════════════════════════════════ */

  _checkNearbyObjects() {
    const px = this.player.x / TILE_SIZE, py = this.player.y / TILE_SIZE;
    if (this._npc) {
      const d = Math.abs(this._npc._tileX - px) + Math.abs(this._npc._tileY - py);
      if (d <= 1.5) {
        this._interactPrompt.setText('[E] Talk to Flora');
        this._interactPrompt.setPosition(this._npc.x, this._npc.y - 14);
        this._interactPrompt.setVisible(true);
        this._nearObject = this._npc; return;
      }
    }
    for (const f of this._activeFlowers) {
      const d = Math.abs(f._tileX - px) + Math.abs(f._tileY - py);
      if (d <= 1.2) {
        this._interactPrompt.setText('[E] Pick ' + (f._flowerType || 'flower') + ' (' + f._flowerRarity + ')');
        this._interactPrompt.setPosition(f._tileX * TILE_SIZE + 8, f._tileY * TILE_SIZE - 4);
        this._interactPrompt.setVisible(true);
        this._nearObject = f; return;
      }
    }
    this._interactPrompt.setVisible(false);
    this._nearObject = null;
  }

  _doInteract() {
    if (!this._nearObject) return;
    const obj = this._nearObject;
    if (obj._objKey === 'npc') { this._openNPCDialogue(); return; }
    if (obj._objKey === 'flower') { this._pickFlower(obj); return; }
    const msgs = { tree: 'A beautiful oak tree.', rock: 'A sturdy farm rock.', sign: 'Welcome!',
      chest: 'A mailbox. No mail today.', mushroom: 'A cute little mushroom!',
      bush: 'A berry bush. Yummy!', well: 'An old stone well.', scarecrow: 'Watching the crops.' };
    this._showFloatingText(this.player.x, this.player.y - 20, msgs[obj._objKey] || '\uD83C\uDF3B Lovely!');
  }

  _pickFlower(fObj) {
    const username = this._getActiveUsername();
    if (!username) { this._showFloatingText(this.player.x, this.player.y - 20, 'Sign in to collect!'); return; }
    EconomyService.collectFlower(username, fObj._flowerType, fObj._flowerRarity, fObj._tileX, fObj._tileY);
    if (fObj.sprite) fObj.sprite.destroy();
    this._activeFlowers = this._activeFlowers.filter(f => f !== fObj);
    this._nearObject = null;
    this._interactPrompt.setVisible(false);
    this._showFloatingText(this.player.x, this.player.y - 20, '\uD83C\uDF38 ' + fObj._flowerType + '! (' + fObj._flowerRarity + ')');
    this._refreshHUD();
  }

  /* ═══════════════════════════════════════════════════
     NPC DIALOGUE (preserved from original)
     ═══════════════════════════════════════════════════ */

  _openNPCDialogue() { this._npcDialogueOpen = true;
    this._interactPrompt.setVisible(false);
    this._dialogueOverlay = this.add.rectangle(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2,
      this.cameras.main.width, this.cameras.main.height, 0x000000, 0.4
    ).setScrollFactor(0).setDepth(50).setInteractive();
    const pw = 280, ph = 200;
    const px = this.cameras.main.scrollX + (this.cameras.main.width - pw) / 2;
    const py = this.cameras.main.scrollY + (this.cameras.main.height - ph) / 2;
    this._dialoguePanel = this.add.graphics().setDepth(51);
    this._dialoguePanel.fillStyle(0xECE9D8, 1); this._dialoguePanel.fillRect(px, py, pw, ph);
    this._dialoguePanel.lineStyle(2, 0x0A246A, 1); this._dialoguePanel.strokeRect(px, py, pw, ph);
    this._dialoguePanel.fillStyle(0x0A246A, 1); this._dialoguePanel.fillRect(px + 2, py + 2, pw - 4, 18);
    this._dialogueTitle = this.add.text(px + 8, py + 4, '\uD83C\uDF38 Flora the Botanist', {
      fontFamily: 'Tahoma', fontSize: '11px', color: '#FFFFFF', fontStyle: 'bold'
    }).setDepth(52);
    this._dialogueText = this.add.text(px + 12, py + 28, '', {
      fontFamily: 'Tahoma', fontSize: '10px', color: '#000000', wordWrap: { width: pw - 30 }
    }).setDepth(52);
    this._dialogueButtons = [];
    this._renderNPCMainScreen(px, py, pw, ph);
  }

  _renderNPCMainScreen(pxx, pyy, pw, ph) {
    const u = this._getActiveUsername();
    const f = u ? EconomyService.getFlowers(u) : [];
    const c = u ? EconomyService.getCoins(u) : 0;
    let msg = 'Welcome to the farm, neighbor! \uD83C\uDF3B\n\nI tend to the flowers and crops here.\n\uD83C\uDF38 Pick flowers around the farm.\n\uD83D\uDCB0 Bring them to me and I\'ll buy them!\n\u2728 Use coins to customize your profile.\n\n';
    if (u) msg += 'You have ' + c + ' coins.'; else msg = 'Welcome! Sign in to explore!';
    this._dialogueText.setText(msg);
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    if (f.length > 0) this._createBtn(pxx + 12, pyy + ph - 72, 120, 22, 'Sell (' + f.length + ')', () => this._renderSellScreen(pxx, pyy, pw, ph));
    this._createBtn(pxx + 140, pyy + ph - 72, 130, 22, 'Customize', () => this._renderCustomizeScreen(pxx, pyy, pw, ph));
    this._createBtn(pxx + 12, pyy + ph - 48, 120, 22, 'Art Supplies', () => this._renderArtSupplies(pxx, pyy, pw, ph));
    this._createBtn(pxx + pw - 80, pyy + ph - 26, 70, 20, 'Goodbye', () => this._closeNPCDialogue());
  }

  _createBtn(x, y, w, h, label, onClick) {
    const bg = this.add.graphics().setDepth(53);
    bg.fillStyle(0xD4D0C8, 1); bg.fillRect(x, y, w, h);
    bg.lineStyle(1, 0x808080, 1); bg.strokeRect(x, y, w, h);
    bg.lineStyle(1, 0xFFFFFF, 1); bg.strokeRect(x + 1, y + 1, w - 2, 1); bg.strokeRect(x + 1, y + 1, 1, h - 2);
    const txt = this.add.text(x + w / 2, y + h / 2, label, { fontFamily: 'Tahoma', fontSize: '10px', color: '#000000' }).setOrigin(0.5).setDepth(54);
    const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h).setDepth(55).setInteractive({ useHandCursor: true }).setScrollFactor(0);
    hit.on('pointerdown', () => onClick());
    this._dialogueButtons.push(bg, txt, hit);
  }

  _renderSellScreen(pxx, pyy, pw, ph) {
    const u = this._getActiveUsername();
    const flowers = u ? EconomyService.getFlowers(u) : [];
    this._dialogueText.setText('Pick a flower to sell:');
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    let yOff = pyy + 44;
    const maxShow = Math.min(flowers.length, 5);
    for (let i = 0; i < maxShow; i++) {
      const fl = flowers[i];
      const val = EconomyService.getFlowerValue(fl.rarity);
      const colors = { common: '#808080', uncommon: '#4A90D9', rare: '#9B59B6', epic: '#F1C40F', legendary: '#E91E63' };
      const ft = this.add.text(pxx + 16, yOff, (EconomyService.getFlowerTypeLabel(fl.type) || fl.type) + ' (' + fl.rarity + ') \u2014 ' + val + ' coins',
        { fontFamily: 'Tahoma', fontSize: '10px', color: colors[fl.rarity] || '#000000' }).setDepth(53);
      this._dialogueButtons.push(ft);
      this._createBtn(pxx + pw - 70, yOff - 2, 58, 16, 'Sell', () => {
        EconomyService.removeFlower(u, fl.id); EconomyService.addCoins(u, val);
        this._showFloatingText(this._npc.x, this._npc.y - 20, 'Sold!'); this._refreshHUD(); this._closeNPCDialogue();
      }); yOff += 20;
    }
    this._createBtn(pxx + 12, pyy + ph - 30, 60, 20, 'Back', () => this._renderNPCMainScreen(pxx, pyy, pw, ph));
  }

  _renderCustomizeScreen(pxx, pyy, pw, ph) {
    const u = this._getActiveUsername();
    const c = u ? EconomyService.getCoins(u) : 0;
    this._dialogueText.setText('Customize! Coins: ' + c);
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    let yOff = pyy + 44;
    for (const cat of [{id:'frames',label:'Frames'},{id:'nameColors',label:'Name Color'},{id:'themes',label:'Theme'}]) {
      this._createBtn(pxx + 12, yOff, pw - 24, 20, cat.label, () => this._renderShopCategory(pxx, pyy, pw, ph, cat.id));
      yOff += 24;
    }
    this._createBtn(pxx + 12, pyy + ph - 30, 60, 20, 'Back', () => this._renderNPCMainScreen(pxx, pyy, pw, ph));
  }

  _renderShopCategory(pxx, pyy, pw, ph, cat) {
    const u = this._getActiveUsername();
    const items = EconomyService.CUSTOMIZATIONS[cat];
    const cust = u ? EconomyService.getCustomizations(u) : null;
    const coins = u ? EconomyService.getCoins(u) : 0;
    const labels = { frames: 'Frames', nameColors: 'Name Color', themes: 'Theme' };
    this._dialogueText.setText(labels[cat] || cat + ' \u2014 ' + coins + ' coins');
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    let yOff = pyy + 44;
    let count = 0;
    for (const item of items) {
      if (count >= 7) break;
      const equipped = cust && cust[EconomyService._catToType(cat)] === item.id;
      let status = equipped ? ' [Equipped]' : (item.cost === 0 ? ' [Free]' : ' \u2014 ' + item.cost + 'c');
      const ft = this.add.text(pxx + 16, yOff, item.label + status,
        { fontFamily: 'Tahoma', fontSize: '10px', color: item.color || '#000000' }).setDepth(53);
      this._dialogueButtons.push(ft);
      if (!equipped) {
        const lbl = item.cost === 0 ? 'Equip' : (coins >= item.cost ? 'Buy' : '');
        if (lbl) this._createBtn(pxx + pw - 65, yOff - 2, 52, 16, lbl, () => {
          if (item.cost === 0) EconomyService.updateCustomization(u, EconomyService._catToType(cat), item.id);
          else {
            const r = EconomyService.purchaseCustomization(u, cat, item.id);
            if (!r.success) { this._showFloatingText(this._npc.x, this._npc.y - 20, r.reason); this._closeNPCDialogue(); return; }
          }
          if (cat === 'themes') RetroMap.setTheme(item.id === 'blue' ? 'blue' : item.id);
          this._showFloatingText(this._npc.x, this._npc.y - 20, 'Equipped ' + item.label + '!');
          this._refreshHUD(); this._closeNPCDialogue();
        });
      }
      yOff += 18; count++;
    }
    this._createBtn(pxx + 12, pyy + ph - 30, 60, 20, 'Back', () => this._renderCustomizeScreen(pxx, pyy, pw, ph));
  }

  _renderArtSupplies(pxx, pyy, pw, ph) { this._closeNPCDialogue(); SocialShell.switchView('editor'); }

  _closeNPCDialogue() {
    if (!this._npcDialogueOpen) return;
    this._npcDialogueOpen = false;
    if (this._dialogueOverlay) this._dialogueOverlay.destroy();
    if (this._dialoguePanel) this._dialoguePanel.destroy();
    if (this._dialogueTitle) this._dialogueTitle.destroy();
    if (this._dialogueText) this._dialogueText.destroy();
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];
    this._dialogueOverlay = this._dialoguePanel = this._dialogueTitle = this._dialogueText = null;
  }

  /* ═══════════════════════════════════════════════════
     PLACED ART
     ═══════════════════════════════════════════════════ */

  _renderPlacedArt() {
    if (this._placedArtSprites) { for (const s of this._placedArtSprites) s.destroy(); }
    this._placedArtSprites = [];
    const u = this._getActiveUsername();
    if (!u) return;
    const art = EconomyService.getAllPlacedArt(u);
    if (!art || art.length === 0) return;
    for (const piece of art) {
      const dim = Math.max(piece.tilesW, piece.tilesH) * 16;
      const key = 'art-' + piece.canvasId;
      if (!this.textures.exists(key)) {
        const gfx = this.make.graphics({ add: false });
        const d = piece.pixelData;
        if (d) {
          for (let i = 0; i < d.length; i++) {
            const px = i % dim, py = Math.floor(i / dim);
            const col = d[i];
            if (col && col !== '#00000000') gfx.fillStyle(Phaser.Display.Color.HexStringToColor(col).color, 1);
            else gfx.fillStyle(0x000000, 0);
            gfx.fillRect(px, py, 1, 1);
          }
        }
        gfx.generateTexture(key, dim, dim); gfx.destroy();
      }
      this.add.image(piece.tileX * this.tileSize + (piece.tilesW * this.tileSize) / 2,
        piece.tileY * this.tileSize + (piece.tilesH * this.tileSize) / 2, key).setDepth(4);
    }
  }

  _showFloatingText(x, y, msg) {
    const txt = this.add.text(x, y, msg, {
      fontFamily: 'Tahoma', fontSize: '9px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 2, align: 'center'
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: txt, y: txt.y - 20, alpha: 0, duration: 2000, ease: 'Power1', onComplete: () => txt.destroy() });
  }
}
