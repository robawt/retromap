/* ═══════════════════════════════════════════════════════
   RetroMap — Window Manager (Singleton)
   ═══════════════════════════════════════════════════════ */

const WindowManager = {
  _windows: [],
  _zIndexCounter: 100,
  _container: null,

  /* ─── Initialize ─── */
  init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.id = containerId || 'windows-container';
      document.body.appendChild(this._container);
    }

    // Global mouse up handler to stop drag/resize
    document.addEventListener('mouseup', () => {
      this._onMouseUp();
    });

    document.addEventListener('mousemove', (e) => {
      this._onMouseMove(e);
    });
  },

  /* ─── Get next z-index ─── */
  getNextZIndex() {
    this._zIndexCounter += 1;
    return this._zIndexCounter;
  },

  /* ─── Create a new window ─── */
  createWindow(config) {
    const win = new Window(config);
    this._windows.push(win);
    this._container.appendChild(win.element);
    win.focus();
    dispatchEvent('window-opened', { window: win });
    return win;
  },

  /* ─── Close a window by ID ─── */
  closeWindow(windowId) {
    const win = this.getWindow(windowId);
    if (win) win.close();
  },

  /* ─── Get window by ID ─── */
  getWindow(windowId) {
    return this._windows.find(w => w.id === windowId);
  },

  /* ─── Get all open windows ─── */
  getOpenWindows() {
    return this._windows.filter(w => w.state !== 'closed');
  },

  /* ─── Get taskbar windows (open + minimized) ─── */
  getTaskbarWindows() {
    return this._windows.filter(w => w.state !== 'closed');
  },

  /* ─── Focus window ─── */
  focusWindow(windowId) {
    const win = this.getWindow(windowId);
    if (win) win.focus();
  },

  /* ─── Minimize window ─── */
  minimizeWindow(windowId) {
    const win = this.getWindow(windowId);
    if (win) win.minimize();
  },

  /* ─── Maximize / Restore window ─── */
  maximizeWindow(windowId) {
    const win = this.getWindow(windowId);
    if (win) win.maximize();
  },

  /* ─── Restore (unminimize) window ─── */
  restoreWindow(windowId) {
    const win = this.getWindow(windowId);
    if (win) win.restore();
  },

  /* ─── Called when a window is focused ─── */
  _onWindowFocus(win) {
    // Update taskbar active state
    dispatchEvent('taskbar-update');
  },

  /* ─── Called when a window changes state ─── */
  _onWindowStateChange(win) {
    dispatchEvent('taskbar-update');
  },

  /* ─── Called when a window is closed ─── */
  _onWindowClosed(win) {
    this._windows = this._windows.filter(w => w.id !== win.id);
    dispatchEvent('window-closed', { window: win });
    dispatchEvent('taskbar-update');
  },

  /* ─── Mouse handlers for drag/resize ─── */
  _onMouseUp() {
    for (const win of this._windows) {
      win._isDragging = false;
      win._isResizing = false;
    }
  },

  _onMouseMove(e) {
    for (const win of this._windows) {
      if (win._isDragging) {
        const newX = e.clientX - win._dragOffset.x;
        const newY = e.clientY - win._dragOffset.y;
        win._el.style.left = Math.max(0, newX) + 'px';
        win._el.style.top = Math.max(0, newY) + 'px';
      }
      if (win._isResizing) {
        const newW = Math.max(win.minWidth, win._startWidth + (e.clientX - win._startX));
        const newH = Math.max(win.minHeight, win._startHeight + (e.clientY - win._startY));
        win._el.style.width = newW + 'px';
        win._el.style.height = newH + 'px';
      }
    }
  }
};
