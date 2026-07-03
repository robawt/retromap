/* ═══════════════════════════════════════════════════════
   RetroMap — Start Menu
   ═══════════════════════════════════════════════════════ */

const StartMenu = {
  _menuEl: null,
  _itemsContainer: null,
  _isOpen: false,

  /* ─── Default start menu items ─── */
  defaultItems: [
    {
      id: 'feed',
      label: 'My Posts',
      icon: 'assets/ui/icons/feed.svg',
      appId: 'feed',
      divider: false
    },
    {
      id: 'game',
      label: 'Retro World',
      icon: 'assets/ui/icons/game.svg',
      appId: 'game',
      divider: false
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: 'assets/ui/icons/chat.svg',
      appId: 'chat',
      divider: false
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: 'assets/ui/icons/friends.svg',
      appId: 'friends',
      divider: false
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: 'assets/ui/icons/profile.svg',
      appId: 'profile',
      divider: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'assets/ui/icons/settings.svg',
      appId: 'settings',
      divider: false
    }
  ],

  /* ─── Initialize ─── */
  init() {
    this._menuEl = document.getElementById('start-menu');
    this._itemsContainer = this._menuEl
      ? this._menuEl.querySelector('.xp-start-menu-items')
      : null;

    if (!this._menuEl) {
      this._menuEl = createElement('div', {
        id: 'start-menu',
        className: 'xp-start-menu hidden'
      });
      const sidebar = createElement('div', { className: 'xp-start-menu-sidebar' });
      sidebar.appendChild(createElement('span', {
        className: 'xp-start-menu-brand',
        textContent: 'RetroMap'
      }));
      this._menuEl.appendChild(sidebar);
      this._itemsContainer = createElement('div', { className: 'xp-start-menu-items' });
      this._menuEl.appendChild(this._itemsContainer);
      document.body.appendChild(this._menuEl);
    }

    this._setupEvents();
    this._renderItems(this.defaultItems);
  },

  /* ─── Setup events ─── */
  _setupEvents() {
    // Listen for toggle from taskbar
    listenEvent('toggle-start-menu', () => {
      this.toggle();
    });

    // Close on click outside
    document.addEventListener('mousedown', (e) => {
      if (!this._isOpen) return;
      if (this._menuEl.contains(e.target)) return;
      if (document.getElementById('start-button').contains(e.target)) return;
      this.close();
    });
  },

  /* ─── Render menu items ─── */
  _renderItems(items) {
    this._itemsContainer.innerHTML = '';
    for (const item of items) {
      if (item.divider) {
        this._itemsContainer.appendChild(
          createElement('div', { className: 'xp-start-menu-divider' })
        );
      }

      const btn = createElement('button', {
        className: 'xp-start-menu-item',
        'data-app-id': item.appId || ''
      });

      if (item.icon) {
        const img = createElement('img', {
          src: item.icon,
          alt: '',
          onerror: 'this.style.display="none"'
        });
        btn.appendChild(img);
      }

      btn.appendChild(document.createTextNode(item.label));

      btn.addEventListener('click', () => {
        this._launch(item);
        this.close();
      });

      this._itemsContainer.appendChild(btn);
    }
  },

  /* ─── Launch item ─── */
  _launch(item) {
    dispatchEvent('launch-app', {
      appId: item.appId,
      title: item.label,
      icon: item.icon
    });
  },

  /* ─── Toggle open/close ─── */
  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  /* ─── Open ─── */
  open() {
    this._isOpen = true;
    this._menuEl.classList.remove('hidden');
    this._menuEl.style.display = 'flex';
  },

  /* ─── Close ─── */
  close() {
    this._isOpen = false;
    this._menuEl.classList.add('hidden');
    this._menuEl.style.display = 'none';
  }
};
