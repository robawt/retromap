/* ═══════════════════════════════════════════════════════
   RetroMap — Main Application Entry Point
   ═══════════════════════════════════════════════════════ */

const RetroMap = {
  /* ─── App Registry ─── */
  _apps: {},

  /* ─── Initialize ─── */
  async init() {
    console.log('[RetroMap] Initializing...');

    // 1. Initialize Window Manager
    WindowManager.init('windows-container');

    // 2. Initialize Dialog System
    UIDialog.init();

    // 3. Initialize Taskbar
    Taskbar.init();

    // 4. Initialize Start Menu
    StartMenu.init();

    // 5. Initialize Desktop with default icons
    Desktop.init('desktop');
    Desktop.loadDefaults();

    // 6. Register apps
    this.registerApp('login', LoginApp);
    this.registerApp('profile', ProfileApp);

    // 7. Register listen for app launches
    listenEvent('launch-app', (e) => {
      this._handleLaunchApp(e.detail);
    });

    // 8. Hide loading screen (if any)
    this._hideLoading();

    // 9. Auto-open login window on start (if not already logged in)
    setTimeout(() => {
      if (!this.isLoggedIn()) {
        this.openLogin();
      }
    }, 200);

    console.log('[RetroMap] Ready!');
  },

  /* ─── Open Login Window ─── */
  openLogin() {
    // Guard: prevent multiple login windows
    const existingLogin = WindowManager.getOpenWindows().find(w => w.id && w.id.startsWith('login-'));
    if (existingLogin) {
      existingLogin.focus();
      return;
    }
    this._handleLaunchApp({
      appId: 'login',
      title: 'Welcome to RetroMap',
      icon: 'assets/ui/icons/profile.svg'
    });
  },

  /* ─── Check if user is logged in ─── */
  isLoggedIn() {
    return !!localStorage.getItem('retromap-active-user');
  },

  /* ─── Get active user ─── */
  getActiveUser() {
    try {
      return JSON.parse(localStorage.getItem('retromap-active-user')) || null;
    } catch {
      return null;
    }
  },

  /* ─── Logout ─── */
  logout() {
    localStorage.removeItem('retromap-active-user');
    dispatchEvent('user-logout');
    // Re-open login
    setTimeout(() => this.openLogin(), 100);
  },

  /* ─── Register an App ─── */
  registerApp(appId, appClass) {
    this._apps[appId] = appClass;
  },

  /* ─── Handle app launch ─── */
  _handleLaunchApp(detail) {
    const { appId, title, icon } = detail;

    if (this._apps[appId]) {
      // App has a registered class/object
      const appInstance = this._apps[appId];
      WindowManager.createWindow({
        id: appId + '-' + generateId(),
        title: title || appInstance.title || appId,
        icon: icon || '',
        width: appInstance.defaultWidth || 600,
        height: appInstance.defaultHeight || 400,
        app: appInstance,
        menuBar: appInstance.menuBar || null,
        statusBar: appInstance.statusBar || null,
        resizable: appInstance.resizable !== false
      });
    } else {
      // Placeholder window for unregistered apps
      WindowManager.createWindow({
        id: appId + '-' + generateId(),
        title: title || appId,
        icon: icon || '',
        width: 500,
        height: 350,
        app: {
          render(container) {
            container.innerHTML = `
              <div class="xp-loading">
                <div style="font-size:14px;font-weight:700;margin-bottom:8px;">${title || appId}</div>
                <p>This application is coming soon.</p>
                <p style="color:#808080;margin-top:8px;">App ID: ${appId}</p>
              </div>
            `;
          },
          destroy() {}
        }
      });
    }
  },

  /* ─── Hide loading screen ─── */
  _hideLoading() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.style.display = 'none';
    }
  },

  /* ─── Set theme ─── */
  setTheme(theme) {
    document.body.classList.remove('theme-silver', 'theme-olive');
    if (theme !== 'blue') {
      document.body.classList.add('theme-' + theme);
    }
    localStorage.setItem('retromap-theme', theme);
  },

  /* ─── Get current theme ─── */
  getTheme() {
    if (document.body.classList.contains('theme-silver')) return 'silver';
    if (document.body.classList.contains('theme-olive')) return 'olive';
    return 'blue';
  }
};

/* ═══════════════════════════════════════════════════════
   Boot on DOMContentLoaded
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  RetroMap.init();
});
