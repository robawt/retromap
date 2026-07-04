/* ═══════════════════════════════════════════════════════
   RetroMap — Post Service
   ═══════════════════════════════════════════════════════ */

const PostService = {
  STORAGE_KEY: 'retromap-posts',

  /* ─── Get all posts ─── */
  getPosts() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  /* ─── Save all posts ─── */
  savePosts(posts) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
  },

  /* ─── Create a new post ─── */
  createPost(author, content, imageUrl) {
    if (!content || !content.trim()) return content ? null : null;
    if (!content.trim() && !imageUrl) return null;

    const posts = this.getPosts();
    const post = {
      id: generateId(),
      authorId: author.username,
      authorDisplayName: author.displayName,
      authorAvatar: author.avatar || 'assets/ui/icons/profile.svg',
      content: content.trim(),
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: []
    };

    posts.unshift(post);
    this.savePosts(posts);
    return post;
  },

  /* ─── Toggle like on a post ─── */
  toggleLike(postId, username) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    const idx = post.likes.indexOf(username);
    if (idx === -1) {
      post.likes.push(username);
    } else {
      post.likes.splice(idx, 1);
    }

    this.savePosts(posts);
    return post;
  },

  /* ─── Add a comment to a post ─── */
  addComment(postId, author, content) {
    if (!content || !content.trim()) return null;

    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    const comment = {
      id: generateId(),
      authorId: author.username,
      authorDisplayName: author.displayName,
      authorAvatar: author.avatar || 'assets/ui/icons/profile.svg',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    post.comments.push(comment);
    this.savePosts(posts);
    return comment;
  },

  /* ─── Delete a post ─── */
  deletePost(postId, username) {
    const posts = this.getPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) return false;
    if (posts[idx].authorId !== username) return false;

    posts.splice(idx, 1);
    this.savePosts(posts);
    return true;
  },

  /* ─── Format relative time ─── */
  formatRelativeTime(isoString) {
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
    return formatDate(date);
  }
};
