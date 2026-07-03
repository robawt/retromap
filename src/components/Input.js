/* ═══════════════════════════════════════════════════════
   RetroMap — Input Component Factory
   ═══════════════════════════════════════════════════════ */

const UIInput = {
  /**
   * Create an XP-styled text input
   * @param {Object} config
   * @param {string} [config.placeholder]
   * @param {string} [config.value]
   * @param {string} [config.width]
   * @param {boolean} [config.disabled]
   * @param {Function} [config.onChange]
   * @param {Function} [config.onEnter]
   * @returns {HTMLInputElement}
   */
  create(config = {}) {
    const input = createElement('input', {
      className: 'xp-input',
      type: 'text',
      placeholder: config.placeholder || '',
      value: config.value || '',
      disabled: config.disabled || false
    });

    if (config.width) {
      input.style.width = config.width;
    }

    if (config.onChange) {
      input.addEventListener('input', (e) => config.onChange(e.target.value, e));
    }

    if (config.onEnter) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') config.onEnter(input.value, e);
      });
    }

    return input;
  },

  /**
   * Create an XP-styled textarea
   * @param {Object} config
   * @returns {HTMLTextAreaElement}
   */
  createTextarea(config = {}) {
    const textarea = createElement('textarea', {
      className: 'xp-textarea',
      placeholder: config.placeholder || '',
      disabled: config.disabled || false
    });

    if (config.value) textarea.value = config.value;
    if (config.rows) textarea.rows = config.rows;
    if (config.cols) textarea.cols = config.cols;
    if (config.width) textarea.style.width = config.width;
    if (config.height) textarea.style.height = config.height;

    if (config.onChange) {
      textarea.addEventListener('input', (e) => config.onChange(e.target.value, e));
    }

    return textarea;
  }
};
