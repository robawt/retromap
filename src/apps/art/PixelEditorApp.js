/* ═══════════════════════════════════════════════════════
   RetroMap — Pixel Editor App
   Edit pixel art canvases with a 16×16 grid & palette
   ═══════════════════════════════════════════════════════ */

const PixelEditorApp = {
  title: 'Pixel Editor',
  defaultWidth: 520,
  defaultHeight: 520,
  minWidth: 400,
  minHeight: 400,
  resizable: false,

  _container: null,
  _user: null,
  _canvases: [],
  _activeCanvas: null,   // currently editing
  _pixelGrid: [],        // 2D array of colors
  _selectedColor: '#000000',
  _editingName: false,

  /* ─── Palette colors (16 retro colors) ─── */
  PALETTE: [
    '#000000', '#FFFFFF', '#E81123', '#FF69B4',
    '#FFD700', '#F1C40F', '#22C55E', '#00A651',
    '#4A90D9', '#2C6BB8', '#9B59B6', '#8E44AD',
    '#E67E22', '#D35400', '#808080', '#C0C0C0'
  ],

  render(container) {
    this._container = container;
    container.className = 'pixel-editor-container';
    this._user = StorageService.getFullActiveUser();

    if (!this._user) {
      container.innerHTML = '<div class="xp-loading" style="text-align:center;padding:40px;"><p>Sign in to use the Pixel Editor.</p></div>';
      return;
    }

    this._canvases = EconomyService.getCanvases(this._user.username);
    this._renderCanvasList();
  },

  /* ─── Canvas List Screen ─── */
  _renderCanvasList() {
    this._container.innerHTML = '';
    this._activeCanvas = null;

    const header = document.createElement('div');
    header.className = 'pixel-editor-header';
    header.innerHTML = '<div class="pixel-editor-title">My Canvases</div>';
    this._container.appendChild(header);

    const list = document.createElement('div');
    list.className = 'pixel-editor-list';

    if (this._canvases.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'pixel-editor-empty';
      empty.textContent = 'No canvases yet. Buy one from Flora in Retro World!';
      list.appendChild(empty);
    } else {
      for (const canvas of this._canvases) {
        const card = document.createElement('div');
        card.className = 'pixel-editor-card';
        if (canvas.pixelData) card.classList.add('has-art');

        const preview = document.createElement('div');
        preview.className = 'pixel-editor-card-preview';
        if (canvas.pixelData) {
          // Show a mini preview (scale down)
          const size = Math.min(canvas.tilesW, canvas.tilesH) * 16;
          const previewCanvas = document.createElement('canvas');
          previewCanvas.width = size;
          previewCanvas.height = size;
          previewCanvas.style.width = '48px';
          previewCanvas.style.height = '48px';
          previewCanvas.style.imageRendering = 'pixelated';
          const ctx = previewCanvas.getContext('2d');
          const data = canvas.pixelData;
          const dim = Math.sqrt(data.length);
          const cellW = size / dim;
          const cellH = size / dim;
          for (let i = 0; i < data.length; i++) {
            const px = i % dim;
            const py = Math.floor(i / dim);
            ctx.fillStyle = data[i] || '#00000000';
            ctx.fillRect(px * cellW, py * cellH, cellW, cellH);
          }
          preview.appendChild(previewCanvas);
        } else {
          preview.innerHTML = '<div class="pixel-editor-card-blank">Blank</div>';
        }
        card.appendChild(preview);

        const info = document.createElement('div');
        info.className = 'pixel-editor-card-info';
        const nameSpan = document.createElement('div');
        nameSpan.className = 'pixel-editor-card-name';
        nameSpan.textContent = canvas.name || 'Untitled';
        info.appendChild(nameSpan);
        const sizeSpan = document.createElement('div');
        sizeSpan.className = 'pixel-editor-card-size';
        const sizeInfo = EconomyService.CANVAS_SIZES.find(s => s.id === canvas.sizeId);
        sizeSpan.textContent = sizeInfo ? sizeInfo.label : (canvas.tilesW + 'x' + canvas.tilesH + ' tiles');
        info.appendChild(sizeSpan);
        card.appendChild(info);

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'xp-button pixel-editor-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => this._openEditor(canvas));
        card.appendChild(editBtn);

        // List for Sale + Share to Feed buttons (only for edited canvases)
        if (canvas.pixelData) {
          const shareBtn = document.createElement('button');
          shareBtn.className = 'xp-button pixel-editor-btn';
          shareBtn.textContent = 'Share';
          shareBtn.title = 'Share this art on the feed';
          shareBtn.addEventListener('click', () => this._shareToFeed(canvas));
          card.appendChild(shareBtn);

          const sellBtn = document.createElement('button');
          sellBtn.className = 'xp-button pixel-editor-btn';
          sellBtn.textContent = 'Sell';
          sellBtn.title = 'List this art on the marketplace';
          sellBtn.addEventListener('click', () => this._promptListForSale(canvas));
          card.appendChild(sellBtn);
        }

        list.appendChild(card);
      }
    }

    this._container.appendChild(list);
  },

  /* ═══════════════════════════════════════════════════
     Pixel Editor Grid
     ═══════════════════════════════════════════════════ */

  _openEditor(canvas) {
    this._activeCanvas = canvas;
    this._container.innerHTML = '';
    this._editingName = false;

    // Build the pixel grid from saved data, or init blank
    const dim = Math.max(canvas.tilesW, canvas.tilesH) * 16;
    this._pixelGrid = [];
    if (canvas.pixelData && canvas.pixelData.length === dim * dim) {
      for (let y = 0; y < dim; y++) {
        this._pixelGrid[y] = [];
        for (let x = 0; x < dim; x++) {
          this._pixelGrid[y][x] = canvas.pixelData[y * dim + x] || '#00000000';
        }
      }
    } else {
      // Init blank (transparent)
      for (let y = 0; y < dim; y++) {
        this._pixelGrid[y] = [];
        for (let x = 0; x < dim; x++) {
          this._pixelGrid[y][x] = '#00000000';
        }
      }
    }

    // Header with name and save
    const header = document.createElement('div');
    header.className = 'pixel-editor-editor-header';

    const nameRow = document.createElement('div');
    nameRow.className = 'pixel-editor-name-row';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'xp-input pixel-editor-name-input';
    nameInput.value = canvas.name || 'Untitled';
    nameRow.appendChild(nameInput);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'xp-button pixel-editor-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const flat = this._pixelGrid.flat();
      EconomyService.saveCanvasData(this._user.username, canvas.id, nameInput.value || 'Untitled', flat);
      // Visual feedback
      saveBtn.textContent = 'Saved!';
      setTimeout(() => { saveBtn.textContent = 'Save'; }, 1500);
    });
    nameRow.appendChild(saveBtn);

    const backBtn = document.createElement('button');
    backBtn.className = 'xp-button';
    backBtn.textContent = 'Back to List';
    backBtn.addEventListener('click', () => {
      this._canvases = EconomyService.getCanvases(this._user.username);
      this._renderCanvasList();
    });
    nameRow.appendChild(backBtn);

    header.appendChild(nameRow);
    this._container.appendChild(header);

    // Editor area
    const editorArea = document.createElement('div');
    editorArea.className = 'pixel-editor-editor-area';

    // Build grid
    const gridContainer = document.createElement('div');
    gridContainer.className = 'pixel-editor-grid';
    gridContainer.style.gridTemplateColumns = 'repeat(' + dim + ', 1fr)';

    this._cellElements = [];
    for (let y = 0; y < dim; y++) {
      this._cellElements[y] = [];
      for (let x = 0; x < dim; x++) {
        const cell = document.createElement('div');
        cell.className = 'pixel-editor-cell';
        cell.style.background = this._pixelGrid[y][x];
        cell.dataset.x = x;
        cell.dataset.y = y;

        // Click to paint individual cell
        cell.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this._paintCell(x, y);
        });

        // Drag to paint
        cell.addEventListener('mouseenter', (e) => {
          if (e.buttons === 1) {
            this._paintCell(x, y);
          }
        });

        gridContainer.appendChild(cell);
        this._cellElements[y][x] = cell;
      }
    }

    editorArea.appendChild(gridContainer);

    // Color palette (right side)
    const paletteContainer = document.createElement('div');
    paletteContainer.className = 'pixel-editor-palette';

    // Color swatches
    const swatches = document.createElement('div');
    swatches.className = 'pixel-editor-colors';
    for (const color of this.PALETTE) {
      const swatch = document.createElement('div');
      swatch.className = 'pixel-editor-swatch';
      swatch.style.background = color;
      swatch.dataset.color = color;
      if (color === this._selectedColor) swatch.classList.add('active');
      swatch.addEventListener('click', () => {
        this._selectedColor = color;
        swatches.querySelectorAll('.pixel-editor-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
      swatches.appendChild(swatch);
    }
    paletteContainer.appendChild(swatches);

    // Eraser button
    const eraserBtn = document.createElement('button');
    eraserBtn.className = 'xp-button pixel-editor-btn';
    eraserBtn.textContent = 'Eraser';
    eraserBtn.addEventListener('click', () => {
      this._selectedColor = '#00000000';
      swatches.querySelectorAll('.pixel-editor-swatch').forEach(s => s.classList.remove('active'));
    });
    paletteContainer.appendChild(eraserBtn);

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'xp-button pixel-editor-btn';
    clearBtn.textContent = 'Clear All';
    clearBtn.addEventListener('click', () => {
      for (let y = 0; y < dim; y++) {
        for (let x = 0; x < dim; x++) {
          this._pixelGrid[y][x] = '#00000000';
          this._cellElements[y][x].style.background = '#00000000';
        }
      }
    });
    paletteContainer.appendChild(clearBtn);

    editorArea.appendChild(paletteContainer);
    this._container.appendChild(editorArea);

    // Footer instructions
    const footer = document.createElement('div');
    footer.className = 'pixel-editor-footer';
    footer.innerHTML = 'Click cells to paint | Drag to paint multiple | Use the palette on the right';
    this._container.appendChild(footer);
  },

  _paintCell(x, y) {
    this._pixelGrid[y][x] = this._selectedColor;
    this._cellElements[y][x].style.background = this._selectedColor;
  },

  /* ─── List for Sale ─── */
  _promptListForSale(canvas) {
    const input = UIInput.create({ placeholder: 'Price in coins', value: '50', width: '100%' });
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
    const msg = document.createElement('p');
    msg.textContent = 'Set a price for "' + (canvas.name || 'Untitled') + '". ' +
      'The canvas will be removed from your inventory and listed for sale.';
    container.appendChild(msg);
    container.appendChild(createElement('label', {
      textContent: 'Price (coins):',
      style: { fontSize: '12px' }
    }));
    container.appendChild(input);

    UIDialog.show({
      title: 'List for Sale',
      content: container,
      buttons: [
        {
          label: 'Cancel',
          onClick: () => UIDialog.close()
        },
        {
          label: 'List Now',
          default: true,
          onClick: () => {
            const price = parseInt(input.value, 10);
            if (isNaN(price) || price < 1) {
              UIDialog.alert('Invalid Price', 'Please enter a valid number of coins (minimum 1).');
              return;
            }
            const result = EconomyService.listCanvasForSale(this._user.username, canvas.id, price);
            UIDialog.close();
            if (result.success) {
              this._canvases = EconomyService.getCanvases(this._user.username);
              this._renderCanvasList();
            } else {
              UIDialog.alert('Listing Failed', result.reason);
            }
          }
        }
      ]
    });

    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
  },

  /* ─── Share canvas to feed ─── */
  _shareToFeed(canvas) {
    if (!this._user) return;

    // Render the pixel data to a canvas, export as data URL
    const dim = Math.max(canvas.tilesW, canvas.tilesH) * 16;
    const cvs = document.createElement('canvas');
    cvs.width = dim;
    cvs.height = dim;
    const ctx = cvs.getContext('2d');
    if (canvas.pixelData) {
      const data = canvas.pixelData;
      const pxDim = Math.sqrt(data.length);
      const cellW = dim / pxDim;
      const cellH = dim / pxDim;
      for (let i = 0; i < data.length; i++) {
        const px = i % pxDim;
        const py = Math.floor(i / pxDim);
        ctx.fillStyle = data[i] || '#00000000';
        ctx.fillRect(px * cellW, py * cellH, cellW, cellH);
      }
    }
    const dataUrl = cvs.toDataURL('image/png');

    // Show a dialog for the caption
    const dialogContainer = document.createElement('div');
    dialogContainer.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    const preview = document.createElement('canvas');
    preview.width = dim;
    preview.height = dim;
    preview.style.cssText = 'width:96px;height:96px;image-rendering:pixelated;align-self:center;';
    const pCtx = preview.getContext('2d');
    pCtx.drawImage(cvs, 0, 0);
    dialogContainer.appendChild(preview);

    const label = document.createElement('label');
    label.textContent = 'Caption:';
    label.style.fontSize = '11px';
    dialogContainer.appendChild(label);

    const input = UIInput.create({
      placeholder: 'Write a caption...',
      value: 'Check out my pixel art!',
      width: '100%'
    });
    dialogContainer.appendChild(input);

    UIDialog.show({
      title: 'Share Art to Feed',
      content: dialogContainer,
      buttons: [
        { label: 'Cancel', onClick: () => UIDialog.close() },
        {
          label: 'Post',
          default: true,
          onClick: () => {
            const caption = input.value.trim() || 'Pixel art';
            const post = PostService.createPost(this._user, caption, dataUrl);
            UIDialog.close();
            if (post) {
              Notifications.success('Posted!', 'Your art has been shared to the feed.');
            }
          }
        }
      ]
    });

    setTimeout(() => input.focus(), 100);
  },

  destroy() {
    this._container = null;
    this._user = null;
    this._canvases = [];
    this._activeCanvas = null;
    this._pixelGrid = [];
    this._cellElements = [];
  }
};
