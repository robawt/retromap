/* ═══════════════════════════════════════════════════════
   RetroMap — Dialog Component
   ═══════════════════════════════════════════════════════ */

const UIDialog = {
  _activeDialog: null,
  _overlayEl: null,

  /* ─── Initialize the dialog system ─── */
  init() {
    this._overlayEl = document.getElementById('dialog-overlay');
    if (!this._overlayEl) {
      this._overlayEl = createElement('div', {
        id: 'dialog-overlay',
        className: 'xp-dialog-overlay hidden'
      });
      document.body.appendChild(this._overlayEl);
    }
  },

  /**
   * Show a modal dialog
   * @param {Object} config
   * @param {string} config.title - Dialog title
   * @param {string} config.content - HTML content for the body
   * @param {Array} [config.buttons] - Button configs (see UIButton.create)
   * @param {Function} [config.onClose] - Called when dialog closes
   * @param {boolean} [config.closeable] - Can user close with X?
   * @returns {Object} { dialog, close() }
   */
  show(config = {}) {
    this.close(); // Close any existing dialog

    const dialog = createElement('div', {
      className: 'xp-dialog',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': config.title || 'Dialog'
    });

    // Title bar
    const titlebar = createElement('div', { className: 'xp-dialog-titlebar' });
    titlebar.appendChild(document.createTextNode(config.title || 'Dialog'));

    if (config.closeable !== false) {
      const closeBtn = createElement('button', {
        className: 'xp-btn-title xp-btn-close',
        textContent: 'r',
        'aria-label': 'Close',
        style: { marginLeft: 'auto' }
      });
      closeBtn.addEventListener('click', () => this.close());
      titlebar.appendChild(closeBtn);
    }

    dialog.appendChild(titlebar);

    // Body
    const body = createElement('div', { className: 'xp-dialog-body' });
    if (typeof config.content === 'string') {
      if (config.html) {
        body.innerHTML = config.content;
      } else {
        body.textContent = config.content;
      }
    } else if (config.content instanceof HTMLElement) {
      body.appendChild(config.content);
    }
    dialog.appendChild(body);

    // Actions
    if (config.buttons && config.buttons.length > 0) {
      const actions = createElement('div', { className: 'xp-dialog-actions' });
      for (const btnConfig of config.buttons) {
        actions.appendChild(UIButton.create(btnConfig));
      }
      dialog.appendChild(actions);
    }

    // Remove old dialog and show
    const oldDialog = this._overlayEl.querySelector('.xp-dialog');
    if (oldDialog) oldDialog.remove();

    this._overlayEl.appendChild(dialog);
    this._overlayEl.classList.remove('hidden');

    this._onClose = config.onClose || null;

    // Focus first button or input
    const firstInput = dialog.querySelector('button, input');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);

    // Close on Escape
    this._keyHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this._keyHandler);

    return {
      dialog,
      close: () => this.close()
    };
  },

  /**
   * Show a simple alert dialog
   */
  alert(title, message) {
    return this.show({
      title,
      content: message,
      buttons: [{ label: 'OK', default: true, onClick: () => this.close() }]
    });
  },

  /**
   * Show a confirm dialog
   * @returns {Promise<boolean>}
   */
  confirm(title, message) {
    return new Promise((resolve) => {
      this.show({
        title,
        content: message,
        buttons: [
          { label: 'Cancel', onClick: () => { this.close(); resolve(false); } },
          { label: 'OK', default: true, onClick: () => { this.close(); resolve(true); } }
        ]
      });
    });
  },

  /**
   * Show a prompt dialog
   * @returns {Promise<string|null>}
   */
  prompt(title, message, defaultValue = '') {
    return new Promise((resolve) => {
      const input = UIInput.create({ value: defaultValue, width: '100%' });
      const container = createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
      container.appendChild(createElement('p', { textContent: message }));
      container.appendChild(input);

      this.show({
        title,
        content: container,
        buttons: [
          { label: 'Cancel', onClick: () => { this.close(); resolve(null); } },
          { label: 'OK', default: true, onClick: () => { this.close(); resolve(input.value); } }
        ]
      });

      setTimeout(() => input.focus(), 50);
    });
  },

  /**
   * Close the active dialog
   */
  close() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    this._overlayEl.classList.add('hidden');
    const dialog = this._overlayEl.querySelector('.xp-dialog');
    if (dialog) dialog.remove();
    if (this._onClose) {
      this._onClose();
      this._onClose = null;
    }
  }
};
