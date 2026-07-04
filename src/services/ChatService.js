/* ═══════════════════════════════════════════════════════
   RetroMap — Chat Service
   ═══════════════════════════════════════════════════════ */

const ChatService = {
  STORAGE_KEY: 'retromap-messages',
  GROUPS_KEY: 'retromap-chat-groups',

  /* ─── All messages ─── */
  getAllMessages() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  _saveAllMessages(messages) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
  },

  /* ─── All groups ─── */
  getAllGroups() {
    try {
      return JSON.parse(localStorage.getItem(this.GROUPS_KEY)) || {};
    } catch {
      return {};
    }
  },

  _saveAllGroups(groups) {
    localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
  },

  /* ─── Create a group ─── */
  createGroup(name, creator, memberUsernames) {
    if (!name || !name.trim()) return null;

    const groups = this.getAllGroups();
    const members = [creator, ...memberUsernames.filter(m => m !== creator)];
    const id = 'group_' + generateId();

    groups[id] = {
      id,
      name: name.trim(),
      createdBy: creator,
      members,
      createdAt: new Date().toISOString()
    };

    this._saveAllGroups(groups);
    return groups[id];
  },

  /* ─── Get groups a user is in ─── */
  getUserGroups(username) {
    const groups = this.getAllGroups();
    const result = [];
    for (const id in groups) {
      if (groups[id].members.includes(username)) {
        result.push(groups[id]);
      }
    }
    return result;
  },

  /* ─── Add member to group ─── */
  addGroupMember(groupId, username) {
    const groups = this.getAllGroups();
    if (!groups[groupId]) return false;
    if (groups[groupId].members.includes(username)) return false;
    groups[groupId].members.push(username);
    this._saveAllGroups(groups);
    return true;
  },

  /* ─── Remove member from group ─── */
  removeGroupMember(groupId, username) {
    const groups = this.getAllGroups();
    if (!groups[groupId]) return false;
    groups[groupId].members = groups[groupId].members.filter(m => m !== username);
    this._saveAllGroups(groups);
    return true;
  },

  /* ─── Get group info ─── */
  getGroup(groupId) {
    const groups = this.getAllGroups();
    return groups[groupId] || null;
  },

  /* ─── DM messages between two users ─── */
  getMessages(userA, userB) {
    const all = this.getAllMessages();
    return all.filter(m =>
      (!m.type || m.type === 'dm') &&
      ((m.from === userA && m.to === userB) ||
       (m.from === userB && m.to === userA))
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  /* ─── Group messages ─── */
  getGroupMessages(groupId) {
    const all = this.getAllMessages();
    return all.filter(m => m.type === 'group' && m.to === groupId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  /* ─── Send a DM ─── */
  sendMessage(from, to, content) {
    if (!content || !content.trim()) return null;

    const all = this.getAllMessages();
    const msg = {
      id: generateId(),
      type: 'dm',
      from,
      to,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    all.push(msg);
    this._saveAllMessages(all);
    return msg;
  },

  /* ─── Send a group message ─── */
  sendGroupMessage(from, groupId, content) {
    if (!content || !content.trim()) return null;

    const group = this.getGroup(groupId);
    if (!group) return null;
    if (!group.members.includes(from)) return null;

    const all = this.getAllMessages();
    const msg = {
      id: generateId(),
      type: 'group',
      from,
      to: groupId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    all.push(msg);
    this._saveAllMessages(all);
    return msg;
  },

  /* ─── Get all conversation partners + groups for a user ─── */
  getConversations(username) {
    const all = this.getAllMessages();
    const partners = new Set();
    const groupIds = new Set();

    for (const msg of all) {
      if (msg.type === 'group') {
        if (msg.from === username || msg.to === username) {
          groupIds.add(msg.to);
        }
      } else {
        if (msg.from === username) partners.add(msg.to);
        if (msg.to === username) partners.add(msg.from);
      }
    }

    // Also include groups the user is a member of (even without messages)
    const userGroups = this.getUserGroups(username);
    for (const g of userGroups) {
      groupIds.add(g.id);
    }

    return { partners: Array.from(partners), groups: Array.from(groupIds) };
  },

  /* ─── Unread count for DM or group ─── */
  getUnreadCount(username, fromUserOrGroupId, type) {
    const all = this.getAllMessages();
    if (type === 'group') {
      return all.filter(m => m.type === 'group' && m.to === fromUserOrGroupId && m.from !== username && !m.read).length;
    }
    return all.filter(m => (!m.type || m.type === 'dm') && m.to === username && m.from === fromUserOrGroupId && !m.read).length;
  },

  getTotalUnreadCount(username) {
    const all = this.getAllMessages();
    let total = 0;
    for (const m of all) {
      if (m.type === 'group') {
        if (m.to && m.from !== username && !m.read) total++;
      } else {
        if (m.to === username && !m.read) total++;
      }
    }
    return total;
  },

  /* ─── Mark messages as read ─── */
  markAsRead(username, fromUserOrGroupId, type) {
    const all = this.getAllMessages();
    let changed = false;

    for (const msg of all) {
      if (type === 'group') {
        if (msg.type === 'group' && msg.to === fromUserOrGroupId && msg.from !== username && !msg.read) {
          msg.read = true;
          changed = true;
        }
      } else {
        if ((!msg.type || msg.type === 'dm') && msg.to === username && msg.from === fromUserOrGroupId && !msg.read) {
          msg.read = true;
          changed = true;
        }
      }
    }

    if (changed) this._saveAllMessages(all);
  },

  /* ─── Conversation summaries (DMs + groups) ─── */
  getConversationSummaries(username) {
    const all = this.getAllMessages();
    const summaries = {};

    for (const msg of all) {
      const isRelevant = msg.from === username || msg.to === username;
      if (!isRelevant) continue;

      let key;
      if (msg.type === 'group') {
        key = 'group:' + msg.to;
        if (!summaries[key]) {
          summaries[key] = {
            type: 'group',
            groupId: msg.to,
            partner: msg.to,
            lastContent: '',
            lastTimestamp: null,
            lastFromMe: false
          };
        }
        if (!summaries[key].lastTimestamp || new Date(msg.timestamp) > new Date(summaries[key].lastTimestamp)) {
          summaries[key].lastContent = msg.content;
          summaries[key].lastTimestamp = msg.timestamp;
          summaries[key].lastFromMe = msg.from === username;
        }
      } else {
        const partner = msg.from === username ? msg.to : msg.from;
        key = 'dm:' + partner;
        if (!summaries[key]) {
          summaries[key] = {
            type: 'dm',
            partner,
            lastContent: '',
            lastTimestamp: null,
            lastFromMe: false
          };
        }
        if (!summaries[key].lastTimestamp || new Date(msg.timestamp) > new Date(summaries[key].lastTimestamp)) {
          summaries[key].lastContent = msg.content;
          summaries[key].lastTimestamp = msg.timestamp;
          summaries[key].lastFromMe = msg.from === username;
        }
      }
    }

    // Include groups with no messages yet
    const userGroups = this.getUserGroups(username);
    for (const g of userGroups) {
      const key = 'group:' + g.id;
      if (!summaries[key]) {
        summaries[key] = {
          type: 'group',
          groupId: g.id,
          partner: g.id,
          lastContent: 'Group created',
          lastTimestamp: g.createdAt,
          lastFromMe: false
        };
      }
    }

    return Object.values(summaries).sort(
      (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
    );
  },

  /* ─── Format relative time ─── */
  formatTime(isoString) {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }
};
