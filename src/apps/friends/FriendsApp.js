/* ═══════════════════════════════════════════════════════
   RetroMap — Friends App
   ═══════════════════════════════════════════════════════ */

const FriendsApp = {
  title: 'Friends',
  defaultWidth: 520,
  defaultHeight: 440,
  minWidth: 380,
  minHeight: 350,
  resizable: true,

  _container: null,
  _user: null,

  _tabFriends: null,
  _tabRequests: null,
  _tabSearch: null,

  _friendsView: null,
  _requestsView: null,
  _searchView: null,

  /* ─── Render ─── */
  render(container) {
    this._container = container;
    container.className = 'friends-app-container';

    this._user = StorageService.getFullActiveUser();

    if (!this._user) {
      container.innerHTML = `
        <div class="xp-loading" style="text-align:center;padding:40px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Not Signed In</div>
          <p>Sign in to manage your friends list.</p>
        </div>
      `;
      return;
    }

    this._renderApp(container);
  },

  /* ─── Render App ─── */
  _renderApp(container) {
    // Tab bar
    const tabBar = createElement('div', { className: 'friends-tabs' });

    this._tabFriends = createElement('button', {
      className: 'friends-tab active',
      textContent: 'Friends',
      'data-tab': 'friends'
    });
    this._tabRequests = createElement('button', {
      className: 'friends-tab',
      textContent: 'Requests',
      'data-tab': 'requests'
    });
    this._tabSearch = createElement('button', {
      className: 'friends-tab',
      textContent: 'Find People',
      'data-tab': 'search'
    });

    this._tabFriends.addEventListener('click', () => this._switchTab('friends'));
    this._tabRequests.addEventListener('click', () => this._switchTab('requests'));
    this._tabSearch.addEventListener('click', () => this._switchTab('search'));

    tabBar.appendChild(this._tabFriends);
    tabBar.appendChild(this._tabRequests);
    tabBar.appendChild(this._tabSearch);
    container.appendChild(tabBar);

    // Tab content areas
    this._friendsView = createElement('div', { className: 'friends-tab-content' });
    this._requestsView = createElement('div', { className: 'friends-tab-content', style: { display: 'none' } });
    this._searchView = createElement('div', { className: 'friends-tab-content', style: { display: 'none' } });

    container.appendChild(this._friendsView);
    container.appendChild(this._requestsView);
    container.appendChild(this._searchView);

    this._renderFriendsTab();
    this._renderRequestsTab();
    this._renderSearchTab();
  },

  /* ─── Tab Switching ─── */
  _switchTab(tab) {
    const tabs = [this._tabFriends, this._tabRequests, this._tabSearch];
    const views = [this._friendsView, this._requestsView, this._searchView];
    const tabNames = ['friends', 'requests', 'search'];

    tabs.forEach(t => t.classList.remove('active'));
    views.forEach(v => { v.style.display = 'none'; });

    const idx = tabNames.indexOf(tab);
    if (idx !== -1) {
      tabs[idx].classList.add('active');
      views[idx].style.display = 'block';
    }

    if (tab === 'requests') this._renderRequestsTab();
    if (tab === 'friends') this._renderFriendsTab();
  },

  /* ═══ Friends List Tab ═══ */
  _renderFriendsTab() {
    this._friendsView.innerHTML = '';
    const user = this._user;
    const allUsers = StorageService.getUsers();
    const friendNames = user.friends || [];
    const friendsList = friendNames.map(name => allUsers[name]).filter(Boolean);

    if (friendsList.length === 0) {
      this._friendsView.appendChild(createElement('div', {
        className: 'friends-empty',
        textContent: 'No friends yet. Use Find People to add some!'
      }));
      return;
    }

    const list = createElement('div', { className: 'friends-list' });

    for (const friend of friendsList) {
      const card = this._buildFriendCard(friend);
      list.appendChild(card);
    }

    this._friendsView.appendChild(list);
  },

  /* ─── Build a friend card ─── */
  _buildFriendCard(friend) {
    const card = createElement('div', { className: 'friends-card' });

    const avatar = createElement('img', {
      className: 'friends-card-avatar',
      src: friend.avatar || 'assets/ui/icons/profile.svg',
      alt: friend.displayName,
      width: 32,
      height: 32,
      onerror: 'this.src="assets/ui/icons/profile.svg"'
    });
    card.appendChild(avatar);

    const info = createElement('div', { className: 'friends-card-info' });
    info.appendChild(createElement('div', {
      className: 'friends-card-name',
      textContent: friend.displayName
    }));
    info.appendChild(createElement('div', {
      className: 'friends-card-username',
      textContent: '@' + friend.username
    }));
    card.appendChild(info);

    const status = createElement('div', {
      className: 'friends-card-status'
    });
    const dot = createElement('span', {
      className: 'friends-status-dot ' + (friend.status || 'online')
    });
    status.appendChild(dot);
    status.appendChild(createElement('span', {
      className: 'friends-status-label',
      textContent: friend.status === 'playing' ? 'Playing' : (friend.status || 'Online')
    }));
    card.appendChild(status);

    // Actions
    const cardActions = createElement('div', { className: 'friends-card-actions' });

    const messageBtn = UIButton.create({
      label: 'Message',
      onClick: () => this._startChat(friend.username)
    });
    cardActions.appendChild(messageBtn);

    const removeBtn = UIButton.create({
      label: 'Remove',
      onClick: () => this._removeFriend(friend.username)
    });
    cardActions.appendChild(removeBtn);

    card.appendChild(cardActions);

    return card;
  },

  /* ─── Remove friend ─── */
  _removeFriend(username) {
    const user = this._user;
    const allUsers = StorageService.getUsers();
    const otherUser = allUsers[username];
    if (!otherUser) return;

    // Remove from current user's friends
    const friendIdx = (user.friends || []).indexOf(username);
    if (friendIdx !== -1) user.friends.splice(friendIdx, 1);

    // Remove from other user's friends
    const otherIdx = (otherUser.friends || []).indexOf(user.username);
    if (otherIdx !== -1) otherUser.friends.splice(otherIdx, 1);

    StorageService.saveUsers(allUsers);
    StorageService.saveUser(user.username, user);

    this._renderFriendsTab();
  },

  /* ═══ Requests Tab ═══ */
  _renderRequestsTab() {
    this._requestsView.innerHTML = '';
    const user = this._user;
    const allUsers = StorageService.getUsers();

    const incoming = (user.friendRequests?.incoming || []).map(name => allUsers[name]).filter(Boolean);
    const outgoing = (user.friendRequests?.outgoing || []).map(name => allUsers[name]).filter(Boolean);

    // Incoming requests
    if (incoming.length > 0) {
      this._requestsView.appendChild(createElement('div', {
        className: 'friends-request-section-title',
        textContent: 'Incoming Requests'
      }));

      for (const reqUser of incoming) {
        this._requestsView.appendChild(this._buildIncomingRequest(reqUser));
      }
    }

    // Outgoing requests
    if (outgoing.length > 0) {
      this._requestsView.appendChild(createElement('div', {
        className: 'friends-request-section-title',
        textContent: 'Sent Requests'
      }));

      for (const reqUser of outgoing) {
        this._requestsView.appendChild(this._buildOutgoingRequest(reqUser));
      }
    }

    if (incoming.length === 0 && outgoing.length === 0) {
      this._requestsView.appendChild(createElement('div', {
        className: 'friends-empty',
        textContent: 'No pending requests. Use Find People to send one!'
      }));
    }
  },

  /* ─── Build incoming request card ─── */
  _buildIncomingRequest(reqUser) {
    const card = createElement('div', { className: 'friends-request-card' });

    const avatar = createElement('img', {
      className: 'friends-card-avatar',
      src: reqUser.avatar || 'assets/ui/icons/profile.svg',
      alt: reqUser.displayName,
      width: 32,
      height: 32,
      onerror: 'this.src="assets/ui/icons/profile.svg"'
    });
    card.appendChild(avatar);

    const info = createElement('div', { className: 'friends-card-info' });
    info.appendChild(createElement('div', {
      className: 'friends-card-name',
      textContent: reqUser.displayName
    }));
    info.appendChild(createElement('div', {
      className: 'friends-card-username',
      textContent: '@' + reqUser.username
    }));
    card.appendChild(info);

    const actions = createElement('div', { className: 'friends-request-actions' });

    const messageBtn = UIButton.create({
      label: 'Message',
      onClick: () => this._startChat(reqUser.username)
    });
    actions.appendChild(messageBtn);

    const acceptBtn = UIButton.create({
      label: 'Accept',
      default: true,
      onClick: () => this._acceptRequest(reqUser.username)
    });
    actions.appendChild(acceptBtn);

    const rejectBtn = UIButton.create({
      label: 'Reject',
      onClick: () => this._rejectRequest(reqUser.username)
    });
    actions.appendChild(rejectBtn);

    card.appendChild(actions);
    return card;
  },

  /* ─── Build outgoing request card ─── */
  _buildOutgoingRequest(reqUser) {
    const card = createElement('div', { className: 'friends-request-card' });

    const avatar = createElement('img', {
      className: 'friends-card-avatar',
      src: reqUser.avatar || 'assets/ui/icons/profile.svg',
      alt: reqUser.displayName,
      width: 32,
      height: 32,
      onerror: 'this.src="assets/ui/icons/profile.svg"'
    });
    card.appendChild(avatar);

    const info = createElement('div', { className: 'friends-card-info' });
    info.appendChild(createElement('div', {
      className: 'friends-card-name',
      textContent: reqUser.displayName
    }));
    info.appendChild(createElement('div', {
      className: 'friends-card-username',
      textContent: '@' + reqUser.username
    }));
    card.appendChild(info);

    const actions = createElement('div', { className: 'friends-request-actions' });

    const messageBtn = UIButton.create({
      label: 'Message',
      onClick: () => this._startChat(reqUser.username)
    });
    actions.appendChild(messageBtn);

    const cancelBtn = UIButton.create({
      label: 'Cancel Request',
      onClick: () => this._cancelRequest(reqUser.username)
    });
    actions.appendChild(cancelBtn);

    card.appendChild(actions);
    return card;
  },

  /* ─── Start a chat with a user ─── */
  _startChat(username) {
    dispatchEvent('launch-app', {
      appId: 'chat',
      title: 'Chat'
    });
    // After the window opens, select that conversation
    setTimeout(() => {
      dispatchEvent('open-chat-conversation', { with: username });
    }, 300);
  },

  /* ─── Accept friend request ─── */
  _acceptRequest(username) {
    const user = this._user;
    const allUsers = StorageService.getUsers();
    const otherUser = allUsers[username];
    if (!otherUser) return;

    // Remove from incoming
    const incomingIdx = (user.friendRequests?.incoming || []).indexOf(username);
    if (incomingIdx !== -1) user.friendRequests.incoming.splice(incomingIdx, 1);

    // Add to friends
    if (!user.friends) user.friends = [];
    if (user.friends.indexOf(username) === -1) user.friends.push(username);

    // Add to other user's friends
    if (!otherUser.friends) otherUser.friends = [];
    if (otherUser.friends.indexOf(user.username) === -1) otherUser.friends.push(user.username);

    // Remove from other user's outgoing
    const outgoingIdx = (otherUser.friendRequests?.outgoing || []).indexOf(user.username);
    if (outgoingIdx !== -1) otherUser.friendRequests.outgoing.splice(outgoingIdx, 1);

    StorageService.saveUsers(allUsers);
    StorageService.saveUser(user.username, user);

    // Dispatch notification
    dispatchEvent('friend-request-accepted', { by: otherUser.username });

    // Re-render
    this._renderRequestsTab();
    this._renderFriendsTab();
  },

  /* ─── Reject friend request ─── */
  _rejectRequest(username) {
    const user = this._user;
    const allUsers = StorageService.getUsers();
    const otherUser = allUsers[username];
    if (!otherUser) return;

    // Remove from incoming
    const incomingIdx = (user.friendRequests?.incoming || []).indexOf(username);
    if (incomingIdx !== -1) user.friendRequests.incoming.splice(incomingIdx, 1);

    // Remove from other user's outgoing
    const outgoingIdx = (otherUser.friendRequests?.outgoing || []).indexOf(user.username);
    if (outgoingIdx !== -1) otherUser.friendRequests.outgoing.splice(outgoingIdx, 1);

    StorageService.saveUsers(allUsers);
    StorageService.saveUser(user.username, user);

    this._renderRequestsTab();
  },

  /* ─── Cancel outgoing request ─── */
  _cancelRequest(username) {
    const user = this._user;
    const allUsers = StorageService.getUsers();
    const otherUser = allUsers[username];
    if (!otherUser) return;

    // Remove from outgoing
    const outgoingIdx = (user.friendRequests?.outgoing || []).indexOf(username);
    if (outgoingIdx !== -1) user.friendRequests.outgoing.splice(outgoingIdx, 1);

    // Remove from other user's incoming
    const incomingIdx = (otherUser.friendRequests?.incoming || []).indexOf(user.username);
    if (incomingIdx !== -1) otherUser.friendRequests.incoming.splice(incomingIdx, 1);

    StorageService.saveUsers(allUsers);
    StorageService.saveUser(user.username, user);

    this._renderRequestsTab();
  },

  /* ═══ Search Tab ═══ */
  _renderSearchTab() {
    this._searchView.innerHTML = '';

    // Search bar
    const searchRow = createElement('div', { className: 'friends-search-row' });
    this._searchInput = createElement('input', {
      id: 'friends-search-input',
      name: 'friends-search',
      className: 'xp-input friends-search-input',
      type: 'text',
      placeholder: 'Search by username or display name...',
      autocomplete: 'off'
    });
    searchRow.appendChild(this._searchInput);

    const searchBtn = UIButton.create({
      label: 'Search',
      default: true,
      onClick: () => this._doSearch()
    });
    searchRow.appendChild(searchBtn);
    this._searchView.appendChild(searchRow);

    // Search on Enter
    this._searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._doSearch();
    });

    // Results area
    this._searchResults = createElement('div', { className: 'friends-search-results' });
    this._searchView.appendChild(this._searchResults);

    this._searchResults.appendChild(createElement('div', {
      className: 'friends-search-hint',
      textContent: 'Type a name above and click Search to find people.'
    }));
  },

  /* ─── Execute search ─── */
  _doSearch() {
    const query = this._searchInput.value.trim().toLowerCase();
    if (!query) return;

    this._searchResults.innerHTML = '';
    const allUsers = StorageService.getUsers();
    const currentUser = this._user;

    const results = Object.values(allUsers).filter(u =>
      u.username !== currentUser.username &&
      (u.username.toLowerCase().includes(query) ||
       u.displayName.toLowerCase().includes(query))
    );

    if (results.length === 0) {
      this._searchResults.appendChild(createElement('div', {
        className: 'friends-search-none',
        textContent: 'No users found matching "' + query + '".'
      }));
      return;
    }

    const list = createElement('div', { className: 'friends-search-list' });

    for (const foundUser of results) {
      const card = createElement('div', { className: 'friends-search-card' });

      const avatar = createElement('img', {
        className: 'friends-card-avatar',
        src: foundUser.avatar || 'assets/ui/icons/profile.svg',
        alt: foundUser.displayName,
        width: 32,
        height: 32,
        onerror: 'this.src="assets/ui/icons/profile.svg"'
      });
      card.appendChild(avatar);

      const info = createElement('div', { className: 'friends-card-info' });
      info.appendChild(createElement('div', {
        className: 'friends-card-name',
        textContent: foundUser.displayName
      }));
      info.appendChild(createElement('div', {
        className: 'friends-card-username',
        textContent: '@' + foundUser.username
      }));
      card.appendChild(info);

      // Determine relationship status
      const isFriend = (currentUser.friends || []).indexOf(foundUser.username) !== -1;
      const hasOutgoing = (currentUser.friendRequests?.outgoing || []).indexOf(foundUser.username) !== -1;
      const hasIncoming = (currentUser.friendRequests?.incoming || []).indexOf(foundUser.username) !== -1;

      const cardActions = createElement('div', { className: 'friends-card-actions' });

      // Always show Message button for any user
      const messageBtn = UIButton.create({
        label: 'Message',
        onClick: () => this._startChat(foundUser.username)
      });
      cardActions.appendChild(messageBtn);

      if (isFriend) {
        const badge = createElement('span', {
          className: 'friends-badge friends-badge-friend',
          textContent: 'Friend'
        });
        cardActions.appendChild(badge);
      } else if (hasOutgoing) {
        const badge = createElement('span', {
          className: 'friends-badge friends-badge-pending',
          textContent: 'Request Sent'
        });
        cardActions.appendChild(badge);
      } else if (hasIncoming) {
        const badge = createElement('span', {
          className: 'friends-badge friends-badge-incoming',
          textContent: 'Requested You'
        });
        cardActions.appendChild(badge);
      } else {
        const addBtn = UIButton.create({
          label: 'Add Friend',
          onClick: () => this._sendRequest(foundUser.username)
        });
        cardActions.appendChild(addBtn);
      }

      card.appendChild(cardActions);

      list.appendChild(card);
    }

    this._searchResults.appendChild(list);
  },

  /* ─── Send friend request ─── */
  _sendRequest(username) {
    const user = this._user;
    const allUsers = StorageService.getUsers();
    const otherUser = allUsers[username];
    if (!otherUser) return;

    // Add to current user's outgoing
    if (!user.friendRequests) user.friendRequests = { incoming: [], outgoing: [] };
    if (user.friendRequests.outgoing.indexOf(username) === -1) {
      user.friendRequests.outgoing.push(username);
    }

    // Add to other user's incoming
    if (!otherUser.friendRequests) otherUser.friendRequests = { incoming: [], outgoing: [] };
    if (otherUser.friendRequests.incoming.indexOf(user.username) === -1) {
      otherUser.friendRequests.incoming.push(user.username);
    }

    StorageService.saveUsers(allUsers);
    StorageService.saveUser(user.username, user);

    // Dispatch notification event
    dispatchEvent('friend-request-sent', { to: otherUser.displayName });

    // Re-run search to update UI
    this._doSearch();
  },

  /* ─── Cleanup ─── */
  destroy() {
    this._container = null;
    this._user = null;
  }
};
