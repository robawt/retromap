/* ═══════════════════════════════════════════════════════
   RetroMap — Chat App (DM + Group Chats)
   ═══════════════════════════════════════════════════════ */

const ChatApp = {
  title: 'Chat',
  defaultWidth: 580,
  defaultHeight: 460,
  minWidth: 420,
  minHeight: 360,
  resizable: true,

  _container: null,
  _user: null,
  _activeConversation: null,
  _activeConvType: null, // 'dm' or 'group'
  _pollTimer: null,
  _conversationsList: null,
  _messageArea: null,
  _messageInput: null,
  _inputField: null,
  _lastMessageCount: 0,
  _notifiedSenders: null,

  /* ─── Render ─── */
  render(container) {
    this._container = container;
    container.className = 'chat-app-container';

    this._user = StorageService.getFullActiveUser();

    if (!this._user) {
      container.innerHTML = `
        <div class="xp-loading" style="text-align:center;padding:40px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Not Signed In</div>
          <p>Sign in to send and receive messages.</p>
        </div>
      `;
      return;
    }

    this._renderChat(container);
    this._startPolling();
  },

  /* ─── Polling ─── */
  _startPolling() {
    this._stopPolling();
    this._lastMessageCount = this._getMessageCount();
    this._pollTimer = setInterval(() => {
      const newCount = this._getMessageCount();
      if (newCount !== this._lastMessageCount) {
        this._lastMessageCount = newCount;
        this._refreshConversations();
        if (this._activeConversation) {
          if (this._activeConvType === 'group') {
            this._renderGroupMessages(this._activeConversation);
          } else {
            this._renderMessages(this._activeConversation);
          }
        }
        this._notifyNewMessages();
      }
    }, 3000);
  },

  _stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  },

  _getMessageCount() {
    try {
      const data = localStorage.getItem('retromap-messages');
      if (!data) return 0;
      const messages = JSON.parse(data);
      return Array.isArray(messages) ? messages.length : 0;
    } catch {
      return 0;
    }
  },

  /* ─── Chat Layout ─── */
  _renderChat(container) {
    const layout = createElement('div', { className: 'chat-layout' });

    // Left sidebar
    const sidebar = createElement('div', { className: 'chat-sidebar' });
    const sidebarHeader = createElement('div', { className: 'chat-sidebar-header' });

    const headerLabel = createElement('span', { textContent: 'Conversations' });
    sidebarHeader.appendChild(headerLabel);

    // New Group button
    const newGroupBtn = createElement('button', {
      className: 'chat-new-group-btn',
      textContent: '+',
      title: 'Create new group'
    });
    newGroupBtn.addEventListener('click', () => this._openNewGroupDialog());
    sidebarHeader.appendChild(newGroupBtn);

    sidebar.appendChild(sidebarHeader);

    // User search row
    this._searchRow = createElement('div', { className: 'chat-search-row' });
    this._searchInput = createElement('input', {
      id: 'chat-user-search',
      name: 'chat-user-search',
      className: 'xp-input chat-search-input',
      type: 'text',
      placeholder: 'Search users...',
      autocomplete: 'off'
    });
    this._searchResults = createElement('div', { className: 'chat-search-results hidden' });
    this._searchInput.addEventListener('input', () => this._doChatSearch());
    this._searchInput.addEventListener('blur', () => {
      setTimeout(() => this._searchResults.classList.add('hidden'), 200);
    });
    this._searchInput.addEventListener('focus', () => {
      if (this._searchInput.value.trim()) this._searchResults.classList.remove('hidden');
    });
    this._searchRow.appendChild(this._searchInput);
    this._searchRow.appendChild(this._searchResults);
    sidebar.appendChild(this._searchRow);

    this._conversationsList = createElement('div', { className: 'chat-conversations' });
    sidebar.appendChild(this._conversationsList);
    layout.appendChild(sidebar);

    // Right panel
    const main = createElement('div', { className: 'chat-main' });
    this._messageArea = createElement('div', { className: 'chat-messages' });
    this._messageInput = this._buildMessageInput();
    main.appendChild(this._messageArea);
    main.appendChild(this._messageInput);
    layout.appendChild(main);

    container.appendChild(layout);

    this._refreshConversations();
    this._showWelcome();

    // Listen for open-chat-conversation events (from FriendsApp "Message" buttons)
    this._openConvHandler = (e) => {
      if (e.detail.with && this._user) {
        this._selectConversation(e.detail.with);
      }
    };
    listenEvent('open-chat-conversation', this._openConvHandler);
  },

  _showWelcome() {
    this._messageArea.innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">&#9993;</div>
        <div class="chat-welcome-title">RetroMap Chat</div>
        <div class="chat-welcome-text">Select a conversation or create a group to start chatting.</div>
      </div>
    `;
  },

  /* ─── Message Input ─── */
  _buildMessageInput() {
    const bar = createElement('div', { className: 'chat-input-bar' });

    this._inputField = createElement('input', {
      id: 'chat-message-input',
      name: 'chat-message',
      className: 'xp-input chat-input-field',
      type: 'text',
      placeholder: 'Type a message...',
      autocomplete: 'off'
    });

    const sendBtn = UIButton.create({
      label: 'Send',
      default: true,
      onClick: () => this._sendMessage()
    });

    bar.appendChild(this._inputField);
    bar.appendChild(sendBtn);

    this._inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._sendMessage();
      }
    });

    return bar;
  },

  /* ─── Refresh Conversations List ─── */
  _refreshConversations() {
    if (!this._user) return;
    this._conversationsList.innerHTML = '';

    const username = this._user.username;
    const summaries = ChatService.getConversationSummaries(username);
    const allUsers = StorageService.getUsers();

    if (summaries.length === 0) {
      this._conversationsList.appendChild(createElement('div', {
        className: 'chat-conv-empty',
        textContent: 'No conversations yet. Message a friend or create a group!'
      }));
      return;
    }

    for (const summary of summaries) {
      const convEl = this._buildConversationItem(summary, allUsers);
      this._conversationsList.appendChild(convEl);
    }
  },

  /* ─── Build Conversation Item ─── */
  _buildConversationItem(summary, allUsers) {
    const isActive = this._activeConvType === summary.type &&
      this._activeConversation === (summary.type === 'group' ? summary.groupId : summary.partner);

    const el = createElement('button', {
      className: 'chat-conv-item' + (isActive ? ' active' : ''),
      'data-key': (summary.type === 'group' ? 'group:' : 'dm:') + (summary.type === 'group' ? summary.groupId : summary.partner)
    });

    if (summary.type === 'group') {
      // Group icon
      const icon = createElement('div', {
        className: 'chat-conv-group-icon',
        textContent: '#'
      });
      el.appendChild(icon);

      const info = createElement('div', { className: 'chat-conv-info' });
      const nameRow = createElement('div', { className: 'chat-conv-name-row' });
      const group = ChatService.getGroup(summary.groupId);
      nameRow.appendChild(createElement('span', {
        className: 'chat-conv-name',
        textContent: group ? group.name : 'Group'
      }));
      nameRow.appendChild(createElement('span', {
        className: 'chat-conv-time',
        textContent: ChatService.formatTime(summary.lastTimestamp)
      }));
      info.appendChild(nameRow);

      const preview = createElement('div', { className: 'chat-conv-preview' });
      preview.textContent = summary.lastContent.length > 40
        ? summary.lastContent.slice(0, 40) + '...'
        : summary.lastContent;
      info.appendChild(preview);
      el.appendChild(info);

      // Unread
      const unread = ChatService.getUnreadCount(this._user.username, summary.groupId, 'group');
      if (unread > 0) {
        el.appendChild(createElement('span', {
          className: 'chat-conv-unread',
          textContent: unread > 99 ? '99+' : String(unread)
        }));
      }

      el.addEventListener('click', () => {
        this._selectGroupConversation(summary.groupId);
      });
    } else {
      // DM: user avatar
      const otherUser = allUsers[summary.partner];
      const avatar = createElement('img', {
        className: 'chat-conv-avatar',
        src: (otherUser && otherUser.avatar) || 'assets/ui/icons/profile.svg',
        alt: summary.partner,
        width: 16, height: 16,
        onerror: 'this.src="assets/ui/icons/profile.svg"'
      });
      el.appendChild(avatar);

      const info = createElement('div', { className: 'chat-conv-info' });
      const nameRow = createElement('div', { className: 'chat-conv-name-row' });
      nameRow.appendChild(createElement('span', {
        className: 'chat-conv-name',
        textContent: (otherUser && otherUser.displayName) || summary.partner
      }));
      nameRow.appendChild(createElement('span', {
        className: 'chat-conv-time',
        textContent: ChatService.formatTime(summary.lastTimestamp)
      }));
      info.appendChild(nameRow);

      const preview = createElement('div', { className: 'chat-conv-preview' });
      const previewText = summary.lastFromMe
        ? 'You: ' + summary.lastContent
        : summary.lastContent;
      preview.textContent = previewText.length > 40
        ? previewText.slice(0, 40) + '...'
        : previewText;
      info.appendChild(preview);
      el.appendChild(info);

      // Unread
      const unread = ChatService.getUnreadCount(this._user.username, summary.partner, 'dm');
      if (unread > 0) {
        el.appendChild(createElement('span', {
          className: 'chat-conv-unread',
          textContent: unread > 99 ? '99+' : String(unread)
        }));
      }

      el.addEventListener('click', () => {
        this._selectConversation(summary.partner);
      });
    }

    return el;
  },

  /* ─── User search in sidebar ─── */
  _doChatSearch() {
    const query = this._searchInput.value.trim().toLowerCase();
    const resultsContainer = this._searchResults;
    resultsContainer.innerHTML = '';

    if (!query || !this._user) {
      resultsContainer.classList.add('hidden');
      return;
    }

    const allUsers = StorageService.getUsers();
    const matches = Object.values(allUsers).filter(u =>
      u.username !== this._user.username &&
      (u.username.toLowerCase().includes(query) ||
       u.displayName.toLowerCase().includes(query))
    ).slice(0, 10);

    if (matches.length === 0) {
      resultsContainer.innerHTML = '<div class="chat-search-none">No users found</div>';
      resultsContainer.classList.remove('hidden');
      return;
    }

    resultsContainer.classList.remove('hidden');

    for (const user of matches) {
      const item = createElement('button', {
        className: 'chat-search-result',
        type: 'button'
      });

      const avatar = createElement('img', {
        className: 'chat-search-result-avatar',
        src: user.avatar || 'assets/ui/icons/profile.svg',
        alt: user.displayName,
        width: 16, height: 16,
        onerror: 'this.src="assets/ui/icons/profile.svg"'
      });
      item.appendChild(avatar);

      const info = createElement('div', { className: 'chat-search-result-info' });
      info.appendChild(createElement('div', {
        className: 'chat-search-result-name',
        textContent: user.displayName
      }));
      info.appendChild(createElement('div', {
        className: 'chat-search-result-username',
        textContent: '@' + user.username
      }));
      item.appendChild(info);

      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this._searchInput.value = '';
        this._searchResults.classList.add('hidden');
        // Select this user's DM conversation
        this._selectConversation(user.username);
      });

      resultsContainer.appendChild(item);
    }
  },

  /* ─── Select DM Conversation ─── */
  _selectConversation(partner) {
    this._activeConversation = partner;
    this._activeConvType = 'dm';

    ChatService.markAsRead(this._user.username, partner, 'dm');

    const items = this._conversationsList.querySelectorAll('.chat-conv-item');
    items.forEach(item => {
      const key = 'dm:' + partner;
      item.classList.toggle('active', item.dataset.key === key);
    });

    this._renderMessages(partner);
    setTimeout(() => {
      if (this._inputField) this._inputField.focus();
    }, 50);
  },

  /* ─── Select Group Conversation ─── */
  _selectGroupConversation(groupId) {
    this._activeConversation = groupId;
    this._activeConvType = 'group';

    ChatService.markAsRead(this._user.username, groupId, 'group');

    const items = this._conversationsList.querySelectorAll('.chat-conv-item');
    items.forEach(item => {
      const key = 'group:' + groupId;
      item.classList.toggle('active', item.dataset.key === key);
    });

    this._renderGroupMessages(groupId);
    setTimeout(() => {
      if (this._inputField) this._inputField.focus();
    }, 50);
  },

  /* ─── Render DM Messages ─── */
  _renderMessages(partner) {
    this._messageArea.innerHTML = '';
    const username = this._user.username;
    const messages = ChatService.getMessages(username, partner);
    const allUsers = StorageService.getUsers();
    const otherUser = allUsers[partner];

    const header = createElement('div', { className: 'chat-msg-header' });
    if (otherUser) {
      const avatar = createElement('img', {
        className: 'chat-msg-header-avatar',
        src: otherUser.avatar || 'assets/ui/icons/profile.svg',
        alt: otherUser.displayName,
        width: 16, height: 16,
        onerror: 'this.src="assets/ui/icons/profile.svg"'
      });
      header.appendChild(avatar);
      header.appendChild(createElement('span', {
        className: 'chat-msg-header-name',
        textContent: otherUser.displayName
      }));
    }
    this._messageArea.appendChild(header);

    if (messages.length === 0) {
      const empty = createElement('div', {
        className: 'chat-msg-empty',
        textContent: 'No messages yet. Say hello!'
      });
      this._messageArea.appendChild(empty);
      this._scrollToBottom();
      return;
    }

    const msgList = createElement('div', { className: 'chat-msg-list' });
    for (const msg of messages) {
      const isMine = msg.from === username;
      const bubble = createElement('div', {
        className: 'chat-msg-bubble' + (isMine ? ' mine' : ' theirs')
      });
      bubble.appendChild(createElement('div', {
        className: 'chat-msg-text',
        textContent: msg.content
      }));
      bubble.appendChild(createElement('div', {
        className: 'chat-msg-time',
        textContent: ChatService.formatTime(msg.timestamp)
      }));
      msgList.appendChild(bubble);
    }

    this._messageArea.appendChild(msgList);
    this._scrollToBottom();
  },

  /* ─── Render Group Messages ─── */
  _renderGroupMessages(groupId) {
    this._messageArea.innerHTML = '';
    const username = this._user.username;
    const messages = ChatService.getGroupMessages(groupId);
    const group = ChatService.getGroup(groupId);
    const allUsers = StorageService.getUsers();

    // Group header
    const header = createElement('div', { className: 'chat-msg-header' });
    const groupIcon = createElement('div', {
      className: 'chat-msg-header-group-icon',
      textContent: '#'
    });
    header.appendChild(groupIcon);

    const nameInfo = createElement('div', { className: 'chat-msg-header-group-info' });
    nameInfo.appendChild(createElement('span', {
      className: 'chat-msg-header-name',
      textContent: group ? group.name : 'Group'
    }));
    nameInfo.appendChild(createElement('span', {
      className: 'chat-msg-header-members',
      textContent: group ? (group.members.length + ' members') : ''
    }));
    header.appendChild(nameInfo);

    // Member list toggle
    if (group) {
      const membersBtn = createElement('button', {
        className: 'chat-group-members-btn',
        textContent: 'Members'
      });
      membersBtn.addEventListener('click', () => this._showGroupMembers(group));
      header.appendChild(membersBtn);

      // Leave group button (if not creator, or always allow)
      if (group.createdBy !== username) {
        const leaveBtn = createElement('button', {
          className: 'chat-group-leave-btn',
          textContent: 'Leave'
        });
        leaveBtn.addEventListener('click', () => {
          if (confirm('Leave this group?')) {
            ChatService.removeGroupMember(groupId, username);
            this._activeConversation = null;
            this._activeConvType = null;
            this._showWelcome();
            this._refreshConversations();
          }
        });
        header.appendChild(leaveBtn);
      }
    }

    this._messageArea.appendChild(header);

    if (messages.length === 0) {
      const empty = createElement('div', {
        className: 'chat-msg-empty',
        textContent: 'No messages yet. Start the conversation!'
      });
      this._messageArea.appendChild(empty);
      this._scrollToBottom();
      return;
    }

    const msgList = createElement('div', { className: 'chat-msg-list' });

    // Group messages by sender for compact display
    let lastSender = null;
    for (const msg of messages) {
      const isMine = msg.from === username;
      const showSender = msg.from !== lastSender;
      lastSender = msg.from;

      const bubble = createElement('div', {
        className: 'chat-msg-bubble' + (isMine ? ' mine' : ' theirs')
      });

      // Show sender name for others' messages
      if (!isMine && showSender) {
        const senderUser = allUsers[msg.from];
        bubble.appendChild(createElement('div', {
          className: 'chat-msg-sender',
          textContent: (senderUser && senderUser.displayName) || msg.from
        }));
      }

      bubble.appendChild(createElement('div', {
        className: 'chat-msg-text',
        textContent: msg.content
      }));
      bubble.appendChild(createElement('div', {
        className: 'chat-msg-time',
        textContent: ChatService.formatTime(msg.timestamp)
      }));
      msgList.appendChild(bubble);
    }

    this._messageArea.appendChild(msgList);
    this._scrollToBottom();
  },

  /* ─── Show Group Members Dialog ─── */
  _showGroupMembers(group) {
    const allUsers = StorageService.getUsers();
    const membersList = group.members.map(m => {
      const user = allUsers[m];
      return (user && user.displayName) || m;
    });

    const isCreator = this._user && this._user.username === group.createdBy;
    let html = '<div style="padding:8px;max-height:200px;overflow-y:auto;">';
    html += '<div style="font-weight:700;font-size:11px;margin-bottom:6px;">Members of ' + group.name + '</div>';
    for (let i = 0; i < membersList.length; i++) {
      const mUsername = group.members[i];
      const isOwner = mUsername === group.createdBy;
      html += '<div style="padding:3px 0;font-size:11px;">' +
        escapeHtml(membersList[i]) +
        (isOwner ? ' <span style="color:#666;font-size:9px;">(owner)</span>' : '') +
        '</div>';
    }
    html += '</div>';

    // Add member form (creator only)
    if (isCreator) {
      html += '<div style="padding:4px 8px 8px;border-top:1px solid #ACA899;">' +
        '<label style="font-size:10px;display:block;margin-bottom:3px;">Add member:</label>' +
        '<div style="display:flex;gap:4px;">' +
        '<input id="chat-add-member-input" class="xp-input" type="text" placeholder="Username" style="flex:1;" />' +
        '</div></div>';
    }

    UIDialog.show({
      title: 'Group Members',
      body: html,
      closeable: true,
      buttons: [{ label: 'Close', default: true }]
    });

    if (isCreator) {
      setTimeout(() => {
        const input = document.getElementById('chat-add-member-input');
        if (!input) return;
        const addBtn = UIButton.create({
          label: 'Add',
          onClick: () => {
            const name = input.value.trim();
            if (!name) return;
            const result = ChatService.addGroupMember(group.id, name);
            if (result) {
              UIDialog.close();
              this._showGroupMembers(ChatService.getGroup(group.id));
            } else {
              UIDialog.showAlert('Could not add user. They may already be a member or the user doesn\'t exist.');
            }
          }
        });
        input.parentNode.appendChild(addBtn);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); }
        });
      }, 50);
    }
  },

  /* ─── New Group Dialog ─── */
  _openNewGroupDialog() {
    const allUsers = StorageService.getUsers();
    const username = this._user.username;

    let optionsHtml = '';
    for (const u in allUsers) {
      if (u === username) continue;
      optionsHtml += '<label style="display:block;padding:2px 0;font-size:11px;">' +
        '<input type="checkbox" class="chat-group-member-cb" value="' + u + '" /> ' +
        escapeHtml(allUsers[u].displayName || u) +
        '</label>';
    }

    UIDialog.show({
      title: 'Create Group',
      body: '<div style="padding:8px;">' +
        '<label style="display:block;font-size:10px;margin-bottom:3px;">Group name:</label>' +
        '<input id="chat-group-name-input" class="xp-input" type="text" placeholder="Group name..." style="width:100%;margin-bottom:8px;" />' +
        '<label style="display:block;font-size:10px;margin-bottom:3px;">Add members:</label>' +
        '<div style="max-height:180px;overflow-y:auto;border:1px solid #ACA899;padding:4px;background:#FFF;">' +
        (optionsHtml || '<div style="font-style:italic;color:#888;font-size:10px;">No other users found</div>') +
        '</div>' +
        '</div>',
      closeable: true,
      buttons: [
        { label: 'Cancel' },
        { label: 'Create', default: true }
      ]
    });

    // Wire the Create button
    setTimeout(() => {
      const createBtn = document.querySelector('.xp-dialog-buttons .xp-button:last-child');
      if (!createBtn) return;

      createBtn.addEventListener('click', (e) => {
        const name = document.getElementById('chat-group-name-input').value.trim();
        if (!name) { UIDialog.showAlert('Please enter a group name.'); return; }

        const checkboxes = document.querySelectorAll('.chat-group-member-cb:checked');
        const members = Array.from(checkboxes).map(cb => cb.value);
        if (members.length === 0) { UIDialog.showAlert('Please select at least one member.'); return; }

        const group = ChatService.createGroup(name, username, members);
        if (group) {
          UIDialog.close();
          this._refreshConversations();
          this._selectGroupConversation(group.id);
        }
      });
    }, 50);
  },

  /* ─── Send Message ─── */
  _sendMessage() {
    if (!this._activeConversation) return;
    const content = this._inputField.value.trim();
    if (!content) return;

    if (this._activeConvType === 'group') {
      ChatService.sendGroupMessage(this._user.username, this._activeConversation, content);
      dispatchEvent('new-message', { from: this._user.username, to: this._activeConversation, type: 'group' });
    } else {
      ChatService.sendMessage(this._user.username, this._activeConversation, content);
      dispatchEvent('new-message', { from: this._user.username, to: this._activeConversation });
    }

    this._inputField.value = '';
    this._lastMessageCount = this._getMessageCount();

    if (this._activeConvType === 'group') {
      this._renderGroupMessages(this._activeConversation);
    } else {
      this._renderMessages(this._activeConversation);
    }
    this._refreshConversations();
  },

  /* ─── Notify new messages ─── */
  _notifyNewMessages() {
    if (!this._user) return;
    if (!this._notifiedSenders) this._notifiedSenders = new Set();
    const username = this._user.username;
    const all = ChatService.getAllMessages();

    // For each unread message, check if it's from a new sender/group
    for (const m of all) {
      if (m.read) continue;
      if (m.from === username) continue;

      if (m.type === 'group') {
        // Group message: notify if not the active group
        if (this._activeConvType !== 'group' || this._activeConversation !== m.to) {
          const key = 'group:' + m.to;
          if (!this._notifiedSenders.has(key)) {
            this._notifiedSenders.add(key);
            dispatchEvent('new-message', { from: m.from, type: 'group', groupId: m.to });
          }
        }
      } else {
        // DM: notify if not the active conversation
        if (m.to === username && m.from !== this._activeConversation) {
          if (!this._notifiedSenders.has(m.from)) {
            this._notifiedSenders.add(m.from);
            dispatchEvent('new-message', { from: m.from });
          }
        }
      }
    }

    // Clean up old notifications periodically
    if (this._notifiedSenders.size > 50) {
      this._notifiedSenders = new Set();
    }
  },

  _scrollToBottom() {
    setTimeout(() => {
      this._messageArea.scrollTop = this._messageArea.scrollHeight;
    }, 10);
  },

  /* ─── Cleanup ─── */
  destroy() {
    this._stopPolling();
    if (this._openConvHandler) {
      removeEvent('open-chat-conversation', this._openConvHandler);
      this._openConvHandler = null;
    }
    this._container = null;
    this._user = null;
    this._activeConversation = null;
    this._activeConvType = null;
    this._conversationsList = null;
    this._messageArea = null;
    this._inputField = null;
  }
};
