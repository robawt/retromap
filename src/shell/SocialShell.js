/* ═══════════════════════════════════════════════════════
   RetroMap — Social Shell (Social Media Layout)
   Replaces the Windows XP desktop with a modern
   social-media navigation layout, keeping the XP aesthetic.
   ═══════════════════════════════════════════════════════ */

const SocialShell = {
  _container: null,
  _contentArea: null,
  _navLinks: {},
  _currentView: null,
  _viewContainers: {},
  _viewInstances: {},

  /* ─── Initialize ─── */
  init(containerId) {
    // Define views lazily — apps may not be loaded when this script first executes
    this._viewConfigs = [
      { id: 'feed',     label: 'Feed',         app: FeedApp,     icon: 'assets/ui/icons/feed.svg' },
      { id: 'messages', label: 'Messages',     app: ChatApp,     icon: 'assets/ui/icons/chat.svg' },
      { id: 'friends',  label: 'Friends',      app: FriendsApp,  icon: 'assets/ui/icons/friends.svg' },
      { id: 'profile',  label: 'Profile',      app: ProfileApp,  icon: 'assets/ui/icons/profile.svg' },
      { id: 'game',     label: 'Retro World',  app: GameApp,     icon: 'assets/ui/icons/game.svg' },
      { id: 'editor',   label: 'Pixel Editor', app: PixelEditorApp, icon: null }
    ];
    this._container = document.getElementById(containerId);
    if (!this._container) {
      this._container = createElement('div', { id: containerId, className: 'social-shell' });
      document.body.appendChild(this._container);
    }

    this._buildLayout();
    this._setupEvents();
  },

  /* ─── Build the layout ─── */
  _buildLayout() {
    this._container.innerHTML = '';

    // ── Top Navigation Bar ──
    const navBar = createElement('header', { className: 'social-navbar' });

    // Brand / Logo
    const brand = createElement('div', { className: 'social-nav-brand' });
    const logo = createElement('img', {
      className: 'social-nav-logo',
      src: 'assets/ui/logos/retromap-logo.svg',
      alt: 'RetroMap',
      width: 20, height: 20,
      onerror: 'this.style.display="none"'
    });
    brand.appendChild(logo);
    brand.appendChild(createElement('span', {
      className: 'social-nav-brand-text',
      textContent: 'RetroMap'
    }));
    navBar.appendChild(brand);

    // Navigation links
    const navLinks = createElement('nav', { className: 'social-nav-links' });

    for (const view of this._viewConfigs) {
      const btn = createElement('button', {
        className: 'social-nav-item',
        'data-view': view.id,
        title: view.label
      });

      if (view.icon) {
        const icon = createElement('img', {
          className: 'social-nav-item-icon',
          src: view.icon,
          alt: '',
          width: 16, height: 16,
          onerror: 'this.style.display="none"'
        });
        btn.appendChild(icon);
      }

      btn.appendChild(document.createTextNode(view.label));
      btn.addEventListener('click', () => this.switchView(view.id));
      navLinks.appendChild(btn);
      this._navLinks[view.id] = btn;
    }

    navBar.appendChild(navLinks);

    // Notification badge (unread messages) — click to open Messages
    this._notifBadge = createElement('button', {
      className: 'social-nav-badge hidden',
      textContent: '0',
      title: 'Unread messages'
    });
    this._notifBadge.addEventListener('click', () => {
      this.switchView('messages');
    });
    navBar.appendChild(this._notifBadge);

    this._container.appendChild(navBar);

    // ── Main Content Area ──
    this._contentArea = createElement('main', { className: 'social-content' });
    this._container.appendChild(this._contentArea);

    // Start polling for notifications
    this._startNotifPolling();
  },

  /* ─── Show the shell ─── */
  show() {
    this._container.classList.remove('hidden');
    // Default to feed view
    this.switchView('feed');
  },

  /* ─── Hide the shell ─── */
  hide() {
    this._container.classList.add('hidden');
  },

  /* ─── Switch active view ─── */
  switchView(viewId) {
    if (this._currentView === viewId) return;

    // Hide current view container
    if (this._currentView && this._viewContainers[this._currentView]) {
      this._viewContainers[this._currentView].style.display = 'none';
    }

    // Find the view config
    const viewConfig = this._viewConfigs.find(v => v.id === viewId);
    if (!viewConfig) return;

    this._currentView = viewId;

    // Show or create container for this view
    if (this._viewContainers[viewId]) {
      this._viewContainers[viewId].style.display = 'flex';
      // If the app was destroyed, re-render it
      if (!this._viewInstances[viewId]) {
        this._viewInstances[viewId] = viewConfig.app;
        viewConfig.app.render(this._viewContainers[viewId]);
      } else {
        // Notify the app it became visible again (game needs this for Phaser)
        if (viewConfig.app.onActivate) {
          viewConfig.app.onActivate();
        }
      }
    } else {
      // Create new container and render
      const container = createElement('div', {
        className: 'social-view-container'
      });
      this._contentArea.appendChild(container);
      this._viewContainers[viewId] = container;
      this._viewInstances[viewId] = viewConfig.app;
      viewConfig.app.render(container);
    }

    // Update nav active state
    Object.keys(this._navLinks).forEach(key => {
      this._navLinks[key].classList.toggle('active', key === viewId);
    });
  },

  /* ─── Setup events ─── */
  _setupEvents() {
    // Listen for user logout — hide shell
    listenEvent('user-logout', () => {
      this._destroyAllViews();
      this.hide();
    });
  },

  /* ─── Destroy all view instances ─── */
  _destroyAllViews() {
    for (const view of this._viewConfigs) {
      try {
        if (view.app && typeof view.app.destroy === 'function') {
          view.app.destroy();
        }
      } catch (e) {
        console.warn('[SocialShell] Error destroying view:', view.id, e);
      }
    }
    this._viewContainers = {};
    this._viewInstances = {};
    this._currentView = null;
    if (this._contentArea) this._contentArea.innerHTML = '';
  },

  /* ─── Notification polling ─── */
  _startNotifPolling() {
    this._notifTimer = setInterval(() => {
      this._updateNotifBadge();
    }, 5000);
    this._updateNotifBadge();

    listenEvent('new-message', () => {
      setTimeout(() => this._updateNotifBadge(), 500);
    });
  },

  _updateNotifBadge() {
    const session = StorageService.getActiveSession();
    if (!session || !this._notifBadge) return;

    const totalUnread = ChatService.getTotalUnreadCount(session.username);
    if (totalUnread > 0) {
      this._notifBadge.textContent = totalUnread > 99 ? '99+' : String(totalUnread);
      this._notifBadge.classList.remove('hidden');
    } else {
      this._notifBadge.classList.add('hidden');
    }
  },

  /* ─── Cleanup ─── */
  destroy() {
    if (this._notifTimer) {
      clearInterval(this._notifTimer);
      this._notifTimer = null;
    }
    this._destroyAllViews();
    this._container = null;
    this._contentArea = null;
  }
};
