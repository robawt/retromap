/* ═══════════════════════════════════════════════════════
   RetroMap — User Profile App
   ═══════════════════════════════════════════════════════ */

const ProfileApp = {
  title: 'My Profile',
  defaultWidth: 500,
  defaultHeight: 450,
  minWidth: 450,
  minHeight: 400,
  resizable: true,

  _container: null,
  _user: null,
  _editing: false,

  /* ─── Render ─── */
  render(container) {
    this._container = container;
    container.className = 'profile-app-container';

    // Load user data
    this._user = StorageService.getFullActiveUser();

    if (!this._user) {
      this._renderNotLoggedIn(container);
      return;
    }

    this._renderProfile(container);
  },

  /* ─── Not Logged In ─── */
  _renderNotLoggedIn(container) {
    container.innerHTML = `
      <div class="xp-loading">
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Not Signed In</div>
        <p>You need to sign in to view your profile.</p>
        <p style="color:#808080;margin-top:8px;">Use the Start menu or desktop icon to sign in.</p>
      </div>
    `;
  },

  /* ─── Render Profile ─── */
  _renderProfile(container) {
    const user = this._user;

    // Load customizations from EconomyService
    this._customizations = EconomyService.getCustomizations(user.username) || {
      frame: 'none', nameColor: 'default', theme: 'blue'
    };

    // ── Banner Area ──
    const banner = createElement('div', { className: 'profile-banner' });

    // Avatar with frame
    const avatarContainer = createElement('div', {
      className: 'profile-avatar-container profile-frame-' + this._customizations.frame
    });
    const avatarImg = createElement('img', {
      className: 'profile-avatar',
      src: user.avatar || 'assets/ui/icons/profile.svg',
      alt: user.displayName,
      onerror: 'this.src="assets/ui/icons/profile.svg"'
    });
    avatarContainer.appendChild(avatarImg);
    banner.appendChild(avatarContainer);

    // Look up name color
    const nameColorItem = EconomyService.findShopItem('nameColors', this._customizations.nameColor) || {};
    const nameColor = nameColorItem.color || '#FFFFFF';

    // Name and status
    const nameSection = createElement('div', { className: 'profile-name-section' });
    const statusRow = createElement('div', { className: 'profile-status-row' });
    statusRow.appendChild(createElement('span', {
      className: 'profile-status-indicator online'
    }));
    statusRow.appendChild(createElement('span', {
      className: 'profile-status-text',
      textContent: 'Online'
    }));
    nameSection.appendChild(statusRow);

    const nameEl = createElement('div', {
      className: 'profile-displayname',
      textContent: user.displayName
    });
    nameEl.style.color = nameColor;
    nameSection.appendChild(nameEl);

    nameSection.appendChild(createElement('div', {
      className: 'profile-username',
      textContent: '@' + user.username
    }));
    banner.appendChild(nameSection);

    container.appendChild(banner);

    // ── Tabbed Content ──
    const tabBar = createElement('div', { className: 'profile-tabs' });

    const tabInfo = createElement('button', {
      className: 'profile-tab active',
      textContent: 'Info',
      'data-tab': 'info'
    });
    const tabStats = createElement('button', {
      className: 'profile-tab',
      textContent: 'Game Stats',
      'data-tab': 'stats'
    });
    const tabSettings = createElement('button', {
      className: 'profile-tab',
      textContent: 'Settings',
      'data-tab': 'settings'
    });

    tabInfo.addEventListener('click', () => this._switchTab('info'));
    tabStats.addEventListener('click', () => this._switchTab('stats'));
    tabSettings.addEventListener('click', () => this._switchTab('settings'));

    tabBar.appendChild(tabInfo);
    tabBar.appendChild(tabStats);
    tabBar.appendChild(tabSettings);
    container.appendChild(tabBar);

    // ── Tab Content Areas ──
    this._tabInfo = this._buildInfoTab(user);
    this._tabStats = this._buildStatsTab(user);
    this._tabSettings = this._buildSettingsTab(user);

    container.appendChild(this._tabInfo);
    container.appendChild(this._tabStats);
    this._tabStats.style.display = 'none';
    container.appendChild(this._tabSettings);
    this._tabSettings.style.display = 'none';
  },

  /* ─── Build Info Tab ─── */
  _buildInfoTab(user) {
    const tab = createElement('div', { className: 'profile-tab-content' });

    // Bio
    const bioSection = createElement('div', { className: 'profile-section' });
    bioSection.appendChild(createElement('div', {
      className: 'profile-section-title',
      textContent: 'Bio'
    }));

    this._bioText = createElement('p', {
      className: 'profile-bio-text',
      textContent: user.bio || 'No bio yet. Click edit to add one.'
    });
    bioSection.appendChild(this._bioText);

    // Edit bio button
    this._editBioBtn = UIButton.create({
      label: 'Edit Bio',
      onClick: () => this._toggleBioEdit()
    });
    bioSection.appendChild(this._editBioBtn);

    // Edit bio form (hidden)
    this._bioEditForm = createElement('div', { className: 'profile-bio-edit hidden' });
    this._bioInput = UIInput.createTextarea({
      placeholder: 'Tell us about yourself...',
      value: user.bio || '',
      width: '100%',
      height: '60px'
    });
    this._bioEditForm.appendChild(this._bioInput);

    const bioBtnRow = createElement('div', { className: 'profile-bio-buttons' });
    const saveBtn = UIButton.create({
      label: 'Save',
      default: true,
      onClick: () => this._saveBio()
    });
    const cancelBtn = UIButton.create({
      label: 'Cancel',
      onClick: () => this._cancelBioEdit()
    });
    bioBtnRow.appendChild(saveBtn);
    bioBtnRow.appendChild(cancelBtn);
    this._bioEditForm.appendChild(bioBtnRow);
    bioSection.appendChild(this._bioEditForm);

    tab.appendChild(bioSection);

    // Details
    const detailsSection = createElement('div', { className: 'profile-section' });
    detailsSection.appendChild(createElement('div', {
      className: 'profile-section-title',
      textContent: 'Details'
    }));

    const detailRows = [
      { label: 'Username', value: '@' + user.username },
      { label: 'Display Name', value: user.displayName },
      { label: 'Member Since', value: formatDate(new Date(user.joinDate)) },
      { label: 'Status', value: user.status || 'online' }
    ];

    for (const row of detailRows) {
      const rowEl = createElement('div', { className: 'profile-detail-row' });
      rowEl.appendChild(createElement('span', {
        className: 'profile-detail-label',
        textContent: row.label
      }));
      rowEl.appendChild(createElement('span', {
        className: 'profile-detail-value',
        textContent: row.value
      }));
      detailsSection.appendChild(rowEl);
    }

    tab.appendChild(detailsSection);
    return tab;
  },

  /* ─── Build Stats Tab ─── */
  _buildStatsTab(user) {
    const tab = createElement('div', { className: 'profile-tab-content' });
    const stats = user.gameStats || {};

    const statsGrid = createElement('div', { className: 'profile-stats-grid' });

    const statItems = [
      { label: 'High Score', value: formatNumber(stats.highScore || 0), icon: '\u2605' },
      { label: 'Coins Collected', value: formatNumber(stats.coinsCollected || 0), icon: '\u25CF' },
      { label: 'Items Created', value: formatNumber(stats.levelsCompleted || 0), icon: '\u25A0' },
      { label: 'Time Played', value: this._formatPlayTime(stats.totalPlayTime || 0), icon: '\u25B6' }
    ];

    for (const item of statItems) {
      const card = createElement('div', { className: 'profile-stat-card' });
      card.appendChild(createElement('div', {
        className: 'profile-stat-icon',
        textContent: item.icon
      }));
      card.appendChild(createElement('div', {
        className: 'profile-stat-value',
        textContent: item.value
      }));
      card.appendChild(createElement('div', {
        className: 'profile-stat-label',
        textContent: item.label
      }));
      statsGrid.appendChild(card);
    }

    tab.appendChild(statsGrid);

    // Achievement placeholder
    const achSection = createElement('div', { className: 'profile-section' });
    achSection.appendChild(createElement('div', {
      className: 'profile-section-title',
      textContent: 'Achievements'
    }));
    achSection.appendChild(createElement('p', {
      className: 'profile-empty-text',
      textContent: 'No achievements yet. Start exploring the world to earn them!'
    }));
    tab.appendChild(achSection);

    return tab;
  },

  /* ─── Build Settings Tab ─── */
  _buildSettingsTab(user) {
    const tab = createElement('div', { className: 'profile-tab-content' });

    // Theme setting
    const themeSection = createElement('div', { className: 'profile-section' });
    themeSection.appendChild(createElement('div', {
      className: 'profile-section-title',
      textContent: 'Desktop Theme'
    }));

    const themeOptions = ['blue', 'silver', 'olive'];
    const currentTheme = RetroMap.getTheme();

    for (const theme of themeOptions) {
      const radioRow = createElement('div', { className: 'xp-radio' });
      const radio = createElement('input', {
        type: 'radio',
        name: 'profile-theme',
        value: theme,
        id: 'theme-' + theme,
        checked: currentTheme === theme
      });
      radio.addEventListener('change', () => {
        if (radio.checked) RetroMap.setTheme(theme);
      });
      radioRow.appendChild(radio);
      radioRow.appendChild(createElement('label', {
        htmlFor: 'theme-' + theme,
        textContent: theme.charAt(0).toUpperCase() + theme.slice(1)
      }));
      themeSection.appendChild(radioRow);
    }

    tab.appendChild(themeSection);

    // Sound setting
    const soundSection = createElement('div', { className: 'profile-section' });
    soundSection.appendChild(createElement('div', {
      className: 'profile-section-title',
      textContent: 'Sound'
    }));

    const soundRow = createElement('div', { className: 'xp-checkbox' });
    const soundCheck = createElement('input', {
      type: 'checkbox',
      id: 'profile-sound',
      checked: user.settings ? user.settings.soundsEnabled !== false : true
    });
    soundCheck.addEventListener('change', () => {
      SoundManager.enabled = soundCheck.checked;
    });
    soundRow.appendChild(soundCheck);
    soundRow.appendChild(createElement('label', {
      htmlFor: 'profile-sound',
      textContent: 'Enable sound effects'
    }));
    soundSection.appendChild(soundRow);
    tab.appendChild(soundSection);

    // Danger zone
    const dangerSection = createElement('div', { className: 'profile-section profile-danger' });
    dangerSection.appendChild(createElement('div', {
      className: 'profile-section-title',
      textContent: 'Account'
    }));

    const logoutBtn = UIButton.create({
      label: 'Sign Out',
      onClick: () => {
        RetroMap.logout();
        // Close this window
        const winEl = this._container ? this._container.closest('.xp-window') : null;
        if (winEl) {
          const winId = winEl.id.replace('win-', '');
          WindowManager.closeWindow(winId);
        }
      }
    });
    dangerSection.appendChild(logoutBtn);
    tab.appendChild(dangerSection);

    return tab;
  },

  /* ─── Tab Switching ─── */
  _switchTab(tab) {
    const tabs = [this._tabInfo, this._tabStats, this._tabSettings];
    const tabButtons = this._container.querySelectorAll('.profile-tab');

    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tab) btn.classList.add('active');
    });
    tabs.forEach(t => { if (t) t.style.display = 'none'; });

    const target = tab === 'info' ? this._tabInfo
      : tab === 'stats' ? this._tabStats
      : this._tabSettings;
    if (target) target.style.display = 'block';
  },

  /* ─── Toggle Bio Edit ─── */
  _toggleBioEdit() {
    this._editing = !this._editing;
    this._bioText.style.display = this._editing ? 'none' : 'block';
    this._bioEditForm.classList.toggle('hidden', !this._editing);
    this._editBioBtn.textContent = this._editing ? 'Cancel' : 'Edit Bio';
    if (this._editing) {
      this._bioInput.value = this._user.bio || '';
      this._bioInput.focus();
    }
  },

  /* ─── Save Bio ─── */
  _saveBio() {
    const newBio = this._bioInput.value.trim();
    this._user.bio = newBio;

    // Save to localStorage
    StorageService.saveUser(this._user.username, this._user);

    // Update display
    this._bioText.textContent = newBio || 'No bio yet. Click edit to add one.';
    this._bioText.style.display = 'block';
    this._bioEditForm.classList.add('hidden');
    this._editing = false;
    this._editBioBtn.textContent = 'Edit Bio';
  },

  /* ─── Cancel Bio Edit ─── */
  _cancelBioEdit() {
    this._bioText.style.display = 'block';
    this._bioEditForm.classList.add('hidden');
    this._editing = false;
    this._editBioBtn.textContent = 'Edit Bio';
  },

  /* ─── Format play time ─── */
  _formatPlayTime(seconds) {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  },

  /* ─── Cleanup ─── */
  destroy() {
    this._container = null;
    this._user = null;
  }
};
