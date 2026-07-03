/* ═══════════════════════════════════════════════════════
   RetroMap — Window Component
   ═══════════════════════════════════════════════════════ */

class Window {
  constructor(config) {
    this.id = config.id || generateId();
    this.title = config.title || 'Window';
    this.icon = config.icon || '';
    this.width = config.width || 400;
    this.height = config.height || 300;
    this.x = config.x || 100;
    this.y = config.y || 50;
    this.minWidth = config.minWidth || 250;
    this.minHeight = config.minHeight || 150;
    this.app = config.app || null;       // App instance (renderer)
    this.menuBar = config.menuBar || null; // Array of menu items
    this.statusBar = config.statusBar || null; // Status bar text
    this.resizable = config.resizable !== false;
    this._state = 'open';  // 'open' | 'minimized' | 'maximized' | 'closed'
    this._prevSize = null; // Store size/pos before maximize
    this._isDragging = false;
    this._isResizing = false;
    this._dragOffset = { x: 0, y: 0 };
    this._resizeDir = null;
    this._startWidth = null;
    this._startHeight = null;
    this._startX = null;
    this._startY = null;
    this._zIndex = WindowManager.getNextZIndex();

    this._build();
    this._render();
  }

  /* ─── Getters ─── */
  get state() { return this._state; }
  get element() { return this._el; }
  get contentArea() { return this._contentArea; }

  /* ─── Set State ─── */
  setState(state) {
    const prev = this._state;
    this._state = state;
    this._el.classList.remove('window-open', 'window-minimized', 'window-maximized');
    this._el.classList.add('window-' + state);

    if (state === 'minimized') {
      this._el.style.display = 'none';
    } else {
      this._el.style.display = 'flex';
      if (state === 'maximized') {
        this._el.style.left = '0';
        this._el.style.top = '0';
        this._el.style.width = '100%';
        this._el.style.height = '100%';
      } else if (state === 'open' && prev === 'maximized') {
        this._restoreSize();
      }
    }

    WindowManager._onWindowStateChange(this);
  }

