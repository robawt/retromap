/* ═══════════════════════════════════════════════════════
   RetroMap — Economy Service
   Coins, flower collection, trading value lookup
   ═══════════════════════════════════════════════════════ */

const EconomyService = {
  STORAGE_KEY: 'retromap-economy',

  /* ─── Flower type definitions ─── */
  FLOWER_TYPES: [
    { type: 'daisy',    rarity: 'common',     label: 'Daisy',    value: 10,  color: 0xFFFFFF },
    { type: 'poppy',    rarity: 'common',     label: 'Poppy',    value: 10,  color: 0xE81123 },
    { type: 'tulip',    rarity: 'uncommon',   label: 'Tulip',    value: 35,  color: 0xFF69B4 },
    { type: 'bluebell', rarity: 'uncommon',   label: 'Bluebell', value: 35,  color: 0x4A90D9 },
    { type: 'orchid',   rarity: 'rare',       label: 'Orchid',   value: 100, color: 0x9B59B6 },
    { type: 'lotus',    rarity: 'rare',       label: 'Lotus',    value: 100, color: 0xF39C12 },
    { type: 'sunbloom', rarity: 'epic',       label: 'Sunbloom', value: 250, color: 0xF1C40F },
    { type: 'starfleur',rarity: 'legendary',  label: 'Starfleur',value: 500, color: 0xE91E63 }
  ],

  /* ─── Rarity spawn weights (out of 100) ─── */
  RARITY_WEIGHTS: {
    common: 45,
    uncommon: 28,
    rare: 18,
    epic: 7,
    legendary: 2
  },

  /* ─── Internal data helpers ─── */

  _getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    } catch { return {}; }
  },

  _saveAll(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  _getData(username) {
    if (!username) return null;
    const all = this._getAll();
    if (!all[username]) {
      all[username] = { coins: 0, flowers: [] };
      this._saveAll(all);
    }
    return all[username];
  },

  _saveData(username, data) {
    const all = this._getAll();
    all[username] = data;
    this._saveAll(all);
  },

  /* ─── Coin operations ─── */

  getCoins(username) {
    const data = this._getData(username);
    return data ? data.coins : 0;
  },

  addCoins(username, amount) {
    const data = this._getData(username);
    if (!data) return false;
    data.coins += amount;
    this._saveData(username, data);
    return true;
  },

  spendCoins(username, amount) {
    const data = this._getData(username);
    if (!data || data.coins < amount) return false;
    data.coins -= amount;
    this._saveData(username, data);
    return true;
  },

  /* ─── Flower operations ─── */

  getFlowers(username) {
    const data = this._getData(username);
    return data ? data.flowers : [];
  },

  collectFlower(username, type, rarity, tileX, tileY) {
    const data = this._getData(username);
    if (!data) return null;
    const flower = {
      id: generateId(),
      type,
      rarity,
      tileX,
      tileY,
      foundAt: new Date().toISOString()
    };
    data.flowers.push(flower);
    this._saveData(username, data);
    return flower;
  },

  removeFlower(username, flowerId) {
    const data = this._getData(username);
    if (!data) return false;
    const idx = data.flowers.findIndex(f => f.id === flowerId);
    if (idx === -1) return false;
    data.flowers.splice(idx, 1);
    this._saveData(username, data);
    return true;
  },

  /* ─── Value lookup ─── */

  getFlowerValue(rarity) {
    const values = {
      common: 10,
      uncommon: 35,
      rare: 100,
      epic: 250,
      legendary: 500
    };
    return values[rarity] || 5;
  },

  getFlowerTypeLabel(type) {
    const t = this.FLOWER_TYPES.find(f => f.type === type);
    return t ? t.label : type;
  },

  /* ─── Pick a random flower type weighted by rarity ─── */

  pickRandomFlowerType(zoneRarityBonus) {
    zoneRarityBonus = zoneRarityBonus || 0;

    // Build weighted list based on current active player's luck (optional)
    const weights = {};
    for (const [rarity, baseWeight] of Object.entries(this.RARITY_WEIGHTS)) {
      let w = baseWeight;
      // Zones can boost higher rarities
      if (rarity === 'uncommon') w += zoneRarityBonus * 3;
      if (rarity === 'rare') w += zoneRarityBonus * 2;
      if (rarity === 'epic') w += zoneRarityBonus;
      weights[rarity] = Math.max(1, w);
    }

    // Roll rarity
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    let chosenRarity = 'common';
    for (const [rarity, weight] of Object.entries(weights)) {
      roll -= weight;
      if (roll <= 0) { chosenRarity = rarity; break; }
    }

    // Pick a random flower of that rarity
    const candidates = this.FLOWER_TYPES.filter(f => f.rarity === chosenRarity);
    return candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : this.FLOWER_TYPES[0];
  },

    /* ─── Customization shop data ─── */

  CUSTOMIZATIONS: {
    frames: [
      { id: 'none',     label: 'No Frame',     cost: 0,     rarity: null },
      { id: 'silver',   label: 'Silver Frame',  cost: 50,   rarity: 'common' },
      { id: 'gold',     label: 'Gold Frame',    cost: 150,  rarity: 'uncommon' },
      { id: 'crown',    label: 'Pixel Crown',   cost: 300,  rarity: 'rare' },
      { id: 'rainbow',  label: 'Rainbow Frame', cost: 600,  rarity: 'epic' },
      { id: 'star',     label: 'Starlight',     cost: 1200, rarity: 'legendary' }
    ],
    nameColors: [
      { id: 'default', label: 'Default',   color: '#FFFFFF', cost: 0 },
      { id: 'green',   label: 'Mint',      color: '#22C55E', cost: 50 },
      { id: 'blue',    label: 'Sky',       color: '#4A90D9', cost: 100 },
      { id: 'purple',  label: 'Amethyst',  color: '#9B59B6', cost: 200 },
      { id: 'gold',    label: 'Golden',    color: '#FFD700', cost: 350 },
      { id: 'coral',   label: 'Coral',     color: '#E74C3C', cost: 500 },
      { id: 'rainbow', label: 'Prismatic', color: '#FF69B4', cost: 800 }
    ],
    themes: [
      { id: 'blue',     label: 'XP Blue',    cost: 0 },
      { id: 'silver',   label: 'XP Silver',  cost: 0 },
      { id: 'olive',    label: 'XP Olive',   cost: 0 },
      { id: 'midnight', label: 'Midnight',   cost: 200 },
      { id: 'sunset',   label: 'Sunset',     cost: 350 },
      { id: 'forest',   label: 'Forest',     cost: 500 }
    ]
  },

  /* ─── Customization data helpers ─── */

  _ensureCustomizations(data) {
    if (!data.customizations) {
      data.customizations = {
        frame: 'none',
        nameColor: 'default',
        theme: 'blue'
      };
    }
    return data;
  },

  getCustomizations(username) {
    const data = this._getData(username);
    if (!data) return null;
    this._ensureCustomizations(data);
    return { ...data.customizations };
  },

  updateCustomization(username, type, value) {
    const data = this._getData(username);
    if (!data) return false;
    this._ensureCustomizations(data);
    data.customizations[type] = value;
    this._saveData(username, data);
    return true;
  },

  /* ─── Purchase helpers ─── */

  findShopItem(category, id) {
    const cat = this.CUSTOMIZATIONS[category];
    if (!cat) return null;
    return cat.find(item => item.id === id) || null;
  },

  purchaseCustomization(username, category, itemId) {
    const item = this.findShopItem(category, itemId);
    if (!item) return { success: false, reason: 'Item not found' };
    if (item.cost === 0) {
      this.updateCustomization(username, this._catToType(category), itemId);
      return { success: true };
    }
    if (!this.spendCoins(username, item.cost)) {
      return { success: false, reason: 'Not enough coins' };
    }
    this.updateCustomization(username, this._catToType(category), itemId);
    return { success: true };
  },

  _catToType(category) {
    const map = { frames: 'frame', nameColors: 'nameColor', themes: 'theme' };
    return map[category] || category;
  },

  /* ─── Canvas shop data ─── */

  CANVAS_SIZES: [
    { id: 'small',  label: 'Small (16×16)',   tilesW: 1, tilesH: 1, cost: 50  },
    { id: 'medium', label: 'Medium (32×32)',  tilesW: 2, tilesH: 2, cost: 150 },
    { id: 'large',  label: 'Large (48×48)',   tilesW: 3, tilesH: 3, cost: 300 },
    { id: 'xlarge', label: 'X-Large (64×64)', tilesW: 4, tilesH: 4, cost: 500 }
  ],

  PLOT_TILE_COST: 50,

  /* ─── Canvas operations ─── */

  _ensureArt(data) {
    if (!data.canvases) data.canvases = [];
    if (!data.plots) data.plots = [];
    if (data.plotTokens === undefined) data.plotTokens = 0;
    return data;
  },

  getCanvases(username) {
    const data = this._getData(username);
    if (!data) return [];
    this._ensureArt(data);
    return [...data.canvases];
  },

  buyCanvas(username, sizeId) {
    const size = this.CANVAS_SIZES.find(s => s.id === sizeId);
    if (!size) return { success: false, reason: 'Unknown canvas size' };
    if (!this.spendCoins(username, size.cost)) return { success: false, reason: 'Not enough coins' };

    const data = this._getData(username);
    this._ensureArt(data);
    const canvas = {
      id: generateId(),
      sizeId: size.id,
      tilesW: size.tilesW,
      tilesH: size.tilesH,
      name: 'Untitled',
      pixelData: null, // null = blank; filled when saved from editor
      createdAt: new Date().toISOString()
    };
    data.canvases.push(canvas);
    this._saveData(username, data);
    return { success: true, canvas };
  },

  saveCanvasData(username, canvasId, name, pixelData) {
    const data = this._getData(username);
    if (!data) return false;
    this._ensureArt(data);
    const canvas = data.canvases.find(c => c.id === canvasId);
    if (!canvas) return false;
    canvas.name = name || canvas.name;
    canvas.pixelData = pixelData;
    this._saveData(username, data);
    return true;
  },

  /* ─── Plot operations ─── */

  getPlots(username) {
    const data = this._getData(username);
    if (!data) return [];
    this._ensureArt(data);
    return [...data.plots];
  },

  getPlotTokens(username) {
    const data = this._getData(username);
    if (!data) return 0;
    this._ensureArt(data);
    return data.plotTokens;
  },

  buyPlotToken(username) {
    if (!this.spendCoins(username, this.PLOT_TILE_COST)) {
      return { success: false, reason: 'Not enough coins' };
    }
    const data = this._getData(username);
    this._ensureArt(data);
    data.plotTokens += 1;
    this._saveData(username, data);
    return { success: true, tokens: data.plotTokens };
  },

  claimPlot(username, tileX, tileY) {
    const data = this._getData(username);
    if (!data) return { success: false, reason: 'Not logged in' };
    this._ensureArt(data);
    if (data.plotTokens <= 0) return { success: false, reason: 'No plot tokens left' };
    if (data.plots.some(p => p.tileX === tileX && p.tileY === tileY)) {
      return { success: false, reason: 'Tile already owned' };
    }
    data.plotTokens -= 1;
    data.plots.push({
      id: generateId(),
      tileX,
      tileY,
      canvasId: null // null = empty plot; filled when art is placed
    });
    this._saveData(username, data);
    return { success: true };
  },

  placeArtOnPlot(username, tileX, tileY, canvasId) {
    const data = this._getData(username);
    if (!data) return { success: false, reason: 'Not logged in' };
    this._ensureArt(data);

    const plot = data.plots.find(p => p.tileX === tileX && p.tileY === tileY);
    if (!plot) return { success: false, reason: 'Plot not owned' };

    const canvas = data.canvases.find(c => c.id === canvasId);
    if (!canvas) return { success: false, reason: 'Canvas not found' };
    if (!canvas.pixelData) return { success: false, reason: 'Canvas is blank — edit it first!' };

    // Check canvas fits in available plot tiles (must own all tiles in the canvas footprint)
    const neededTiles = [];
    for (let dy = 0; dy < canvas.tilesH; dy++) {
      for (let dx = 0; dx < canvas.tilesW; dx++) {
        const tx = tileX + dx;
        const ty = tileY + dy;
        const owned = data.plots.some(p => p.tileX === tx && p.tileY === ty);
        if (!owned) {
          return { success: false, reason: 'You don\'t own all tiles needed for this canvas size' };
        }
        neededTiles.push({ tileX: tx, tileY: ty });
      }
    }

    // Place the art on the anchor plot
    plot.canvasId = canvasId;
    this._saveData(username, data);
    return { success: true, canvas, neededTiles };
  },

  getAllPlacedArt(username) {
    const data = this._getData(username);
    if (!data) return [];
    this._ensureArt(data);
    const result = [];
    for (const plot of data.plots) {
      if (plot.canvasId) {
        const canvas = data.canvases.find(c => c.id === plot.canvasId);
        if (canvas && canvas.pixelData) {
          result.push({
            tileX: plot.tileX,
            tileY: plot.tileY,
            tilesW: canvas.tilesW,
            tilesH: canvas.tilesH,
            pixelData: canvas.pixelData,
            canvasName: canvas.name,
            canvasId: canvas.id
          });
        }
      }
    }
    return result;
  },

  removeArtFromPlot(username, tileX, tileY) {
    const data = this._getData(username);
    if (!data) return false;
    this._ensureArt(data);
    const plot = data.plots.find(p => p.tileX === tileX && p.tileY === tileY);
    if (!plot) return false;
    plot.canvasId = null;
    this._saveData(username, data);
    return true;
  },

  /* ─── Tutorial tracking ─── */

  isTutorialCompleted(username) {
    if (!username) return true;
    const data = this._getData(username);
    if (!data) return true;
    this._ensureArt(data);
    return data.tutorialCompleted === true;
  },

  markTutorialCompleted(username) {
    const data = this._getData(username);
    if (!data) return;
    this._ensureArt(data);
    data.tutorialCompleted = true;
    // Move flowers field to end for clean storage
    this._saveData(username, data);
  },

  /* ─── Art Market ─── */

  MARKET_KEY: 'retromap-market',

  _getMarket() {
    try {
      return JSON.parse(localStorage.getItem(this.MARKET_KEY)) || [];
    } catch { return []; }
  },

  _saveMarket(listings) {
    localStorage.setItem(this.MARKET_KEY, JSON.stringify(listings));
  },

  getMarketListings() {
    return this._getMarket();
  },

  getMyListings(username) {
    return this._getMarket().filter(l => l.sellerUsername === username);
  },

  listCanvasForSale(username, canvasId, price) {
    const data = this._getData(username);
    if (!data) return { success: false, reason: 'Not logged in' };
    this._ensureArt(data);

    const canvas = data.canvases.find(c => c.id === canvasId);
    if (!canvas) return { success: false, reason: 'Canvas not found' };
    if (!canvas.pixelData) return { success: false, reason: 'Canvas is blank — edit it first!' };
    if (price < 1) return { success: false, reason: 'Price must be at least 1 coin' };

    const user = StorageService.getUser(username);

    // Remove canvas from seller's inventory
    data.canvases = data.canvases.filter(c => c.id !== canvasId);

    // Remove from any plots it was placed on
    for (const plot of data.plots) {
      if (plot.canvasId === canvasId) {
        plot.canvasId = null;
      }
    }

    this._saveData(username, data);

    // Add to market
    const listing = {
      id: generateId(),
      sellerUsername: username,
      sellerDisplayName: user ? user.displayName : username,
      canvasId: canvasId,
      name: canvas.name,
      sizeId: canvas.sizeId,
      tilesW: canvas.tilesW,
      tilesH: canvas.tilesH,
      pixelData: canvas.pixelData,
      price: price,
      listedAt: new Date().toISOString()
    };

    const market = this._getMarket();
    market.push(listing);
    this._saveMarket(market);

    return { success: true, listing };
  },

  buyFromMarket(buyerUsername, listingId) {
    const market = this._getMarket();
    const idx = market.findIndex(l => l.id === listingId);
    if (idx === -1) return { success: false, reason: 'Listing not found' };

    const listing = market[idx];
    if (listing.sellerUsername === buyerUsername) {
      return { success: false, reason: 'You can\'t buy your own art!' };
    }

    // Deduct coins from buyer
    if (!this.spendCoins(buyerUsername, listing.price)) {
      return { success: false, reason: 'Not enough coins' };
    }

    // Add coins to seller
    this.addCoins(listing.sellerUsername, listing.price);

    // Clone canvas to buyer's inventory
    const buyerData = this._getData(buyerUsername);
    this._ensureArt(buyerData);
    const newCanvas = {
      id: generateId(),
      sizeId: listing.sizeId,
      tilesW: listing.tilesW,
      tilesH: listing.tilesH,
      name: listing.name + ' (bought)',
      pixelData: [...listing.pixelData],
      createdAt: new Date().toISOString()
    };
    buyerData.canvases.push(newCanvas);
    this._saveData(buyerUsername, buyerData);

    // Remove listing from market
    market.splice(idx, 1);
    this._saveMarket(market);

    return { success: true, canvas: newCanvas };
  },

  unlistFromMarket(username, listingId) {
    const market = this._getMarket();
    const idx = market.findIndex(l => l.id === listingId);
    if (idx === -1) return { success: false, reason: 'Listing not found' };

    const listing = market[idx];
    if (listing.sellerUsername !== username) {
      return { success: false, reason: 'Not your listing' };
    }

    // Return canvas to seller's inventory
    const data = this._getData(username);
    this._ensureArt(data);
    data.canvases.push({
      id: listing.canvasId,
      sizeId: listing.sizeId,
      tilesW: listing.tilesW,
      tilesH: listing.tilesH,
      name: listing.name,
      pixelData: listing.pixelData,
      createdAt: new Date().toISOString()
    });
    this._saveData(username, data);

    // Remove listing
    market.splice(idx, 1);
    this._saveMarket(market);

    return { success: true };
  },

  /* ─── Wire up Feed events for coin rewards ─── */
  wireFeedEvents() {
    listenEvent('post-liked', (e) => {
      // Only reward if someone else likes your post
      if (e.detail.by === e.detail.postAuthor) return;
      this.addCoins(e.detail.postAuthor, 1);
    });

    listenEvent('comment-added', (e) => {
      if (e.detail.by === e.detail.postAuthor) return;
      this.addCoins(e.detail.postAuthor, 2);
    });
  }
};
