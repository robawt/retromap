/* ═══════════════════════════════════════════════════════
   RetroMap — Game Scene (RotMG-style World)
   Top-down pixel world with minimap, lighting, camera follow
   ═══════════════════════════════════════════════════════ */

const MAP_W = 64;
const MAP_H = 48;

/* ─── Zone definitions ─── */
const ZONES = {
  SPAWN:       { x1: 2,  y1: 2,  x2: 12, y2: 10, label: 'Spawn Plaza' },
  FIELDS:      { x1: 10, y1: 2,  x2: 38, y2: 15, label: 'Sunflower Fields' },
  POND:        { x1: 25, y1: 20, x2: 38, y2: 30, label: 'Lily Pond' },
  WOODS:       { x1: 40, y1: 8,  x2: 58, y2: 28, label: 'Whispering Woods' },
  PLATEAU:     { x1: 8,  y1: 32, x2: 30, y2: 44, label: "Builder's Plateau" },
  MARKET:      { x1: 42, y1: 32, x2: 58, y2: 44, label: 'Market Corner' },
  RUINS:       { x1: 14, y1: 16, x2: 22, y2: 24, label: 'Ancient Ruins' }
};

const ZONE_RARITY_BONUS = {
  SPAWN: 0, FIELDS: 0.5, POND: 1.5, WOODS: 1, PLATEAU: 0.2, MARKET: 0.3, RUINS: 2
};

const FLOWER_SPAWN_CHANCE = 0.06;
const TILE_SIZE = 16;

