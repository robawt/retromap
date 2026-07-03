/* ═══════════════════════════════════════════════════════
   RetroMap — Date Formatting Utilities
   ═══════════════════════════════════════════════════════ */

/**
 * Format a date to a time string (HH:MM AM/PM)
 */
function formatTime(date) {
  const d = date || new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format a date to a short date string (MM/DD/YYYY)
 */
function formatDate(date) {
  const d = date || new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format a date to a full date-time string
 */
function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Get a relative time string (e.g., "2 minutes ago", "just now")
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 5) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

/**
 * Update the taskbar clock element every second
 */
function startClock(selector) {
  const clockEl = typeof selector === 'string' ? document.getElementById(selector) : selector;
  if (!clockEl) return;

  function tick() {
    clockEl.textContent = formatTime(new Date());
  }

  tick();
  setInterval(tick, 1000);
}
