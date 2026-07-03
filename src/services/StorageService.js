/* ═══════════════════════════════════════════════════════
   RetroMap — Storage Service
   ═══════════════════════════════════════════════════════ */

const StorageService = {
  /* ─── Users ─── */

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem('retromap-users')) || {};
    } catch {
      return {};
    }
  },

  saveUsers(users) {
    localStorage.setItem('retromap-users', JSON.stringify(users));
  },

  getUser(username) {
    const users = this.getUsers();
    return users[username] || null;
  },

  saveUser(username, userData) {
    const users = this.getUsers();
    users[username] = userData;
    this.saveUsers(users);
  },

  /* ─── Active Session ─── */

  getActiveSession() {
    try {
      return JSON.parse(localStorage.getItem('retromap-active-user')) || null;
    } catch {
      return null;
    }
  },

  saveSession(sessionData) {
    localStorage.setItem('retromap-active-user', JSON.stringify(sessionData));
  },

  clearSession() {
    localStorage.removeItem('retromap-active-user');
  },

  isLoggedIn() {
    return !!localStorage.getItem('retromap-active-user');
  },

  getFullActiveUser() {
    const session = this.getActiveSession();
    if (!session) return null;
    return this.getUser(session.username);
  }
};