  /* ─── Build DOM ─── */
  _build() {
    this._el = createElement('div', {
      className: 'xp-window',
      id: 'win-' + this.id,
      style: {
        left: this.x + 'px',
        top: this.y + 'px',
        width: this.width + 'px',
        height: this.height + 'px',
        zIndex: this._zIndex
      }
    });

    // ── Title Bar ──
    this._titlebar = createElement('div', { className: 'xp-window-titlebar' });

    if (this.icon) {
      this._titlebar.appendChild(
        createElement('img', {
          className: 'xp-window-icon',
          src: this.icon,
          alt: '',
          onerror: 'this.style.display="none"'
        })
      );
    }

    this._titleText = createElement('span', {
      className: 'xp-window-title',
      textContent: this.title
    });
    this._titlebar.appendChild(this._titleText);

    // Title bar buttons
    const controls = createElement('div', { className: 'xp-window-controls' });

    const btnMin = createElement('button', {
      className: 'xp-btn-title',
      textContent: '0',  // Webdings minimize character
      title: 'Minimize',
      'aria-label': 'Minimize'
    });
    btnMin.addEventListener('click', (e) => { e.stopPropagation(); this.minimize(); });

    const btnMax = createElement('button', {
      className: 'xp-btn-title',
      textContent: '1',  // Webdings maximize character
      title: 'Maximize',
      'aria-label': 'Maximize'
    });
    btnMax.addEventListener('click', (e) => { e.stopPropagation(); this.maximize(); });

    const btnClose = createElement('button', {
      className: 'xp-btn-title xp-btn-close',
      textContent: 'r',  // Webdings close character
      title: 'Close',
      'aria-label': 'Close'
    });
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); this.close(); });

    controls.appendChild(btnMin);
    controls.appendChild(btnMax);
    controls.appendChild(btnClose);
    this._titlebar.appendChild(controls);

    this._el.appendChild(this._titlebar);

    // ── Menu Bar ──
    if (this.menuBar) {
      this._menuBar = createElement('div', { className: 'xp-window-menubar' });
      for (const item of this.menuBar) {
        const btn = createElement('button', {
          className: 'xp-window-menubar-item',
          textContent: item.label
        });
        if (item.onClick) btn.addEventListener('click', item.onClick);
        this._menuBar.appendChild(btn);
      }
      this._el.appendChild(this._menuBar);
    }

    // ── Body / Content Area ──
    this._body = createElement('div', { className: 'xp-window-body' });
    this._contentArea = createElement('div', { className: 'xp-window-content' });
    this._body.appendChild(this._contentArea);
    this._el.appendChild(this._body);

    // ── Status Bar ──
    if (this.statusBar !== null) {
      this._statusBar = createElement('div', {
        className: 'xp-window-statusbar',
        textContent: this.statusBar
      });
      this._el.appendChild(this._statusBar);
    }

    // ── Resize Handle ──
    if (this.resizable) {
      this._resizeHandle = createElement('div', { className: 'xp-resize-handle' });
      this._el.appendChild(this._resizeHandle);
      this._initResize();
    }

    // ── Events ──
    this._initDrag();

    // Focus on click
    this._el.addEventListener('mousedown', () => this.focus());
  }

  /* ─── Render App Content ─── */
  _render() {
    if (this.app && typeof this.app.render === 'function') {
      this.app.render(this._contentArea);
    }
  }

  /* ─── Drag (Title Bar) ─── */
  _initDrag() {
    const titlebar = this._titlebar;
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.xp-window-controls')) return;
      if (this._state === 'maximized') return;
      this.focus();
      this._isDragging = true;
      this._dragOffset.x = e.clientX - this._el.offsetLeft;
      this._dragOffset.y = e.clientY - this._el.offsetTop;
    });
  }

  /* ─── Resize ─── */
  _initResize() {
    this._resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.focus();
      this._isResizing = true;
      this._startWidth = this._el.offsetWidth;
      this._startHeight = this._el.offsetHeight;
      this._startX = e.clientX;
      this._startY = e.clientY;
    });
  }

  /* ─── Focus ─── */
  focus() {
    this._zIndex = WindowManager.getNextZIndex();
    this._el.style.zIndex = this._zIndex;
    WindowManager._onWindowFocus(this);
  }

  /* ─── Minimize ─── */
  minimize() {
    if (this._state === 'minimized') return;
    this.setState('minimized');
  }

  /* ─── Maximize / Restore ─── */
  maximize() {
    if (this._state === 'maximized') {
      this._restoreSize();
      this.setState('open');
    } else {
      this._prevSize = {
        x: this._el.offsetLeft,
        y: this._el.offsetTop,
        width: this._el.offsetWidth,
        height: this._el.offsetHeight
      };
      this.setState('maximized');
    }
  }

  /* ─── Restore from Maximized ─── */
  _restoreSize() {
    if (!this._prevSize) return;
    // Clamp restore position to prevent off-screen
    const maxX = Math.max(0, window.innerWidth - this._prevSize.width - 50);
    const maxY = Math.max(0, window.innerHeight - this._prevSize.height - 50);
    this._el.style.left = Math.min(this._prevSize.x, maxX) + 'px';
    this._el.style.top = Math.min(this._prevSize.y, maxY) + 'px';
    this._el.style.width = this._prevSize.width + 'px';
    this._el.style.height = this._prevSize.height + 'px';
  }

  /* ─── Close ─── */
  close() {
    if (this.app && typeof this.app.destroy === 'function') {
      this.app.destroy();
    }
    this.setState('closed');
    this._el.remove();
    WindowManager._onWindowClosed(this);
  }

  /**
   * Restore from minimized state
   */
  restore() {
    if (this._state === 'minimized') {
      this.setState('open');
      this.focus();
    }
  }

  /**
   * Update the window title
   */
  setTitle(title) {
    this.title = title;
    this._titleText.textContent = title;
  }

  /**
   * Set status bar text
   */
  setStatus(text) {
    if (this._statusBar) {
      this._statusBar.textContent = text;
    }
  }
}
