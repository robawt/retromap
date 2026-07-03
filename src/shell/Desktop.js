/* ═══════════════════════════════════════════════════════
   RetroMap — Desktop
   ═══════════════════════════════════════════════════════ */

const Desktop = {
  _icons: [],
  _selectedIcon: null,
  _container: null,
  _iconsContainer: null,

  /* ─── Default Desktop Icons ─── */
  defaultIcons: [
    {
      id: 'feed',
      label: 'My Posts',
      icon: 'assets/ui/icons/feed.svg',
      description: 'View your social feed',
      appId: 'feed'
    },
    {
      id: 'game',
      label: 'Retro World',
      icon: 'assets/ui/icons/game.svg',
      description: 'Enter the sandbox world',
      appId: 'game'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: 'assets/ui/icons/chat.svg',
      description: 'Send messages to friends',
      appId: 'chat'
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: 'assets/ui/icons/friends.svg',
      description: 'Manage your friends list',
      appId: 'friends'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: 'assets/ui/icons/profile.svg',
      description: 'View and edit your profile',
      appId: 'profile'
    }
  ],

  /* ─── Initialize ─── */
  init(containerId) {
    this._container = document.getElementById(containerId);
    this._iconsContainer = document.getElementById('desktop-icons');
    if (!this._container) {
      this._container = createElement('div', { id: containerId, className: 'xp-desktop' });
      this._iconsContainer = createElement('div', { className: 'xp-desktop-icons' });
      this._container.appendChild(this._iconsContainer);
      document.body.prepend(this._container);
    }

    this._setupEventListeners();
  },

  /* ─── Setup Events ─── */
  _setupEventListeners() {
    // Deselect on desktop click
    this._container.addEventListener('mousedown', (e) => {
      if (e.target === this._container || e.target === this._iconsContainer) {
        this.deselectAll();
      }
    });
  },

  /* ─── Add desktop icons ─── */
  addIcons(icons) {
    for (const iconConfig of icons) {
      this.addIcon(iconConfig);
    }
  },

  /* ─── Add single icon ─── */
  addIcon(config) {
    const iconEl = createElement('button', {
      className: 'xp-desktop-icon',
      'data-icon-id': config.id,
      'data-app-id': config.appId || '',
      title: config.description || ''
    });

    const img = createElement('img', {
      src: config.icon,
      alt: config.label,
      onerror: 'this.outerHTML=\'<div style="width:32px;height:32px;background:#C0C0C0;border:1px solid #808080;display:flex;align-items:center;justify-content:center;font-size:16px;">?</div>\''
    });

    const label = createElement('span', {
      textContent: config.label
    });

    iconEl.appendChild(img);
    iconEl.appendChild(label);

    // Single click → select
    iconEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this._selectIcon(iconEl);
    });

    // Double click → launch app
    iconEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this._launchApp(config);
    });

    this._iconsContainer.appendChild(iconEl);
    this._icons.push({ ...config, element: iconEl });
  },

  /* ─── Select an icon ─── */
  _selectIcon(iconEl) {
    this.deselectAll();
    iconEl.classList.add('selected');
    this._selectedIcon = iconEl;
  },

  /* ─── Deselect all icons ─── */
  deselectAll() {
    if (this._selectedIcon) {
      this._selectedIcon.classList.remove('selected');
      this._selectedIcon = null;
    }
  },

  /* ─── Launch an application ─── */
  _launchApp(config) {
    dispatchEvent('launch-app', {
      appId: config.appId,
      title: config.label,
      icon: config.icon
    });
  },

  /* ─── Load default icons ─── */
  loadDefaults() {
    this.addIcons(this.defaultIcons);
  }
};
