/* ═══════════════════════════════════════════════════════
   RetroMap — Tutorial Guide
   First-login tutorial explaining flowers, coins, plots, art
   ═══════════════════════════════════════════════════════ */

const TutorialGuide = {
  /* ─── Tutorial pages ─── */
  PAGES: [
    {
      icon: '🌿',
      title: 'Welcome to RetroMap!',
      body: "Hi there! I'm your guide to the world of RetroMap.\n\n" +
            "This is a creative social hub where you can explore, " +
            "collect flowers, earn coins, and create pixel art!\n\n" +
            "Let me show you around in a few quick steps."
    },
    {
      icon: '🌸',
      title: 'Collecting Flowers',
      body: "Flowers grow all over the world — in the Sunflower Fields, " +
            "near the Lily Pond, and hidden in the Whispering Woods.\n\n" +
            "Walk up to a flower and press E to pick it. Rarer flowers " +
            "are worth more coins when sold to Flora!\n\n" +
            "🌸 Common → 🌺 Uncommon → 🌷 Rare → 🌟 Epic → 💫 Legendary"
    },
    {
      icon: '💰',
      title: 'Earning Coins',
      body: "Coins are the currency of RetroMap. Here's how you earn them:\n\n" +
            "• Sell flowers to Flora (the botanist NPC)\n" +
            "• Get likes on your posts (+1 coin each)\n" +
            "• Get comments on your posts (+2 coins each)\n\n" +
            "Check your coin balance in the game HUD or buy things from Flora's shop!"
    },
    {
      icon: '🏠',
      title: 'Owning Land',
      body: "Want to leave your mark on the world? Buy plot tiles from Flora's Art Supplies shop!\n\n" +
            "Each plot tile costs 50 coins. Here's how it works:\n" +
            "1. Buy plot tokens from Flora\n" +
            "2. Press B to enter Build Mode in the game world\n" +
            "3. Walk to an unclaimed grass tile (highlighted in yellow)\n" +
            "4. Press E to claim it as your own!\n\n" +
            "Owned plots are highlighted in green."
    },
    {
      icon: '🎨',
      title: 'Creating & Placing Art',
      body: "This is where the real fun begins!\n\n" +
            "1. Buy a canvas from Flora's shop (various sizes available)\n" +
            "2. Open the Pixel Editor from Flora's shop\n" +
            "3. Paint your masterpiece with the 16-color palette\n" +
            "4. Press Save to keep your work\n\n" +
            "Then in the game world:\n" +
            "5. Press B for Build Mode, walk to your plot\n" +
            "6. Press E to place your art on display!\n\n" +
            "Your art stays in the world for everyone to see."
    },
    {
      icon: '✨',
      title: "You're Ready!",
      body: "That covers the basics! Here's a quick recap:\n\n" +
            "🌸 Pick flowers everywhere → sell to Flora for coins\n" +
            "💰 Earn extra coins from likes & comments\n" +
            "🏠 Buy plots to claim your own piece of the world\n" +
            "🎨 Create pixel art and display it proudly\n\n" +
            "Talk to Flora anytime for shops and info.\n" +
            "Have fun exploring RetroMap!"
    }
  ],

  /* ─── Start the tutorial flow ─── */
  start(username) {
    if (!username) return;
    if (EconomyService.isTutorialCompleted(username)) return;

    this._currentPage = 0;
    this._username = username;
    this._showPage();
  },

  /* ─── Show current page ─── */
  _showPage() {
    if (this._currentPage >= this.PAGES.length) {
      // Tutorial complete
      UIDialog.close();
      EconomyService.markTutorialCompleted(this._username);
      this._username = null;
      return;
    }

    const page = this.PAGES[this._currentPage];
    const isLast = this._currentPage === this.PAGES.length - 1;
    const isFirst = this._currentPage === 0;

    const buttons = [];

    if (!isFirst) {
      buttons.push({
        label: 'Back',
        onClick: () => {
          this._currentPage--;
          this._showPage();
        }
      });
    }

    buttons.push({
      label: isLast ? "Let's Go!" : 'Next',
      default: true,
      onClick: () => {
        this._currentPage++;
        this._showPage();
      }
    });

    // Build content with icon
    const content = page.icon + '  ' + page.body;

    UIDialog.show({
      title: page.title,
      content: content,
      buttons: buttons,
      closeable: false // Can't close early — must complete tutorial
    });
  }
};
