/* ═══════════════════════════════════════════════════════
   RetroMap — Taskbar
   ═══════════════════════════════════════════════════════ */

const Taskbar = {
  _container: null,
  _itemsContainer: null,
  _startButton: null,
  _clockEl: null,

  /* ─── Initialize ─── */
  init() {
    this._container = document.getElementById('taskbar');
    this._itemsContainer = document.getElementById('taskbar-items');
    this._startButton = document.getElementById('start-button');
    this._clockEl = document.getElementById('taskbar-clock');

    if (!this._container) {
      this._container = createElement('div', { id: 'taskbar', className: 'xp-taskbar' });
      document.body.appendChild(this._container);
    }

    // Start button
    if (!this._startButton) {
      this._startButton = createElement('button', {
        id: 'start-button',
        className: 'xp-start-button',
        innerHTML: '<span>Start</span>'
      });
      this._container.prepend(this._startButton);
    }

    // Items container
    if (!this._itemsContainer) {
      this._itemsContainer = createElement('div', { id: 'taskbar-items', className: 'xp-taskbar-items' });
      this._startButton.after(this._itemsContainer);
    }

    // Tray (clock + notification badge)
    let tray = this._container.querySelector('.xp-taskbar-tray');
    if (!tray) {
      tray = createElement('div', { className: 'xp-taskbar-tray' });
      this._container.appendChild(tray);
    }

    // Notification badge
    this._notifBadge = createElement('button', {
      className: 'xp-taskbar-notif-badge hidden',
      'aria-label': 'Notifications',
      title: 'No new notifications'
    });
    this._notifBadge.addEventListener('click', () => {
      dispatchEvent('launch-app', { appId: 'chat', title: 'Chat' });
    });
    tray.prepend(this._notifBadge);

    // Clock
    if (!this._clockEl) {
      this._clockEl = createElement('span', { id: 'taskbar-clock', className: 'xp-taskbar-clock' });
    }
    tray.appendChild(this._clockEl);

    this._setupEvents();
    startClock(this._clockEl);

    // Start polling for unread notifications
    this._startNotifPolling();
  },

  /* ─── Start polling for unread notifications ─── */
  _startNotifPolling() {
    this._lastNotifCount = 0;
    this._notifPollTimer = setInterval(() => {
      this._updateNotifBadge();
    }, 5000);
    this._updateNotifBadge();

    // Also update on new-message events
    listenEvent('new-message', () => {
      setTimeout(() => this._updateNotifBadge(), 500);
    });
  },

  /* ─── Update notification badge ─── */
  _updateNotifBadge() {
    const session = StorageService.getActiveSession();
    if (!session) {
      this._notifBadge.classList.add('hidden');
      return;
    }

    const totalUnread = ChatService.getTotalUnreadCount(session.username);

    if (totalUnread > 0) {
      this._notifBadge.textContent = totalUnread > 99 ? '99+' : String(totalUnread);
      this._notifBadge.classList.remove('hidden');
      this._notifBadge.title = totalUnread + ' unread message' + (totalUnread > 1 ? 's' : '');
    } else {
      this._notifBadge.classList.add('hidden');
      this._notifBadge.title = 'No new notifications';
    }

    this._lastNotifCount = totalUnread;
  },

  /* ─── Clean up polling ─── */
  destroy() {
    if (this._notifPollTimer) {
      clearInterval(this._notifPollTimer);
      this._notifPollTimer = null;
    }
  },

  /* ─── Setup events ─── */
  _setupEvents() {
    // Start button toggle
    this._startButton.addEventListener('click', () => {
      dispatchEvent('toggle-start-menu');
    });

    // Listen for taskbar updates from WindowManager
    listenEvent('taskbar-update', () => {
      this._updateTaskbarItems();
    });

    // Listen for window opened events
    listenEvent('window-opened', (e) => {
      this._updateTaskbarItems();
    });

    listenEvent('window-closed', () => {
      this._updateTaskbarItems();
    });
  },

  /* ─── Update taskbar items ─── */
  _updateTaskbarItems() {
    this._itemsContainer.innerHTML = '';
    const windows = WindowManager.getTaskbarWindows();

    for (const win of windows) {
      const item = createElement('button', {
        className: 'xp-taskbar-item' + (win.state !== 'minimized' ? ' active' : ''),
        'data-window-id': win.id
      });

      if (win.icon) {
        const img = createElement('img', {
          className: 'xp-taskbar-item-icon',
          src: win.icon,
          alt: '',
          onerror: 'this.style.display="none"'
        });
        item.appendChild(img);
      }

      const title = createElement('span', {
        className: 'xp-taskbar-item-title',
        textContent: win.title
      });
      item.appendChild(title);

      // Click to restore/focus
      item.addEventListener('click', () => {
        if (win.state === 'minimized') {
          win.restore();
        } else {
          win.focus();
        }
      });

      this._itemsContainer.appendChild(item);
    }
  }
};
