/* ═══════════════════════════════════════════════════════
   RetroMap — Social Feed App + Art Marketplace
   ═══════════════════════════════════════════════════════ */

const FeedApp = {
  title: 'Social',
  defaultWidth: 580,
  defaultHeight: 520,
  minWidth: 400,
  minHeight: 350,
  resizable: true,

  _container: null,
  _feedEl: null,
  _postForm: null,
  _tabBar: null,
  _marketEl: null,
  _currentTab: 'feed',

  /* ─── Render ─── */
  render(container) {
    this._container = container;
    container.className = 'feed-app-container';

    this._user = StorageService.getFullActiveUser();

    if (!this._user) {
      this._renderNotLoggedIn(container);
      return;
    }

    this._renderTabs(container);
    this._switchTab('feed');
  },

  /* ─── Not Logged In ─── */
  _renderNotLoggedIn(container) {
    container.innerHTML = `
      <div class="xp-loading" style="text-align:center;padding:40px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Not Signed In</div>
        <p>Sign in to view the feed and marketplace.</p>
      </div>
    `;
  },

  /* ─── Tab Bar ─── */
  _renderTabs(container) {
    container.innerHTML = '';
    this._tabBar = createElement('div', { className: 'feed-tabs' });

    const feedTab = createElement('button', {
      className: 'feed-tab active',
      textContent: 'Feed',
      'data-tab': 'feed'
    });
    feedTab.addEventListener('click', () => this._switchTab('feed'));
    this._tabBar.appendChild(feedTab);

    const marketTab = createElement('button', {
      className: 'feed-tab',
      textContent: 'Marketplace',
      'data-tab': 'market'
    });
    marketTab.addEventListener('click', () => this._switchTab('market'));
    this._tabBar.appendChild(marketTab);

    container.appendChild(this._tabBar);

    // Content containers
    this._feedContainer = createElement('div', { className: 'feed-content-area' });
    this._marketContainer = createElement('div', { className: 'feed-content-area', style: 'display:none' });
    container.appendChild(this._feedContainer);
    container.appendChild(this._marketContainer);
  },

  _switchTab(tab) {
    this._currentTab = tab;
    if (this._tabBar) {
      this._tabBar.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
      const activeTab = this._tabBar.querySelector('[data-tab="' + tab + '"]');
      if (activeTab) activeTab.classList.add('active');
    }

    if (tab === 'feed') {
      this._feedContainer.style.display = 'block';
      this._marketContainer.style.display = 'none';
      this._renderFeedOnly();
    } else {
      this._feedContainer.style.display = 'none';
      this._marketContainer.style.display = 'block';
      this._renderMarketplace();
    }
  },

  /* ═══════════════════════════════════════════════════
     FEED TAB
     ═══════════════════════════════════════════════════ */

  _renderFeedOnly() {
    this._feedContainer.innerHTML = '';
    this._postForm = this._buildPostForm();
    this._feedContainer.appendChild(this._postForm);

    this._feedEl = createElement('div', { className: 'feed-list' });
    this._feedContainer.appendChild(this._feedEl);
    this._renderAllPosts();
  },

  /* ─── Build New Post Form ─── */
  _buildPostForm() {
    const form = createElement('div', { className: 'feed-post-form' });
    const user = this._user;
    const inputRow = createElement('div', { className: 'feed-form-row' });

    const avatar = createElement('img', {
      className: 'feed-form-avatar',
      src: user.avatar || 'assets/ui/icons/profile.svg',
      alt: user.displayName,
      width: 32, height: 32,
      onerror: 'this.src="assets/ui/icons/profile.svg"'
    });
    inputRow.appendChild(avatar);

    this._postInput = createElement('textarea', {
      id: 'feed-post-input',
      name: 'feed-post',
      className: 'xp-input feed-form-input',
      placeholder: "What's on your mind?",
      rows: 2
    });
    inputRow.appendChild(this._postInput);
    form.appendChild(inputRow);

    // Image URL row
    const imgRow = createElement('div', { className: 'feed-form-row feed-form-img-row' });
    this._imageUrlInput = createElement('input', {
      id: 'feed-image-url',
      name: 'feed-image',
      className: 'xp-input feed-form-img-input',
      type: 'url',
      placeholder: 'Paste image URL... (optional)',
      autocomplete: 'off'
    });
    imgRow.appendChild(this._imageUrlInput);

    // Image preview
    this._imagePreview = createElement('div', { className: 'feed-form-img-preview hidden' });
    const previewImg = createElement('img', {
      className: 'feed-form-img-preview-img',
      alt: 'Image preview'
    });
    this._imagePreview.appendChild(previewImg);
    const removeImgBtn = createElement('button', {
      className: 'feed-form-img-remove', textContent: 'X'
    });
    removeImgBtn.addEventListener('click', () => {
      this._imageUrlInput.value = '';
      this._imagePreview.classList.add('hidden');
      this._imagePreview.querySelector('img').src = '';
      this._checkPostEnabled();
    });
    this._imagePreview.appendChild(removeImgBtn);
    imgRow.appendChild(this._imagePreview);
    form.appendChild(imgRow);

    // Preview image on URL input
    this._imageUrlInput.addEventListener('input', () => {
      const url = this._imageUrlInput.value.trim();
      if (url) {
        this._imagePreview.querySelector('img').src = url;
        this._imagePreview.classList.remove('hidden');
      } else {
        this._imagePreview.classList.add('hidden');
        this._imagePreview.querySelector('img').src = '';
      }
      this._checkPostEnabled();
    });

    const btnRow = createElement('div', { className: 'feed-form-actions' });
    this._postBtn = UIButton.create({
      label: 'Post', default: true,
      onClick: () => this._submitPost()
    });
    this._postBtn.disabled = true;
    btnRow.appendChild(this._postBtn);
    form.appendChild(btnRow);

    this._postInput.addEventListener('input', () => this._checkPostEnabled());
    this._postInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this._submitPost();
      }
    });
    return form;
  },

  _checkPostEnabled() {
    const hasContent = this._postInput.value.trim().length > 0;
    const hasImage = this._imageUrlInput.value.trim().length > 0;
    this._postBtn.disabled = !hasContent && !hasImage;
  },

  _submitPost() {
    const content = this._postInput.value.trim();
    const imageUrl = this._imageUrlInput.value.trim() || null;
    if (!content && !imageUrl) return;
    const post = PostService.createPost(this._user, content, imageUrl);
    if (post) {
      this._postInput.value = '';
      this._imageUrlInput.value = '';
      this._imagePreview.classList.add('hidden');
      this._imagePreview.querySelector('img').src = '';
      this._postBtn.disabled = true;
      this._renderAllPosts();
    }
  },

  _renderAllPosts() {
    const posts = PostService.getPosts();
    this._feedEl.innerHTML = '';
    if (posts.length === 0) {
      const empty = createElement('div', { className: 'feed-empty' });
      empty.appendChild(createElement('p', {
        textContent: 'No posts yet. Be the first to share something!'
      }));
      this._feedEl.appendChild(empty);
      return;
    }
    for (const post of posts) {
      this._feedEl.appendChild(this._renderPostCard(post));
    }
  },

  _renderPostCard(post) {
    const card = createElement('div', { className: 'feed-post-card' });
    const header = createElement('div', { className: 'feed-post-header' });

    const avatar = createElement('img', {
      className: 'feed-post-avatar clickable',
      src: post.authorAvatar || 'assets/ui/icons/profile.svg',
      alt: post.authorDisplayName, width: 16, height: 16,
      onerror: 'this.src="assets/ui/icons/profile.svg"',
      title: 'View profile'
    });
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showUserProfile(post.authorId, post.authorDisplayName);
    });
    header.appendChild(avatar);
    const authorInfo = createElement('div', { className: 'feed-post-author' });
    authorInfo.appendChild(createElement('span', {
      className: 'feed-post-name clickable',
      textContent: post.authorDisplayName,
      title: 'View profile'
    }));
    authorInfo.querySelector('span').addEventListener('click', (e) => {
      e.stopPropagation();
      this._showUserProfile(post.authorId, post.authorDisplayName);
    });
    header.appendChild(authorInfo);
    header.appendChild(createElement('span', {
      className: 'feed-post-time',
      textContent: PostService.formatRelativeTime(post.timestamp)
    }));

    if (this._user && post.authorId === this._user.username) {
      const delBtn = createElement('button', {
        className: 'feed-post-delete', textContent: 'X',
        title: 'Delete post', 'aria-label': 'Delete post'
      });
      delBtn.addEventListener('click', () => {
        PostService.deletePost(post.id, this._user.username);
        this._renderAllPosts();
      });
      header.appendChild(delBtn);
    }
    card.appendChild(header);

    // Image (if present)
    if (post.imageUrl) {
      const imgContainer = createElement('div', { className: 'feed-post-image-container' });
      const img = createElement('img', {
        className: 'feed-post-image',
        src: post.imageUrl,
        alt: 'Post image',
        loading: 'lazy'
      });
      // Handle load errors
      img.addEventListener('error', () => {
        imgContainer.appendChild(createElement('div', {
          className: 'feed-post-image-error',
          textContent: 'Image could not be loaded'
        }));
      });
      imgContainer.appendChild(img);
      card.appendChild(imgContainer);
    }

    const content = createElement('div', {
      className: 'feed-post-content', textContent: post.content
    });
    card.appendChild(content);

    const actions = createElement('div', { className: 'feed-post-actions' });
    const isLiked = this._user && post.likes.includes(this._user.username);
    const likeBtn = createElement('button', {
      className: 'feed-action-btn' + (isLiked ? ' liked' : ''),
      textContent: (isLiked ? '\u2665' : '\u2661') + ' ' + (post.likes.length > 0 ? post.likes.length : 'Like')
    });
    likeBtn.addEventListener('click', () => {
      if (!this._user) return;
      PostService.toggleLike(post.id, this._user.username);
      dispatchEvent('post-liked', { by: this._user.username, postAuthor: post.authorId });
      this._renderAllPosts();
    });
    actions.appendChild(likeBtn);

    const commentBtn = createElement('button', {
      className: 'feed-action-btn',
      textContent: '\u2709 ' + (post.comments.length || 'Comment')
    });
    commentBtn.addEventListener('click', () => this._toggleComments(post.id, card));
    actions.appendChild(commentBtn);
    card.appendChild(actions);

    const commentsSection = createElement('div', {
      className: 'feed-comments-section hidden', 'data-post-id': post.id
    });
    const commentsList = createElement('div', { className: 'feed-comments-list' });
    for (const comment of post.comments) {
      commentsList.appendChild(this._renderComment(comment));
    }
    commentsSection.appendChild(commentsList);

    const commentForm = createElement('div', { className: 'feed-comment-form' });
    const commentInput = createElement('input', {
      id: 'feed-comment-input-' + post.id.slice(0, 8),
      name: 'feed-comment', className: 'xp-input feed-comment-input',
      type: 'text', placeholder: 'Write a comment...', autocomplete: 'off'
    });
    const commentSubmit = UIButton.create({
      label: 'Post',
      onClick: () => {
        const text = commentInput.value.trim();
        if (!text || !this._user) return;
        PostService.addComment(post.id, this._user, text);
        dispatchEvent('comment-added', { by: this._user.username, postAuthor: post.authorId });
        this._renderAllPosts();
      }
    });
    commentForm.appendChild(commentInput);
    commentForm.appendChild(commentSubmit);
    commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commentSubmit.click(); }
    });
    commentsSection.appendChild(commentForm);
    card.appendChild(commentsSection);
    return card;
  },

  _renderComment(comment) {
    const el = createElement('div', { className: 'feed-comment' });
    const avatar = createElement('img', {
      className: 'feed-comment-avatar',
      src: comment.authorAvatar || 'assets/ui/icons/profile.svg',
      alt: comment.authorDisplayName, width: 14, height: 14,
      onerror: 'this.src="assets/ui/icons/profile.svg"'
    });
    el.appendChild(avatar);
    const body = createElement('div', { className: 'feed-comment-body' });
    body.appendChild(createElement('span', {
      className: 'feed-comment-author', textContent: comment.authorDisplayName
    }));
    body.appendChild(document.createTextNode(' ' + comment.content));
    el.appendChild(body);
    return el;
  },

  _toggleComments(postId, card) {
    const section = card.querySelector('.feed-comments-section');
    if (section) {
      section.classList.toggle('hidden');
      if (!section.classList.contains('hidden')) {
        const input = section.querySelector('.feed-comment-input');
        if (input) setTimeout(() => input.focus(), 50);
      }
    }
  },

  /* ═══════════════════════════════════════════════════
     MARKETPLACE TAB
     ═══════════════════════════════════════════════════ */

  _renderMarketplace() {
    this._marketContainer.innerHTML = '';
    const username = this._user ? this._user.username : null;

    const header = createElement('div', { className: 'market-header' });
    header.innerHTML = '<div class="market-title">Art Marketplace</div>' +
      '<div class="market-subtitle">Browse and buy art created by other players</div>';

    const coins = username ? EconomyService.getCoins(username) : 0;
    const coinDisplay = createElement('div', { className: 'market-coins' });
    coinDisplay.textContent = 'Your coins: ' + coins;
    header.appendChild(coinDisplay);
    this._marketContainer.appendChild(header);

    // My Listings section (if any)
    const myListings = username ? EconomyService.getMyListings(username) : [];
    if (myListings.length > 0) {
      const mySection = createElement('div', { className: 'market-my-listings' });
      mySection.appendChild(createElement('div', {
        className: 'market-section-title', textContent: 'My Listings (' + myListings.length + ')'
      }));

      for (const listing of myListings) {
        const card = this._renderListingCard(listing, true);
        mySection.appendChild(card);
      }
      this._marketContainer.appendChild(mySection);
    }

    // Browse all listings (filter out own)
    const allListings = EconomyService.getMarketListings()
      .filter(l => !username || l.sellerUsername !== username);
    const browseSection = createElement('div', { className: 'market-browse' });
    if (allListings.length === 0 && myListings.length === 0) {
      browseSection.appendChild(createElement('p', {
        className: 'market-empty',
        textContent: 'No art listed for sale yet. Create something in the Pixel Editor and list it!'
      }));
    } else if (allListings.length > 0) {
      browseSection.appendChild(createElement('div', {
        className: 'market-section-title',
        textContent: 'Available Art (' + allListings.length + ')'
      }));

      for (const listing of allListings) {
        const card = this._renderListingCard(listing, false);
        browseSection.appendChild(card);
      }
    }

    this._marketContainer.appendChild(browseSection);
  },

  _renderListingCard(listing, isOwn) {
    const card = createElement('div', { className: 'market-card' });
    if (isOwn) card.classList.add('market-card-own');

    // Preview
    const preview = createElement('div', { className: 'market-card-preview' });
    const dim = Math.max(listing.tilesW, listing.tilesH) * 16;
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = dim;
    previewCanvas.height = dim;
    previewCanvas.style.width = '64px';
    previewCanvas.style.height = '64px';
    previewCanvas.style.imageRendering = 'pixelated';
    const ctx = previewCanvas.getContext('2d');
    const data = listing.pixelData;
    const pxDim = Math.sqrt(data.length);
    const cellW = dim / pxDim;
    const cellH = dim / pxDim;
    for (let i = 0; i < data.length; i++) {
      const px = i % pxDim;
      const py = Math.floor(i / pxDim);
      ctx.fillStyle = data[i] || '#00000000';
      ctx.fillRect(px * cellW, py * cellH, cellW, cellH);
    }
    preview.appendChild(previewCanvas);
    card.appendChild(preview);

    // Info
    const info = createElement('div', { className: 'market-card-info' });
    info.appendChild(createElement('div', {
      className: 'market-card-name', textContent: listing.name
    }));
    info.appendChild(createElement('div', {
      className: 'market-card-artist',
      textContent: 'by ' + listing.sellerDisplayName
    }));
    const sizeInfo = EconomyService.CANVAS_SIZES.find(s => s.id === listing.sizeId);
    info.appendChild(createElement('div', {
      className: 'market-card-size',
      textContent: sizeInfo ? sizeInfo.label : (listing.tilesW + 'x' + listing.tilesH)
    }));
    card.appendChild(info);

    // Price + action
    const action = createElement('div', { className: 'market-card-action' });
    action.appendChild(createElement('div', {
      className: 'market-card-price',
      textContent: listing.price + ' coins'
    }));

    if (isOwn) {
      const unlistBtn = document.createElement('button');
      unlistBtn.className = 'xp-button';
      unlistBtn.textContent = 'Unlist';
      unlistBtn.addEventListener('click', () => {
        EconomyService.unlistFromMarket(listing.sellerUsername, listing.id);
        this._renderMarketplace();
      });
      action.appendChild(unlistBtn);
    } else if (this._user) {
      const coins = EconomyService.getCoins(this._user.username);
      const canBuy = coins >= listing.price;
      const buyBtn = document.createElement('button');
      buyBtn.className = 'xp-button' + (canBuy ? ' market-buy-btn' : ' market-buy-btn-disabled');
      buyBtn.textContent = canBuy ? 'Buy' : 'Not enough coins';
      buyBtn.disabled = !canBuy;
      buyBtn.addEventListener('click', () => {
        if (!canBuy) return;
        const result = EconomyService.buyFromMarket(this._user.username, listing.id);
        if (result.success) {
          this._renderMarketplace();
        }
      });
      action.appendChild(buyBtn);
    }

    card.appendChild(action);
    return card;
  },

  /* ─── Show user profile popover ─── */
  _showUserProfile(userId, displayName) {
    if (!this._user) return;

    const allUsers = StorageService.getUsers();
    const user = allUsers[userId];
    if (!user) return;

    const isSelf = userId === this._user.username;
    const avatarUrl = user.avatar || 'assets/ui/icons/profile.svg';
    const nameColorItem = EconomyService.findShopItem('nameColors', 'default');
    const nameColor = (user.customizations && user.customizations.nameColor)
      ? (EconomyService.findShopItem('nameColors', user.customizations.nameColor) || {}).color || '#FFFFFF'
      : '#FFFFFF';

    let html = '<div style="display:flex;flex-direction:column;gap:8px;padding:8px;min-width:220px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<img src="' + escapeHtml(avatarUrl) + '" alt="" style="width:40px;height:40px;image-rendering:pixelated;border:1px solid #ACA899;" onerror="this.src=\'assets/ui/icons/profile.svg\'" />';
    html += '<div><div style="font-weight:700;font-size:12px;color:' + nameColor + ';">' + escapeHtml(user.displayName || userId) + '</div>';
    html += '<div style="font-size:10px;color:#ACA899;">@' + escapeHtml(userId) + '</div>';
    html += '<div style="font-size:10px;color:#666;margin-top:2px;">' + escapeHtml(user.bio || 'No bio') + '</div></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:4px;justify-content:flex-end;border-top:1px solid #ACA899;padding-top:8px;">';
    if (!isSelf) {
      html += '<button class="xp-button" id="profile-chat-btn">Send Message</button>';
    }
    html += '<button class="xp-button" id="profile-close-btn" default>Close</button>';
    html += '</div></div>';

    UIDialog.show({
      title: 'User Profile',
      body: html,
      closeable: true,
      buttons: []
    });

    setTimeout(() => {
      const chatBtn = document.getElementById('profile-chat-btn');
      if (chatBtn) {
        chatBtn.addEventListener('click', () => {
          UIDialog.close();
          // Switch to Messages view in the social shell
          if (typeof SocialShell !== 'undefined') {
            SocialShell.switchView('messages');
          }
          setTimeout(() => {
            dispatchEvent('open-chat-conversation', { with: userId });
          }, 300);
        });
      }
      const closeBtn = document.getElementById('profile-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => UIDialog.close());
    }, 50);
  },

  /* ─── Cleanup ─── */
  destroy() {
    this._container = null;
    this._feedEl = null;
    this._postForm = null;
    this._user = null;
    this._feedContainer = null;
    this._marketContainer = null;
    this._tabBar = null;
  }
};
