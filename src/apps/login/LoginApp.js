/* ═══════════════════════════════════════════════════════
   RetroMap — Login / Registration App
   ═══════════════════════════════════════════════════════ */

const LoginApp = {
  title: 'Welcome to RetroMap',
  defaultWidth: 460,
  defaultHeight: 420,
  resizable: false,
  minWidth: 460,
  minHeight: 420,

  _container: null,
  _tabLogin: null,
  _tabRegister: null,
  _loginView: null,
  _registerView: null,

  /* ─── Render ─── */
  render(container) {
    this._container = container;
    container.className = 'login-app-container';

    // Header
    const header = createElement('div', { className: 'login-header' });
    header.innerHTML = `
      <div class="login-logo">
        <img src="assets/ui/logos/retromap-logo.svg" alt="RetroMap" width="48" height="48"
             onerror="this.style.display='none'" />
      </div>
      <div class="login-title">RetroMap</div>
      <div class="login-subtitle">Sign in to your account or create one</div>
    `;
    container.appendChild(header);

    // Tab bar
    const tabBar = createElement('div', { className: 'login-tabs' });
    this._tabLogin = createElement('button', {
      className: 'login-tab active',
      textContent: 'Sign In',
      'data-tab': 'login'
    });
    this._tabRegister = createElement('button', {
      className: 'login-tab',
      textContent: 'Create Account',
      'data-tab': 'register'
    });

    this._tabLogin.addEventListener('click', () => this._switchTab('login'));
    this._tabRegister.addEventListener('click', () => this._switchTab('register'));

    tabBar.appendChild(this._tabLogin);
    tabBar.appendChild(this._tabRegister);
    container.appendChild(tabBar);

    // Login form
    this._loginView = this._buildLoginForm();
    container.appendChild(this._loginView);

    // Register form (hidden initially)
    this._registerView = this._buildRegisterForm();
    this._registerView.style.display = 'none';
    container.appendChild(this._registerView);

    // Footer
    const footer = createElement('div', { className: 'login-footer' });
    footer.textContent = 'Your data stays on this device.';
    container.appendChild(footer);

    // Focus the first input after render
    setTimeout(() => {
      const firstInput = this._loginView.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  },

  /* ─── Build Login Form ─── */
  _buildLoginForm() {
    const form = createElement('div', { className: 'login-form' });

    // Username
    form.appendChild(this._makeField('Username', 'login-username', 'Enter your username'));
    // Password
    form.appendChild(this._makeField('Password', 'login-password', 'Enter your password', 'password'));

    // Error message area
    const errorArea = createElement('div', { className: 'login-error hidden', id: 'login-error' });
    form.appendChild(errorArea);

    // Stay signed in checkbox
    const staySignedRow = createElement('div', { className: 'login-checkbox-row' });
    const staySignedCheck = createElement('input', {
      type: 'checkbox',
      id: 'login-stay-signed',
      className: 'login-checkbox',
      checked: true
    });
    const staySignedLabel = createElement('label', {
      className: 'login-checkbox-label',
      htmlFor: 'login-stay-signed',
      textContent: 'Stay signed in'
    });
    staySignedRow.appendChild(staySignedCheck);
    staySignedRow.appendChild(staySignedLabel);
    form.appendChild(staySignedRow);

    // Buttons
    const btnRow = createElement('div', { className: 'login-buttons' });
    const signInBtn = UIButton.create({
      label: 'Sign In',
      default: true,
      onClick: () => this._handleLogin()
    });
    btnRow.appendChild(signInBtn);
    form.appendChild(btnRow);

    // Submit on Enter
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleLogin();
    });

    return form;
  },

  /* ─── Build Register Form ─── */
  _buildRegisterForm() {
    const form = createElement('div', { className: 'login-form' });

    // Display name
    form.appendChild(this._makeField(
      'Display Name',
      'reg-displayname',
      'Your display name (e.g., CoolGamer99)'
    ));
    // Username
    form.appendChild(this._makeField(
      'Username',
      'reg-username',
      'Choose a username (letters & numbers only)'
    ));
    // Password
    form.appendChild(this._makeField(
      'Password',
      'reg-password',
      'At least 6 characters',
      'password'
    ));
    // Confirm Password
    form.appendChild(this._makeField(
      'Confirm Password',
      'reg-confirm',
      'Re-enter your password',
      'password'
    ));

    // Error area
    const errorArea = createElement('div', { className: 'login-error hidden', id: 'reg-error' });
    form.appendChild(errorArea);

    // Buttons
    const btnRow = createElement('div', { className: 'login-buttons' });
    const createBtn = UIButton.create({
      label: 'Create Account',
      default: true,
      onClick: () => this._handleRegister()
    });
    btnRow.appendChild(createBtn);
    form.appendChild(btnRow);

    // Submit on Enter
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleRegister();
    });

    return form;
  },

  /* ─── Helper: create a form field ─── */
  _makeField(label, id, placeholder, type) {
    const row = createElement('div', { className: 'login-field' });
    const lbl = createElement('label', {
      className: 'login-label',
      htmlFor: id,
      textContent: label
    });
    const input = createElement('input', {
      className: 'xp-input login-input',
      type: type || 'text',
      id: id,
      placeholder: placeholder || '',
      autocomplete: type === 'password' ? 'current-password' : 'username'
    });
    row.appendChild(lbl);
    row.appendChild(input);
    return row;
  },

  /* ─── Tab switching ─── */
  _switchTab(tab) {
    const tabs = [this._tabLogin, this._tabRegister];
    const views = [this._loginView, this._registerView];

    tabs.forEach(t => t.classList.remove('active'));
    views.forEach(v => v.style.display = 'none');

    if (tab === 'login') {
      this._tabLogin.classList.add('active');
      this._loginView.style.display = 'block';
      setTimeout(() => {
        const inp = this._loginView.querySelector('input');
        if (inp) inp.focus();
      }, 50);
    } else {
      this._tabRegister.classList.add('active');
      this._registerView.style.display = 'block';
      setTimeout(() => {
        const inp = this._registerView.querySelector('input');
        if (inp) inp.focus();
      }, 50);
    }
  },

  /* ─── Handle Login ─── */
  _handleLogin() {
    const username = $('login-username').value.trim();
    const password = $('login-password').value.trim();
    const errorEl = $('login-error');

    // Validate
    if (!username || !password) {
      this._showError(errorEl, 'Please enter both username and password.');
      return;
    }

    // Check stored users
    const users = StorageService.getUsers();
    const user = users[username];

    if (!user) {
      this._showError(errorEl, 'Account not found. Check your username or create a new account.');
      return;
    }

    if (user.password !== password) {
      this._showError(errorEl, 'Incorrect password. Please try again.');
      return;
    }

    // Check stay-signed-in
    const staySigned = $('login-stay-signed') ? $('login-stay-signed').checked : false;

    // Success!
    this._loginSuccess(user, staySigned);
  },

  /* ─── Handle Register ─── */
  _handleRegister() {
    const displayName = $('reg-displayname').value.trim();
    const username = $('reg-username').value.trim();
    const password = $('reg-password').value;
    const confirm = $('reg-confirm').value;
    const errorEl = $('reg-error');

    // Validate display name
    if (!displayName) {
      this._showError(errorEl, 'Please enter a display name.');
      return;
    }

    // Validate username
    if (!username) {
      this._showError(errorEl, 'Please choose a username.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this._showError(errorEl, 'Username can only contain letters, numbers, and underscores.');
      return;
    }
    if (username.length < 3) {
      this._showError(errorEl, 'Username must be at least 3 characters.');
      return;
    }

    // Validate password
    if (!password) {
      this._showError(errorEl, 'Please enter a password.');
      return;
    }
    if (password.length < 6) {
      this._showError(errorEl, 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      this._showError(errorEl, 'Passwords do not match.');
      return;
    }

    // Check if username taken
    const users = StorageService.getUsers();
    if (users[username]) {
      this._showError(errorEl, 'This username is already taken. Please choose another.');
      return;
    }

    // Create user
    const newUser = {
      username,
      displayName,
      password,
      avatar: 'assets/ui/icons/profile.svg',
      bio: '',
      joinDate: new Date().toISOString(),
      status: 'online',
      gameStats: {
        highScore: 0,
        coinsCollected: 0,
        levelsCompleted: 0,
        totalPlayTime: 0
      },
      friends: [],
      friendRequests: { incoming: [], outgoing: [] },
      settings: {
        theme: 'blue',
        soundsEnabled: true
      }
    };

    users[username] = newUser;
    StorageService.saveUsers(users);

    // Auto-login
    this._loginSuccess(newUser);
  },

  /* ─── Login Success ─── */
  _loginSuccess(user, staySigned) {
    // Store active session (only if stay-signed-in is checked)
    if (staySigned !== false) {
      localStorage.setItem('retromap-active-user', JSON.stringify({
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar
      }));
    }

    // Dispatch event so the shell knows
    dispatchEvent('user-login', { user });

    // Show success notification
    const winEl = this._container ? this._container.closest('.xp-window') : null;
    const winId = winEl ? winEl.id.replace('win-', '') : null;
    const win = WindowManager.getWindow(winId);
    if (win) {
      win.close();
    }

    // Show welcome notification (via taskbar notification)
    setTimeout(() => {
      UIDialog.alert(
        'Welcome to RetroMap!',
        `Hello, ${user.displayName}! Start by clicking desktop icons or the Start menu to explore.\n\nYour account has been loaded. Enjoy RetroMap!`
      );
    }, 300);
  },

  /* ─── Show error message ─── */
  _showError(el, message) {
    el.textContent = message;
    el.classList.remove('hidden');
    // Auto-hide after 4 seconds
    clearTimeout(this._errorTimer);
    this._errorTimer = setTimeout(() => {
      el.classList.add('hidden');
    }, 4000);
  },

  /* ─── Cleanup ─── */
  destroy() {
    this._container = null;
  }
};
