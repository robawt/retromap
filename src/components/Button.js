/* ═══════════════════════════════════════════════════════
   RetroMap — Button Component Factory
   ═══════════════════════════════════════════════════════ */

const UIButton = {
  /**
   * Create an XP-styled button
   * @param {Object} config
   * @param {string} config.label - Button text
   * @param {Function} config.onClick - Click handler
   * @param {boolean} [config.default] - Is this the default button?
   * @param {boolean} [config.disabled] - Is the button disabled?
   * @param {string} [config.width] - Optional width (e.g., '100px')
   * @returns {HTMLButtonElement}
   */
  create(config = {}) {
    const classes = ['xp-button'];
    if (config.default) classes.push('xp-button-default');

    const btn = createElement('button', {
      className: classes.join(' '),
      textContent: config.label || 'OK',
      disabled: config.disabled || false
    });

    if (config.width) {
      btn.style.width = config.width;
    }

    if (config.onClick) {
      btn.addEventListener('click', config.onClick);
    }

    return btn;
  },

  /**
   * Create a button group (OK / Cancel style)
   * @param {Array} buttons - Array of button configs
   * @returns {HTMLElement} A div containing the buttons
   */
  createGroup(buttons = []) {
    const group = createElement('div', {
      className: 'xp-button-group',
      style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' }
    });

    for (const btnConfig of buttons) {
      group.appendChild(this.create(btnConfig));
    }

    return group;
  }
};
