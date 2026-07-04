/* ═══════════════════════════════════════════════════════
   RetroMap — Notification Service
   ═══════════════════════════════════════════════════════ */

const Notifications = {
  _container: null,
  _queue: [],
  _activeCount: 0,
  _timer: null,

  MAX_VISIBLE: 3,
  DURATION: 5000,

  /* ─── Initialize ─── */
  init() {
    this._container = createElement('div', {
      className: 'notif-container',
      'aria-live': 'polite'
    });
    document.body.appendChild(this._container);
    this._processQueue();
  },

  /* ─── Show a notification toast ─── */
  show(config = {}) {
    const notif = {
      id: generateId(),
      title: config.title || '',
      message: config.message || '',
      icon: config.icon || '',
      duration: config.duration || this.DURATION,
      onClick: config.onClick || null,
      timestamp: Date.now()
    };

    this._queue.push(notif);
    this._processQueue();
    return notif.id;
  },

  /* ─── Process notification queue ─── */
  _processQueue() {
    if (this._timer) return;

    this._timer = setInterval(() => {
      while (this._queue.length > 0 && this._activeCount < this.MAX_VISIBLE) {
        const notif = this._queue.shift();
        this._showToast(notif);
      }
      if (this._queue.length === 0 && this._activeCount === 0) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }, 200);
  },

  /* ─── Create and show a toast ─── */
  _showToast(notif) {
    this._activeCount++;

    const toast = createElement('div', {
      className: 'xp-notification',
      'data-id': notif.id,
      role: 'alert'
    });

    if (notif.icon) {
      const icon = createElement('img', {
        className: 'xp-notification-icon',
        src: notif.icon,
        alt: '',
        width: 24,
        height: 24,
        onerror: 'this.style.display="none"'
      });
      toast.appendChild(icon);
    }

    const content = createElement('div', { className: 'xp-notification-content' });
    if (notif.title) {
      content.appendChild(createElement('div', {
        className: 'xp-notification-title',
        textContent: notif.title
      }));
    }
    content.appendChild(createElement('div', {
      textContent: notif.message
    }));
    toast.appendChild(content);

    const closeBtn = createElement('button', {
      className: 'notif-close-btn',
      textContent: 'X',
      'aria-label': 'Dismiss'
    });
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._dismiss(toast, notif);
    });
    toast.appendChild(closeBtn);

    toast.addEventListener('click', () => {
      if (notif.onClick) notif.onClick();
      this._dismiss(toast, notif);
    });

    this._container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('notif-visible');
    });

    const dismissTimer = setTimeout(() => {
      this._dismiss(toast, notif);
    }, notif.duration);

    toast._dismissTimer = dismissTimer;
  },

  /* ─── Dismiss a toast ─── */
  _dismiss(toast, notif) {
    if (toast._dismissing) return;
    toast._dismissing = true;

    clearTimeout(toast._dismissTimer);
    toast.classList.remove('notif-visible');
    toast.classList.add('notif-hiding');

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
      this._activeCount = Math.max(0, this._activeCount - 1);
      this._processQueue();
    }, 200);
  },

  /* ─── Helper methods ─── */
  info(title, message, duration) {
    return this.show({ title, message, duration });
  },

  success(title, message, duration) {
    return this.show({ title, message, duration: duration || 4000 });
  },

  error(title, message, duration) {
    return this.show({ title, message, duration: duration || 6000 });
  },

  /* ─── Wire up custom event listeners ─── */
  wireEvents() {
    listenEvent('friend-request-sent', (e) => {
      this.info('Friend Request Sent', 'Request sent to ' + e.detail.to);
      SoundManager.play('notify');
    });

    listenEvent('friend-request-received', (e) => {
      const allUsers = StorageService.getUsers();
      const user = allUsers[e.detail.from];
      this.info('Friend Request', (user ? user.displayName : e.detail.from) + ' sent you a friend request');
      SoundManager.play('notify');
    });

    listenEvent('friend-request-accepted', (e) => {
      const allUsers = StorageService.getUsers();
      const user = allUsers[e.detail.by];
      this.success('Friend Added', 'You are now friends with ' + (user ? user.displayName : e.detail.by));
      SoundManager.play('notify');
    });

    listenEvent('post-liked', (e) => {
      if (e.detail.by === e.detail.postAuthor) return;
      const allUsers = StorageService.getUsers();
      const user = allUsers[e.detail.by];
      this.info('Like', (user ? user.displayName : e.detail.by) + ' liked your post');
      SoundManager.play('notify');
    });

    listenEvent('comment-added', (e) => {
      if (e.detail.by === e.detail.postAuthor) return;
      const allUsers = StorageService.getUsers();
      const user = allUsers[e.detail.by];
      this.info('Comment', (user ? user.displayName : e.detail.by) + ' commented on your post');
      SoundManager.play('notify');
    });

    listenEvent('new-message', (e) => {
      const user = StorageService.getUser(e.detail.from);
      this.info('New Message', 'Message from ' + (user ? user.displayName : e.detail.from));
      // Play notification sound
      SoundManager.play('notify');
    });

    listenEvent('user-login', (e) => {
      if (e.detail.user) {
        setTimeout(() => {
          this.success('Welcome', 'Hello, ' + e.detail.user.displayName + '!');
        }, 500);
      }
    });
  }
};
