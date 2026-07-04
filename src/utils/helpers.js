/* ═══════════════════════════════════════════════════════
   RetroMap — Utility Helpers
   ═══════════════════════════════════════════════════════ */

/**
 * Generate a UUID v4
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/**
 * Clamp a number between min and max
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce a function
 */
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/**
 * Format a number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get element by ID shorthand
 */
function $(id) {
  return document.getElementById(id);
}

/**
 * Query selector shorthand
 */
function qs(selector, parent) {
  return (parent || document).querySelector(selector);
}

/**
 * Query selector all shorthand
 */
function qsa(selector, parent) {
  return (parent || document).querySelectorAll(selector);
}

/**
 * Create an element with properties
 */
function createElement(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('data-')) {
      el.setAttribute(key, value);
    } else if (key === 'innerHTML') {
      el.innerHTML = value;
    } else {
      el[key] = value;
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }
  return el;
}

/**
 * Dispatch a custom event
 */
function dispatchEvent(eventName, detail = {}) {
  const event = new CustomEvent(eventName, { detail, bubbles: true });
  document.dispatchEvent(event);
}

/**
 * Listen for a custom event
 */
function listenEvent(eventName, handler) {
  document.addEventListener(eventName, handler);
}

/**
 * Remove a custom event listener
 */
function removeEvent(eventName, handler) {
  document.removeEventListener(eventName, handler);
}