/* ─── Tile texture keys ─── */
const GRASS_TILES = ['grass-0', 'grass-1', 'grass-2'];
const DARKGRASS_TILES = ['darkgrass-0', 'darkgrass-1'];
const PATH_TILES = ['path-0', 'path-1'];
const STONE_TILES = ['stone-0', 'stone-1', 'stone-2'];
const DIRT_TILES = ['dirt-0', 'dirt-1'];
const WATER_TILES = ['water-0', 'water-1', 'water-2'];

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.tileSize = TILE_SIZE;
    this._collisionMap = [];
    this._flowers = [];
    this._activeFlowers = [];
    this._npcDialogueOpen = false;
    this._exploredTiles = new Set();
    this._waterTime = 0;
    this._lightRadius = 80;

    // Build the world
    this._generateTilemap();

    // Create player animations
    this._createAnimations();

    // Spawn player at spawn point
    this._spawnPlayer(6, 6);

    // Place decorative objects
    this._placeDecorations();

    // Spawn random flowers
    this._spawnFlowers();

    // Place NPC
    this._placeNPC();

    // ─── Main Camera ───
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_W * this.tileSize, MAP_H * this.tileSize);
    this.cameras.main.setZoom(2);

    // ─── Minimap Camera ───
    this._createMinimap();

    // ─── Fog of War / Lighting ───
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
    this.buildKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.mapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this._buildMode = false;
    this._minimapLarge = false;

    // ─── HUD ───
    this._buildHUD();

    // ─── Timers ───
    this._hudTimer = this.time.addEvent({
      delay: 2000,
      callback: () => this._refreshHUD(),
      loop: true
    });

    this.events.on('shutdown', this._onGameShutdown, this);
    this.events.on('destroy', this._onGameShutdown, this);

    // ─── Interaction prompt (OMORI-style soft yellow) ───
    this._interactPrompt = this.add.text(0, 0, '', {
      fontFamily: 'Tahoma', fontSize: '10px', color: '#E8D080',
      stroke: '#000000', strokeThickness: 2, align: 'center'
    }).setOrigin(0.5, 1).setDepth(15).setVisible(false);

    // ─── Build mode ───
    this._buildOverlay = this.add.graphics().setDepth(2).setVisible(false);
    this._buildModeText = this.add.text(4, 52, '', {
      fontFamily: 'Tahoma', fontSize: '9px', color: '#80C870',
      stroke: '#000000', strokeThickness: 1
    }).setScrollFactor(0).setDepth(20).setVisible(false);

    // ─── Placed art ───
    this._renderPlacedArt();

    this._dialogueContainer = null;
  }

  /* ═══════════════════════════════════════════════════
     TILEMAP GENERATION
     ═══════════════════════════════════════════════════ */

  _generateTilemap() {
    for (let y = 0; y < MAP_H; y++) {
      this._collisionMap[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        const result = this._getTileAt(x, y);
        const tileKey = this._variantOf(result.tile);
        const sprite = this.add.image(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          tileKey
        ).setDepth(0);
        this._collisionMap[y][x] = result.blocked;
      }
    }
  }

  /* ─── Pick a random variant of a tile type ─── */
  _variantOf(tile) {
    switch (tile) {
      case 'grass': return Phaser.Math.RND.pick(GRASS_TILES);
      case 'darkgrass': return Phaser.Math.RND.pick(DARKGRASS_TILES);
      case 'path': return Phaser.Math.RND.pick(PATH_TILES);
      case 'stone': return Phaser.Math.RND.pick(STONE_TILES);
      case 'dirt': return Phaser.Math.RND.pick(DIRT_TILES);
      case 'water': return Phaser.Math.RND.pick(WATER_TILES);
      default: return tile;
    }
  }

  /* ─── Get tile at position ─── */
  _getTileAt(x, y) {
    // Border — water
    if (y === 0 || y === MAP_H - 1 || x === 0 || x === MAP_W - 1) {
      return { tile: 'wall-stone', blocked: true };
    }

    // Pond zone
    if (this._isInZone(ZONES.POND, x, y)) {
      const pondCenter = { x: 31, y: 25 };
      const dx = Math.abs(x - pondCenter.x);
      const dy = Math.abs(y - pondCenter.y);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 3 || (dist <= 4 && (x === 31 && y <= 28))) {
        return { tile: 'water', blocked: true };
      }
      if (dist <= 4.5) {
        return { tile: 'stone', blocked: false };
      }
    }

    // Ruins zone
    if (this._isInZone(ZONES.RUINS, x, y)) {
      const cx = 18, cy = 20;
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
      // Stone floor inside ruins
      if (dx <= 2 && dy <= 2) return { tile: 'stone', blocked: false };
      if (dx <= 3 && dy <= 3) return { tile: 'cobble', blocked: false };
      // Ruins walls on the edges
      if ((dx === 4 && dy <= 3) || (dy === 4 && dx <= 3)) {
        return { tile: 'wall-stone', blocked: true };
      }
      return { tile: 'darkgrass', blocked: false };
    }

    // Path network
    if (this._isOnPath(x, y)) {
      return { tile: 'path', blocked: false };
    }

    // Spawn plaza
    if (this._isInZone(ZONES.SPAWN, x, y)) {
      const sc = { x: 7, y: 6 };
      const sd = Math.abs(x - sc.x) + Math.abs(y - sc.y);
      if (sd <= 2) return { tile: 'cobble', blocked: false };
      if (sd <= 4) return { tile: 'stone', blocked: false };
      return { tile: 'grass', blocked: false };
    }

    // Woods — dark grass
    if (this._isInZone(ZONES.WOODS, x, y)) {
      return { tile: 'darkgrass', blocked: false };
    }

    // Market — stone mix
    if (this._isInZone(ZONES.MARKET, x, y)) {
      if ((x + y) % 4 === 0) return { tile: 'cobble', blocked: false };
      if ((x + y) % 3 === 0) return { tile: 'stone', blocked: false };
      return { tile: 'grass', blocked: false };
    }

    // Random dirt/stone patches
    if (x % 11 === 3 && y % 9 === 5) return { tile: 'dirt', blocked: false };
    if (x % 13 === 7 && y % 7 === 3) return { tile: 'stone', blocked: false };

    return { tile: 'grass', blocked: false };
  }

  _isInZone(zone, x, y) {
    return x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2;
  }

  _isOnPath(x, y) {
    if ((y === 11 || y === 12) && x >= 2 && x <= 58) return true;
    if (x === 8 && y >= 8 && y <= 34) return true;
    if (x >= 22 && x <= 27 && (y === 15 || y === 16)) return true;
    if ((x === 24 || x === 26) && y >= 16 && y <= 22) return true;
    if (x === 36 && y >= 12 && y <= 22) return true;
    if (x === 36 && y >= 28 && y <= 35) return true;
    if (y === 35 && x >= 36 && x <= 44) return true;
    if (y === 28 && x >= 8 && x <= 22) return true;
    if (x === 48 && y >= 10 && y <= 26) return true;
    if (y === 8 && x >= 12 && x <= 22) return true;
    if (y === 18 && x >= 8 && x <= 24) return true;
    return false;
  }

  /* ═══════════════════════════════════════════════════
     PLAYER
     ═══════════════════════════════════════════════════ */

  _spawnPlayer(tileX, tileY) {
    this.player = this.add.sprite(
      tileX * this.tileSize + this.tileSize / 2,
      tileY * this.tileSize + this.tileSize / 2,
      'player-down-0'
    ).setDepth(10);

    this.player._dir = 'down';
    this.player._moving = false;

    // Shadow under player
    this.shadow = this.add.ellipse(
      this.player.x, this.player.y + 10,
      10, 4, 0x000000, 0.3
    ).setDepth(9);
  }

  _createAnimations() {
    const dirs = ['down', 'left', 'right', 'up'];
    for (const dir of dirs) {
      const key = 'player-' + dir + '-walk';
      if (this.anims.exists(key)) continue;
      this.anims.create({
        key,
        frames: [
          { key: 'player-' + dir + '-0' },
          { key: 'player-' + dir + '-1' },
          { key: 'player-' + dir + '-0' },
          { key: 'player-' + dir + '-3' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     MINIMAP
     ═══════════════════════════════════════════════════ */

  _createMinimap() {
    this._mmW = 140;
    this._mmH = 105;
    this._mmX = this.cameras.main.width - this._mmW - 8;
    this._mmY = 8;
    this._mmScale = 2.2;
    this._mmColors = {
      'grass': 0x5ABE5A, 'darkgrass': 0x3A8C3A,
      'water': 0x2C6BB8, 'path': 0xBF9B7A,
      'stone': 0x9C9C9C, 'cobble': 0x9C9C9C,
      'dirt': 0xC47D4A, 'sand': 0xD4B96A,
      'wall-stone': 0x606060, 'wall-wood': 0x5B3413,
      'fence': 0x6B4423
    };

    // Background panel
    this._mmBg = this.add.graphics().setScrollFactor(0).setDepth(49);
    this._mmBg.fillStyle(0x0A0A1A, 0.85);
    this._mmBg.fillRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);
    this._mmBg.lineStyle(1, 0x4A90D9, 0.6);
    this._mmBg.strokeRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);

    // Title
    this.add.text(this._mmX + 2, this._mmY - 1, 'MAP', {
      fontFamily: 'Tahoma', fontSize: '7px', color: '#4A90D9'
    }).setScrollFactor(0).setDepth(51);

    // Minimap Graphics layer (for tiles)
    this._mmGraphics = this.add.graphics().setScrollFactor(0).setDepth(50);

    // Pre-compute tile colors
    this._mmTileData = [];
    for (let y = 0; y < MAP_H; y++) {
      this._mmTileData[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        const tile = this._getTileAt(x, y);
        this._mmTileData[y][x] = this._mmColors[tile.tile] || 0x5ABE5A;
      }
    }

    // Draw initial minimap
    this._drawMinimap();

    // Player dot
    this._mmPlayerDot = this.add.image(0, 0, 'minimap-dot')
      .setScrollFactor(0).setDepth(52).setScale(1);

    // NPC dot
    if (this._npc) {
      this._mmNPCDot = this.add.image(0, 0, 'minimap-npc')
        .setScrollFactor(0).setDepth(51).setScale(1);
    }
  }

  _drawMinimap() {
    this._mmGraphics.clear();
    const scale = this._mmScale;

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const color = this._mmTileData[y][x];
        this._mmGraphics.fillStyle(color, 1);
        this._mmGraphics.fillRect(
          this._mmX + x * scale,
          this._mmY + y * scale,
          scale + 0.5, scale + 0.5
        );
      }
    }

    // Border line around the map area
    this._mmGraphics.lineStyle(1, 0x4A90D9, 0.4);
    this._mmGraphics.strokeRect(this._mmX, this._mmY,
      MAP_W * scale, MAP_H * scale);
  }

  _updateMinimap() {
    if (!this._mmPlayerDot || !this.player) return;

    const px = this.player.x / this.tileSize;
    const py = this.player.y / this.tileSize;
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

  /* ═══════════════════════════════════════════════════
     FOG OF WAR / LIGHTING
     ═══════════════════════════════════════════════════ */

  _createFogOfWar() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Use a RenderTexture for the fog overlay with MULTIPLY blend
    this._fogRT = this.add.renderTexture(0, 0, w, h)
      .setScrollFactor(0).setDepth(48).setBlendMode(Phaser.BlendModes.MULTIPLY);

    // Fill with dark fog
    this._fogRT.fill(0x000000, 1);
  }

  _updateFog() {
    if (!this.player || !this._fogRT) return;

    const cam = this.cameras.main;

    // Re-fill with darkness
    this._fogRT.clear();
    this._fogRT.fill(0x000000, 0.92);

    // Erase a visibility circle around the player using the fog-reveal texture
    const screenX = this.player.x - cam.scrollX - 80;
    const screenY = this.player.y - cam.scrollY - 88;

    this._fogRT.erase('fog-reveal', screenX, screenY);
  }

  /* ═══════════════════════════════════════════════════
     DECORATIONS
     ═══════════════════════════════════════════════════ */

  _placeDecorations() {
    this._decorations = [];

    const trees = this._generateTreePlacements();
    for (const t of trees) {
      const tex = t.pine ? 'tree-pine' : 'tree-oak';
      const sprite = this.add.sprite(
        t.x * this.tileSize + this.tileSize / 2,
        t.y * this.tileSize + this.tileSize / 2,
        tex
      ).setDepth(5).setOrigin(0.5, 1);
      sprite._tileX = t.x;
      sprite._tileY = t.y;
      sprite._objKey = 'tree';
      this._decorations.push(sprite);
      if (this._collisionMap[t.y] !== undefined) {
        this._collisionMap[t.y][t.x] = true;
      }
    }

    const rocks = this._generateRockPlacements();
    for (const r of rocks) {
      const tex = r.big ? 'rock-big' : 'rock-small';
      const sprite = this.add.sprite(
        r.x * this.tileSize + this.tileSize / 2,
        r.y * this.tileSize + this.tileSize / 2,
        tex
      ).setDepth(5);
      sprite._tileX = r.x;
      sprite._tileY = r.y;
      sprite._objKey = 'rock';
      this._decorations.push(sprite);
      if (this._collisionMap[r.y] !== undefined) {
        this._collisionMap[r.y][r.x] = true;
      }
    }

    // Bushes
    this._placeRandomObj('bush', 18, 16, 8);
    this._placeRandomObj('weed', 10, 8, 6);

    // Mushrooms in woods
    this._placeRandomObjInZone('mushroom', ZONES.WOODS, 8);

    // Sign posts near spawn
    this._addDecoration(2, 6, 'sign', false);
    this._addDecoration(7, 3, 'sign', false);

    // Chest near ruins
    this._addDecoration(17, 18, 'chest', false);

    // Dungeon entrance in ruins center
    this._addDecoration(18, 20, 'dungeon', false);
  }

  _placeRandomObj(key, maxCount, spread, count) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(2, MAP_W - 2);
      const y = Phaser.Math.Between(2, MAP_H - 2);
      if (!this._isOnPath(x, y) && !this._collisionMap[y][x]) {
        this._addDecoration(x, y, key, true);
      }
    }
  }

  _placeRandomObjInZone(key, zone, count) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(zone.x1 + 1, zone.x2 - 1);
      const y = Phaser.Math.Between(zone.y1 + 1, zone.y2 - 1);
      if (!this._isOnPath(x, y) && !this._collisionMap[y][x]) {
        this._addDecoration(x, y, key, false);
      }
    }
  }

  _addDecoration(tileX, tileY, key, block) {
    const sprite = this.add.sprite(
      tileX * this.tileSize + this.tileSize / 2,
      tileY * this.tileSize + this.tileSize / 2,
      key
    ).setDepth(5);
    sprite._tileX = tileX;
    sprite._tileY = tileY;
    sprite._objKey = key;
    this._decorations.push(sprite);
    if (block && this._collisionMap[tileY] !== undefined) {
      this._collisionMap[tileY][tileX] = true;
    }
  }

  _generateTreePlacements() {
    const placements = [];
    // Dense pines in woods
    for (let x = ZONES.WOODS.x1 + 1; x < ZONES.WOODS.x2; x += 2) {
      for (let y = ZONES.WOODS.y1 + 1; y < ZONES.WOODS.y2; y += 2) {
        if (Math.random() < 0.65 && !this._isOnPath(x, y)) {
          placements.push({ x, y, pine: true });
        }
      }
    }
    // Scattered oaks in fields
    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(ZONES.FIELDS.x1 + 1, ZONES.FIELDS.x2 - 1);
      const y = Phaser.Math.Between(ZONES.FIELDS.y1 + 1, ZONES.FIELDS.y2 - 1);
      if (!this._isOnPath(x, y)) placements.push({ x, y, pine: false });
    }
    // Near spawn
    placements.push({ x: 3, y: 3, pine: false }, { x: 4, y: 3, pine: false }, { x: 3, y: 9, pine: false });
    // Around plateau
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(ZONES.PLATEAU.x1 - 1, ZONES.PLATEAU.x2 + 1);
      const y = Phaser.Math.Between(ZONES.PLATEAU.y1 - 1, ZONES.PLATEAU.y2 + 1);
      if (!this._isOnPath(x, y) && !this._isInZone(ZONES.PLATEAU, x, y)) {
        placements.push({ x, y, pine: false });
      }
    }
    return placements;
  }

  _generateRockPlacements() {
    const placements = [];
    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(ZONES.POND.x1 - 2, ZONES.POND.x2 + 2);
      const y = Phaser.Math.Between(ZONES.POND.y1 - 2, ZONES.POND.y2 + 2);
      if (!this._isOnPath(x, y)) placements.push({ x, y, big: Math.random() < 0.4 });
    }
    for (let i = 0; i < 4; i++) {
      const x = Phaser.Math.Between(ZONES.MARKET.x1, ZONES.MARKET.x2);
      const y = Phaser.Math.Between(ZONES.MARKET.y1, ZONES.MARKET.y2);
      if (!this._isOnPath(x, y)) placements.push({ x, y, big: Math.random() < 0.3 });
    }
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(ZONES.RUINS.x1, ZONES.RUINS.x2);
      const y = Phaser.Math.Between(ZONES.RUINS.y1, ZONES.RUINS.y2);
      if (!this._isOnPath(x, y)) placements.push({ x, y, big: false });
    }
    return placements;
  }

  /* ═══════════════════════════════════════════════════
     FLOWERS
     ═══════════════════════════════════════════════════ */

  _getZoneAt(x, y) {
    for (const [name, zone] of Object.entries(ZONES)) {
      if (this._isInZone(zone, x, y)) return name;
    }
    return null;
  }

  _spawnFlowers() {
    for (const f of this._activeFlowers) f.destroy();
    this._activeFlowers = [];

    for (let y = 1; y < MAP_H - 1; y++) {
      for (let x = 1; x < MAP_W - 1; x++) {
        if (this._collisionMap[y] && this._collisionMap[y][x]) continue;
        if (this._isOnPath(x, y)) continue;
        const tile = this._getTileAt(x, y).tile;
        if (tile !== 'grass' && tile !== 'darkgrass') continue;
        if (Math.random() < FLOWER_SPAWN_CHANCE) {
          const zone = this._getZoneAt(x, y);
          const bonus = ZONE_RARITY_BONUS[zone] || 0;
          const flowerType = EconomyService.pickRandomFlowerType(bonus);
          const sprite = this.add.sprite(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            'flower-' + flowerType.type
          ).setDepth(3);
          sprite._tileX = x;
          sprite._tileY = y;
          sprite._flowerType = flowerType.type;
          sprite._flowerRarity = flowerType.rarity;
          sprite._flowerValue = flowerType.value;
          sprite._objKey = 'flower';
          this._activeFlowers.push(sprite);
        }
      }
    }
  }

  _getActiveUsername() {
    try {
      const session = JSON.parse(localStorage.getItem('retromap-active-user'));
      return session ? session.username : null;
    } catch { return null; }
  }

  /* ═══════════════════════════════════════════════════
     NPC
     ═══════════════════════════════════════════════════ */

  _placeNPC() {
    const npcX = 5, npcY = 8;
    this._npc = this.add.sprite(
      npcX * this.tileSize + this.tileSize / 2,
      npcY * this.tileSize + this.tileSize / 2,
      'npc-flora'
    ).setDepth(6);
    this._npc._tileX = npcX;
    this._npc._tileY = npcY;
    this._npc._objKey = 'npc';

    // Name label
    this.add.text(
      npcX * this.tileSize + this.tileSize / 2,
      npcY * this.tileSize - 6,
      'Flora',
      { fontFamily: 'Tahoma', fontSize: '8px', color: '#FFFFFF',
        stroke: '#000000', strokeThickness: 2 }
    ).setOrigin(0.5, 1).setDepth(7);
  }

  /* ═══════════════════════════════════════════════════
     HUD
     ═══════════════════════════════════════════════════ */

  _buildHUD() {
    // Top-left controls hint (OMORI soft pastel) — actually, let's reposition
    this.add.text(4, 4, 'WASD/Arrows: Move | E: Interact | B: Build | M: Map | ESC: Close', {
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
    this._hudCoins.setText('Coins: ' + coins);
    this._hudFlowers.setText('Flowers: ' + flowers.length + ' collected');
  }

  /* ═══════════════════════════════════════════════════
     GAME LOOP
     ═══════════════════════════════════════════════════ */

  update(time, delta) {
    if (this._npcDialogueOpen) return;

    this._handleMovement(delta);
    this._checkNearbyObjects();

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      if (this._buildMode) {
        this._tryPlaceArt();
      } else {
        this._doInteract();
      }
    }
    if (Phaser.Input.Keyboard.JustDown(this.buildKey)) {
      this._toggleBuildMode();
    }
    if (Phaser.Input.Keyboard.JustDown(this.mapKey)) {
      this._toggleMinimapSize();
    }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      if (this._buildMode) {
        this._toggleBuildMode();
      } else {
        this._closeNPCDialogue();
      }
    }

    if (this._buildMode) {
      this._updateBuildOverlay();
    }

    // Update lighting and minimap
    this._updateFog();
    this._updateMinimap();
  }

  _handleMovement(delta) {
    const speed = 100;
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
      const bounds = this.cameras.main.getBounds();
      this.player.x = Phaser.Math.Clamp(newX, 8, bounds.right - 8);
      this.player.y = Phaser.Math.Clamp(newY, 8, bounds.bottom - 8);
    }

    this.shadow.x = this.player.x;
    this.shadow.y = this.player.y + 10;

    this._animatePlayer(delta);

    const tx = Math.round(this.player.x / this.tileSize);
    const ty = Math.round(this.player.y / this.tileSize);
    this._hudCoords.setText('X:' + tx + ' Y:' + ty + ' | ' + this._getZoneLabel(tx, ty));

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
    return 'Wilderness';
  }

  _animatePlayer(delta) {
    const dir = this.player._dir || 'down';
    if (this.player._moving) {
      this.player.play('player-' + dir + '-walk', true);
    } else {
      this.player.stop();
      this.player.setTexture('player-' + dir + '-0');
    }
  }

  _canMoveTo(x, y) {
    const ts = this.tileSize;
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

  _toggleMinimapSize() {
    this._minimapLarge = !this._minimapLarge;
    const oldW = this._mmW;
    this._mmW = this._minimapLarge ? 280 : 140;
    this._mmH = this._minimapLarge ? 210 : 105;
    this._mmX = this.cameras.main.width - this._mmW - 8;
    this._mmScale = this._minimapLarge ? 4.4 : 2.2;

    // Redraw minimap at new size
    this._mmBg.clear();
    this._mmBg.fillStyle(0x0A0A1A, 0.9);
    this._mmBg.fillRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);
    this._mmBg.lineStyle(1, 0x4A90D9, 0.6);
    this._mmBg.strokeRect(this._mmX - 2, this._mmY - 2, this._mmW + 4, this._mmH + 4);

    this._drawMinimap();
  }

  /* ═══════════════════════════════════════════════════
     INTERACTIONS (unchanged from original)
     ═══════════════════════════════════════════════════ */

  _checkNearbyObjects() {
    const px = this.player.x / this.tileSize;
    const py = this.player.y / this.tileSize;

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

    for (const f of this._activeFlowers) {
      const dist = Math.abs(f._tileX - px) + Math.abs(f._tileY - py);
      if (dist <= 1.2) {
        const label = EconomyService.getFlowerTypeLabel(f._flowerType);
        this._interactPrompt.setText('[E] Pick ' + label + ' (' + f._flowerRarity + ')');
        this._interactPrompt.setPosition(f.x, f.y - 10);
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
      tree: 'A sturdy tree with pixel-perfect leaves.',
      rock: 'A chunk of retro stone. Solid and grey.',
      sign: 'Welcome to RetroMap!',
      chest: 'A treasure chest. It looks empty... for now.',
      mushroom: 'A strange glowing mushroom.',
      bush: 'A leafy bush. Nothing hidden inside.',
      weed: 'Just some tall grass.',
      dungeon: 'A mysterious portal. (Coming soon)'
    };
    this._showFloatingText(obj.x, obj.y - 16, msgs[obj._objKey] || '...');
  }

  _pickFlower(sprite) {
    const username = this._getActiveUsername();
    if (!username) {
      this._showFloatingText(sprite.x, sprite.y - 10, 'Sign in to collect flowers!');
      return;
    }

    const type = sprite._flowerType;
    const rarity = sprite._flowerRarity;

    EconomyService.collectFlower(username, type, rarity, sprite._tileX, sprite._tileY);

    sprite.destroy();
    this._activeFlowers = this._activeFlowers.filter(f => f !== sprite);
    this._nearObject = null;
    this._interactPrompt.setVisible(false);

    const label = EconomyService.getFlowerTypeLabel(type);
    this._showFloatingText(sprite.x, sprite.y - 10, '🌸 ' + label + '! (' + rarity + ')');

    this._refreshHUD();
  }

  /* ═══════════════════════════════════════════════════
     NPC DIALOGUE (unchanged from original)
     ═══════════════════════════════════════════════════ */

  _openNPCDialogue() {
    if (this._npcDialogueOpen) return;
    this._npcDialogueOpen = true;
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

    this._dialogueTitle = this.add.text(panelX + 8, panelY + 4, 'Flora the Botanist', {
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

    let msg = 'Hello there, traveler! I\'m Flora.\n\n';
    msg += 'I tend to the flowers of RetroMap. 🌸\n\n';
    msg += '🌸 Explore the world and collect rare flowers.\n';
    msg += '💰 Bring them to me and I\'ll buy them for coins!\n';
    msg += '✨ Use coins to customize your profile and more.\n\n';

    if (username) {
      msg += 'You have ' + coins + ' coins.';
    } else {
      msg = 'Hello! Sign in to explore and collect flowers!';
    }

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
    return { bg, txt, hitArea };
  }

  _renderSellScreen(panelX, panelY, panelW, panelH) {
    const username = this._getActiveUsername();
    const flowers = username ? EconomyService.getFlowers(username) : [];
    this._dialogueText.setText('Select a flower to sell:');
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];

    let yOff = panelY + 44;
    const maxShow = Math.min(flowers.length, 5);
    for (let i = 0; i < maxShow; i++) {
      const f = flowers[i];
      const label = EconomyService.getFlowerTypeLabel(f.type);
      const value = EconomyService.getFlowerValue(f.rarity);
      const rarityColors = { common: '#808080', uncommon: '#4A90D9', rare: '#9B59B6',
        epic: '#F1C40F', legendary: '#E91E63' };
      const color = rarityColors[f.rarity] || '#000000';

      const fText = this.add.text(panelX + 16, yOff,
        label + ' (' + f.rarity + ') — ' + value + ' coins',
        { fontFamily: 'Tahoma', fontSize: '10px', color }
      ).setDepth(53);
      this._dialogueButtons.push(fText);

      this._createDialogueButton(panelX + panelW - 70, yOff - 2, 58, 16, 'Sell', () => {
        EconomyService.removeFlower(username, f.id);
        EconomyService.addCoins(username, value);
        this._showFloatingText(this._npc.x, this._npc.y - 20,
          'Sold ' + label + ' for ' + value + ' coins!');
        this._refreshHUD();
        this._closeNPCDialogue();
      });
      yOff += 20;
    }
    this._createDialogueButton(panelX + 12, panelY + panelH - 30, 60, 20,
      'Back', () => this._renderNPCMainScreen(panelX, panelY, panelW, panelH));
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
        const frameLabel = EconomyService.findShopItem('frames', cust.frame);
        const colorLabel = EconomyService.findShopItem('nameColors', cust.nameColor);
        const themeLabel = EconomyService.findShopItem('themes', cust.theme);
        yOff += 4;
        const summary = this.add.text(panelX + 16, yOff,
          'Equipped: ' + (frameLabel ? frameLabel.label : 'none') +
          ' | ' + (colorLabel ? colorLabel.label : 'default') +
          ' | ' + (themeLabel ? themeLabel.label : 'blue'),
          { fontFamily: 'Tahoma', fontSize: '8px', color: '#808080' }
        ).setDepth(53);
        this._dialogueButtons.push(summary);
      }
    }
    this._createDialogueButton(panelX + 12, panelY + panelH - 30, 60, 20,
      'Back', () => this._renderNPCMainScreen(panelX, panelY, panelW, panelH));
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
      if (count >= maxShow) {
        const more = this.add.text(panelX + 16, yOff, '... and ' + (items.length - maxShow) + ' more items',
          { fontFamily: 'Tahoma', fontSize: '9px', color: '#808080' }).setDepth(53);
        this._dialogueButtons.push(more);
        break;
      }
      const isOwned = item.cost === 0;
      const isEquipped = cust && cust[EconomyService._catToType(category)] === item.id;
      let status = '';
      if (isEquipped) status = ' [Equipped]';
      else if (item.cost === 0) status = ' [Free]';
      else status = ' — ' + item.cost + ' coins';
      const color = item.color || '#000000';
      const fText = this.add.text(panelX + 16, yOff, item.label + status,
        { fontFamily: 'Tahoma', fontSize: '10px', color }).setDepth(53);
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
      } else {
        const eqText = this.add.text(panelX + panelW - 65, yOff - 2, '\u2713',
          { fontFamily: 'Tahoma', fontSize: '12px', color: '#22C55E' }).setDepth(53);
        this._dialogueButtons.push(eqText);
      }
      yOff += 18;
      count++;
    }
    this._createDialogueButton(panelX + 12, panelY + panelH - 30, 60, 20,
      'Back', () => this._renderCustomizeScreen(panelX, panelY, panelW, panelH));
  }

  _renderArtSupplies(panelX, panelY, panelW, panelH) {
    const username = this._getActiveUsername();
    const coins = username ? EconomyService.getCoins(username) : 0;
    const tokens = username ? EconomyService.getPlotTokens(username) : 0;
    const canvases = username ? EconomyService.getCanvases(username) : [];
    const plots = username ? EconomyService.getPlots(username) : [];
    this._dialogueText.setText('Art Supplies — Coins: ' + coins + ' | Tokens: ' + tokens);
    for (const b of this._dialogueButtons) b.destroy();
    this._dialogueButtons = [];

    let yOff = panelY + 44;
    const sizes = EconomyService.CANVAS_SIZES;
    for (const size of sizes) {
      const label = size.label + ' — ' + size.cost + ' coins';
      const canBuy = coins >= size.cost;
      const fText = this.add.text(panelX + 16, yOff, label,
        { fontFamily: 'Tahoma', fontSize: '9px', color: canBuy ? '#000000' : '#808080' }).setDepth(53);
      this._dialogueButtons.push(fText);
      if (canBuy) {
        this._createDialogueButton(panelX + panelW - 62, yOff - 2, 50, 16, 'Buy', () => {
          const result = EconomyService.buyCanvas(username, size.id);
          if (result.success) {
            this._showFloatingText(this._npc.x, this._npc.y - 20, 'Bought ' + size.label + ' canvas!');
            this._refreshHUD();
            this._closeNPCDialogue();
          } else {
            this._showFloatingText(this._npc.x, this._npc.y - 20, result.reason);
            this._closeNPCDialogue();
          }
        });
      }
      yOff += 18;
    }
    yOff += 4;
    const plotLabel = 'Buy Plot Tile — ' + EconomyService.PLOT_TILE_COST + ' coins';
    const canBuyPlot = coins >= EconomyService.PLOT_TILE_COST;
    const fText2 = this.add.text(panelX + 16, yOff, plotLabel,
      { fontFamily: 'Tahoma', fontSize: '9px', color: canBuyPlot ? '#000000' : '#808080' }).setDepth(53);
    this._dialogueButtons.push(fText2);
    if (canBuyPlot) {
      this._createDialogueButton(panelX + panelW - 62, yOff - 2, 50, 16, 'Buy', () => {
        const result = EconomyService.buyPlotToken(username);
        if (result.success) {
          this._showFloatingText(this._npc.x, this._npc.y - 20,
            'Bought a plot tile! (Total: ' + result.tokens + ')');
          this._refreshHUD();
          this._closeNPCDialogue();
        }
      });
    }
    yOff += 24;
    const summary = this.add.text(panelX + 16, yOff,
      'Canvases: ' + canvases.length + ' | Plots owned: ' + plots.length + ' | Tokens: ' + tokens,
      { fontFamily: 'Tahoma', fontSize: '8px', color: '#808080' }).setDepth(53);
    this._dialogueButtons.push(summary);

    if (canvases.length > 0) {
      yOff += 16;
      this._createDialogueButton(panelX + 12, yOff, panelW - 24, 20, 'Open Pixel Editor', () => {
        this._closeNPCDialogue();
        SocialShell.switchView('editor');
      });
    }
    this._createDialogueButton(panelX + 12, panelY + panelH - 30, 60, 20,
      'Back', () => this._renderNPCMainScreen(panelX, panelY, panelW, panelH));
  }

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

  _onGameShutdown() {
    if (this._hudTimer) { this._hudTimer.destroy(); this._hudTimer = null; }
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

  /* ═══════════════════════════════════════════════════
     BUILD MODE (unchanged from original)
     ═══════════════════════════════════════════════════ */

  _toggleBuildMode() {
    this._buildMode = !this._buildMode;
    if (this._buildMode) {
      this._buildOverlay.setVisible(true);
      this._buildModeText.setVisible(true);
      this._buildModeText.setText('BUILD MODE [B to exit] — Walk to a tile, press E to claim/place/remove');
    } else {
      this._buildOverlay.setVisible(false);
      this._buildOverlay.clear();
      this._buildModeText.setVisible(false);
      this._selectedCanvasId = null;
    }
  }

  _updateBuildOverlay() {
    this._buildOverlay.clear();
    const username = this._getActiveUsername();
    if (!username) return;
    const plots = EconomyService.getPlots(username);
    const px = Math.floor(this.player.x / this.tileSize);
    const py = Math.floor(this.player.y / this.tileSize);

    this._buildOverlay.lineStyle(1, 0x00FF00, 0.4);
    for (const plot of plots) {
      this._buildOverlay.strokeRect(plot.tileX * this.tileSize, plot.tileY * this.tileSize,
        this.tileSize, this.tileSize);
    }
    const standingOn = plots.find(p => p.tileX === px && p.tileY === py);
    const tokens = EconomyService.getPlotTokens(username);
    const isClaimable = this._isTileClaimable(px, py);

    if (standingOn) {
      this._buildOverlay.lineStyle(2, 0x00FF00, 0.8);
      this._buildOverlay.strokeRect(px * this.tileSize, py * this.tileSize,
        this.tileSize, this.tileSize);
      this._buildOverlay.fillStyle(0x00FF00, 0.15);
      this._buildOverlay.fillRect(px * this.tileSize, py * this.tileSize,
        this.tileSize, this.tileSize);
      const plot = standingOn;
      if (plot.canvasId) {
        this._buildModeText.setText('BUILD MODE — Press E to remove art from this plot');
      } else {
        const canvases = EconomyService.getCanvases(username).filter(c => c.pixelData);
        if (canvases.length > 0) {
          this._buildModeText.setText('BUILD MODE — Press E to place art (' + canvases.length + ' canvases)');
          this._selectedCanvasId = canvases[0].id;
        } else {
          this._buildModeText.setText('BUILD MODE — No edited canvases. Edit in Pixel Editor first!');
          this._selectedCanvasId = null;
        }
      }
    } else if (isClaimable && tokens > 0) {
      this._buildOverlay.lineStyle(2, 0xFFFF00, 0.8);
      this._buildOverlay.strokeRect(px * this.tileSize, py * this.tileSize,
        this.tileSize, this.tileSize);
      this._buildOverlay.fillStyle(0xFFFF00, 0.15);
      this._buildOverlay.fillRect(px * this.tileSize, py * this.tileSize,
        this.tileSize, this.tileSize);
      this._buildModeText.setText('BUILD MODE — Press E to claim this tile! (' + tokens + ' tokens left)');
    } else if (isClaimable && tokens === 0) {
      this._buildModeText.setText('BUILD MODE — No plot tokens. Buy some from Flora first!');
    } else {
      this._buildModeText.setText('BUILD MODE — Walk to a grass tile to claim, or an owned plot (green) to place art');
      this._selectedCanvasId = null;
    }
  }

  _isTileClaimable(tileX, tileY) {
    if (tileY < 0 || tileY >= this._collisionMap.length ||
        tileX < 0 || tileX >= this._collisionMap[0].length) return false;
    if (this._collisionMap[tileY] && this._collisionMap[tileY][tileX]) return false;
    if (this._isOnPath(tileX, tileY)) return false;
    const username = this._getActiveUsername();
    if (!username) return false;
    const allPlots = EconomyService.getPlots(username);
    return !allPlots.some(p => p.tileX === tileX && p.tileY === tileY);
  }

  _tryPlaceArt() {
    const username = this._getActiveUsername();
    if (!username) return;
    const px = Math.floor(this.player.x / this.tileSize);
    const py = Math.floor(this.player.y / this.tileSize);
    const plots = EconomyService.getPlots(username);
    const plot = plots.find(p => p.tileX === px && p.tileY === py);

    if (!plot) {
      if (this._isTileClaimable(px, py)) {
        const tokens = EconomyService.getPlotTokens(username);
        if (tokens <= 0) {
          this._showFloatingText(this.player.x, this.player.y - 20, 'No plot tokens!');
          return;
        }
        const result = EconomyService.claimPlot(username, px, py);
        if (result.success) {
          this._showFloatingText(this.player.x, this.player.y - 20, 'Tile claimed! \u2705');
          this._refreshHUD();
        } else {
          this._showFloatingText(this.player.x, this.player.y - 20, result.reason);
        }
      } else {
        this._showFloatingText(this.player.x, this.player.y - 20, 'Can\'t claim this tile!');
      }
      return;
    }

    if (plot.canvasId) {
      EconomyService.removeArtFromPlot(username, px, py);
      this._showFloatingText(this.player.x, this.player.y - 20, 'Art removed!');
      this._renderPlacedArt();
      return;
    }

    if (!this._selectedCanvasId) {
      this._showFloatingText(this.player.x, this.player.y - 20, 'No canvas selected!');
      return;
    }

    const result = EconomyService.placeArtOnPlot(username, px, py, this._selectedCanvasId);
    if (result.success) {
      this._showFloatingText(this.player.x, this.player.y - 20, 'Art placed! \u2728');
      this._renderPlacedArt();
      this._refreshHUD();
    } else {
      this._showFloatingText(this.player.x, this.player.y - 20, result.reason);
    }
    this._pendingClaim = null;
  }

  /* ─── Floating text ─── */
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
