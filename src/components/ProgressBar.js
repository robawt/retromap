/* ═══════════════════════════════════════════════════════
   RetroMap — Progress Bar Component
   ═══════════════════════════════════════════════════════ */

const UIProgressBar = {
  /**
   * Create an XP-styled progress bar
   * @param {Object} config
   * @param {number} [config.percent] - Initial progress (0-100)
   * @param {boolean} [config.animated] - Animated stripes?
   * @param {string} [config.label] - Text label overlay
   * @param {string} [config.width] - Width (e.g., '200px')
   * @returns {HTMLElement} The progress bar container
   */
  create(config = {}) {
    const container = createElement('div', {
      className: 'xp-progress'
    });

    if (config.width) {
      container.style.width = config.width;
    }

    const classes = ['xp-progress-fill'];
    if (config.animated) classes.push('animated');
    const fill = createElement('div', {
      className: classes.join(' '),
      style: { width: (config.percent || 0) + '%' }
    });
    container.appendChild(fill);

    if (config.label !== undefined) {
      const label = createElement('div', {
        className: 'xp-progress-label',
        textContent: config.label || ''
      });
      container.appendChild(label);
    }

    return container;
  },

  /**
   * Update progress bar value
   * @param {HTMLElement} barEl - The progress bar element
   * @param {number} percent - New percentage (0-100)
   * @param {string} [label] - Optional new label
   */
  update(barEl, percent, label) {
    const fill = barEl.querySelector('.xp-progress-fill');
    if (fill) {
      fill.style.width = Math.min(100, Math.max(0, percent)) + '%';
    }
    const labelEl = barEl.querySelector('.xp-progress-label');
    if (labelEl && label !== undefined) {
      labelEl.textContent = label;
    }
  }
};
