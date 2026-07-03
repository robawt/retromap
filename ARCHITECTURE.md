# RetroMap — Project Architecture Document

> A retro Windows XP-styled social media platform with a top-down 2D sandbox world (like Stardew Valley meets Manyland).

---

## 1. Project Overview

**RetroMap** is a single-page web application that combines a nostalgic Windows XP aesthetic with modern social media functionality, plus a built-in top-down 2D sandbox world. Users can create profiles, share posts, chat in real-time, and explore a persistent top-down world with building, pixel-art creation tools, and social sandbox mechanics — all inside a lovingly recreated Windows XP desktop environment.

### Core Pillars

| Pillar | Description |
|--------|-------------|
| **Windows XP Shell** | Full desktop environment: taskbar, start menu, window management, drag-to-move, minimize/maximize/close |
| **Social Media** | Profiles, posts, likes, comments, friend system, real-time chat |
| **Top-Down Sandbox World** | Persistent 2D top-down world with building, exploration, pixel-art creation tools, and social sandbox mechanics (Manyland-style) |
| **Asset Pipeline** | AI-generated pixel art sprites, logos, and UI assets |

---

## 2. Tech Stack

### Frontend Core

| Technology | Purpose |
|------------|---------|
| **HTML5 / CSS3** | Structure and retro styling (vanilla or minimal framework) |
| **JavaScript (ES6+)** | Application logic, window management, dynamic UI |
| **Phaser.js 3** | 2D game engine (official Phaser skills installed) |
| **WebSockets (Socket.IO)** | Real-time chat and notifications |
| **LocalStorage / IndexedDB** | Client-side data persistence |

### Asset Generation (via installed skills)

| Skill | Purpose |
|-------|---------|
| `omer-metin/skills-for-antigravity@pixel-art-sprites` | Generate pixel art character sprites, tiles, backgrounds |
| `op7418/logo-generator-skill@logo-generator` | Create retro Windows XP logo and branding |
| `nexu-io/open-design@fal-generate` | AI image generation for UI backgrounds and assets |

### Design System

| Tool | Purpose |
|------|---------|
| `ui-ux-pro-max` | Design system, color palettes, typography guidance |
| `redesign-existing-projects` | UI quality audit and polish |
| Custom CSS with Windows XP theme | Visual fidelity to the original Luna theme |

---

## 3. Project Structure

```
retromap/
├── index.html                     # Main entry point
├── ARCHITECTURE.md                # This document
├── DESIGN.md                      # Design system documentation
│
├── assets/                        # Auto-generated assets
│   ├── sprites/                   # Pixel art sprites (characters, objects, tiles)
│   │   ├── player/
│   │   ├── npcs/
│   │   ├── tiles/                 # Top-down tilesets (grass, water, paths, buildings)
│   │   ├── objects/               # Furniture, trees, resources, decorations
│   │   └── items/                 # Tools, collectibles, equipment
│   ├── ui/                        # UI elements
│   │   ├── icons/                 # Windows XP style icons
│   │   ├── logos/                 # Brand logos
│   │   └── backgrounds/           # Desktop backgrounds, game backgrounds
│   └── audio/                     # Sound effects and music
│       ├── sfx/                   # Click sounds, window sounds
│       └── music/                 # Background music tracks
│
├── src/
│   ├── main.js                    # Application entry point
│   │
│   ├── shell/                     # Windows XP desktop shell
│   │   ├── Desktop.js             # Desktop surface, icons, wallpaper
│   │   ├── Taskbar.js             # Bottom taskbar with clock, start button
│   │   ├── StartMenu.js           # Start menu with links
│   │   ├── WindowManager.js       # Window open/close/minimize/move/resize
│   │   └── Window.js              # Individual window component
│   │
│   ├── apps/                      # Applications (windows)
│   │   ├── login/                 # Login / Registration screen
│   │   │   ├── LoginApp.js
│   │   │   └── LoginApp.css
│   │   ├── profile/               # User profile & settings
│   │   │   ├── ProfileApp.js
│   │   │   └── ProfileApp.css
│   │   ├── feed/                  # Social media feed
│   │   │   ├── FeedApp.js
│   │   │   └── FeedApp.css
│   │   ├── chat/                  # Real-time messaging
│   │   │   ├── ChatApp.js
│   │   │   └── ChatApp.css
│   │   ├── friends/               # Friends list / social graph
│   │   │   ├── FriendsApp.js
│   │   │   └── FriendsApp.css
│   │   └── game/                  # 2D platformer
│   │       ├── GameApp.js         # Game launcher window
│   │       ├── GameApp.css
│   │       └── phaser/            # Phaser game code
│   │           ├── config.js      # Phaser game configuration
│   │           ├── scenes/
│   │           │   ├── BootScene.js
│   │           │   ├── MenuScene.js
│   │           │   ├── GameScene.js
│   │           │   ├── HUDScene.js
│   │           │   └── GameOverScene.js
│   │           ├── entities/
│   │           │   ├── Player.js
│   │           │   ├── Enemy.js
│   │           │   └── Collectible.js
│   │           ├── levels/
│   │           │   ├── LevelData.js
│   │           │   └── LevelManager.js
│   │           └── systems/
│   │               ├── Physics.js
│   │               ├── CollisionSystem.js
│   │               └── ScoreManager.js
│   │
│   ├── components/                # Reusable UI components
│   │   ├── Button.js              # XP-styled buttons
│   │   ├── Input.js               # XP-styled input fields
│   │   ├── Dialog.js              # Modal dialogs
│   │   ├── Scrollbar.js           # Custom retro scrollbar
│   │   ├── ProgressBar.js         # XP green progress bar
│   │   └── Tooltip.js             # Hover tooltips
│   │
│   ├── services/                  # Data and state management
│   │   ├── AuthService.js         # Authentication logic
│   │   ├── PostService.js         # Post CRUD operations
│   │   ├── FriendService.js       # Friend management
│   │   ├── ChatService.js         # Chat/WebSocket logic
│   │   ├── NotificationService.js # Toast notifications
│   │   └── StorageService.js      # LocalStorage / IndexedDB wrapper
│   │
│   ├── data/                      # Mock data and seed data
│   │   ├── users.js
│   │   ├── posts.js
│   │   └── friends.js
│   │
│   └── utils/                     # Utility functions
│       ├── helpers.js
│       ├── soundManager.js        # Windows XP sound effects
│       └── dateFormatter.js
│
├── styles/
│   ├── main.css                   # Global styles
│   ├── xp-theme.css               # Windows XP Luna theme (Blue, Silver, Olive)
│   ├── components.css             # Component-specific styles
│   └── apps/                      # Per-app styles
│       ├── login.css
│       ├── feed.css
│       ├── chat.css
│       ├── profile.css
│       ├── friends.css
│       └── game.css
│
└── design-system/                 # (Generated by ui-ux-pro-max --persist)
    ├── MASTER.md                  # Global design tokens
    └── pages/                     # Page-specific overrides
```

---

## 4. Architecture & Component Design

### 4.1 Application Shell (Windows XP Desktop)

The entire app is a simulated Windows XP desktop environment:

```
┌─────────────────────────────────────────────────────────┐
│  Desktop Wallpaper (Bliss or custom retro background)    │
│                                                          │
│   ┌──────────┐  ┌──────────┐                             │
│   │ My Posts │  │  Game    │    ← Desktop Icons           │
│   └──────────┘  └──────────┘                             │
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │ Feed App Window (drageable, resizable)            │   │
│   │ ┌──────────────────────────────────────────────┐ │   │
│   │ │ Post 1: "Just beat level 5!"                 │ │   │
│   │ │ Post 2: "Anyone want to race?"               │ │   │
│   │ └──────────────────────────────────────────────┘ │   │
│   └──────────────────────────────────────────────────┘   │
│                                                          │
│   ┌─────────────────────────────────────────────────────┐│
│   │ Start │ [Feed] [Game] [Chat] [Friends]  │ 🕐 3:41 PM││
│   └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Key behaviors:**
- Windows can be **dragged** by their title bar
- Windows can be **minimized** (collapses to taskbar), **maximized** (full desktop), or **closed**
- The **Start Menu** provides access to all apps
- The **Taskbar** shows running apps and system tray (clock)
- Desktop **icons** launch applications with a double-click

### 4.2 Window Manager Pattern

```
WindowManager (singleton)
├── createWindow(appId, config) → Window instance
├── closeWindow(windowId)
├── minimizeWindow(windowId)
├── maximizeWindow(windowId)
├── focusWindow(windowId)
├── getZIndex() → next z-index value
└── windows[] → all open windows

Window (instance)
├── element: DOM element (the window frame)
├── titleBar: drag handle + title + controls
├── contentArea: renders app content
├── state: 'open' | 'minimized' | 'maximized' | 'closed'
├── position: { x, y }
├── size: { width, height }
├── setPosition(x, y)
├── setSize(w, h)
└── render() → updates DOM
```

### 4.3 Social App Pattern

Each social "app" (Feed, Profile, Chat, Friends) follows the same pattern:

```
SocialApp
├── initialize(window) → called when window opens
├── render(container) → renders content into window's content area
├── update(data) → responds to state changes
└── destroy() → cleanup when window closes
```

### 4.4 Phaser Game Integration — Top-Down Sandbox World

The game lives inside a draggable window and simulates a persistent top-down world.

```
GameApp (window wrapper)
├── mountPhaser() → creates Phaser.Game instance
├── unmountPhaser() → destroys Phaser game
│
└── Phaser.Game
    ├── config: Phaser.Types.Core.GameConfig
    ├── scenes: [BootScene, WorldScene, CreationScene, InventoryScene, SocialScene]
    │
    ├── BootScene
    │   ├── preload() → load all assets
    │   └── create() → transition to WorldScene
    │
    ├── WorldScene (core gameplay — top-down)
    │   ├── create() → load world chunks, spawn player, NPCs
    │   ├── update() → game loop (60fps)
    │   ├── Player entity (4-direction movement, WASD / arrow keys)
    │   ├── NPC entities (dialogue, give tasks, trade)
    │   ├── World objects (trees, buildings, furniture, decorations)
    │   ├── Tilemap rendered from top-down perspective
    │   ├── Camera follows player (smooth scrolling)
    │   └── Real-time sync with other online players in same area
    │
    ├── CreationScene (Manyland-style pixel art editor)
    │   ├── Grid-based drawing canvas (16×16, 32×32 templates)
    │   ├── Color palette picker
    │   ├── Define object behavior (solid, decorative, usable, wearable)
    │   ├── Save creations to inventory / world
    │   ├── Import existing objects as templates
    │   └── Undo/redo, mirror, rotate tools
    │
    ├── InventoryScene (overlay)
    │   ├── Toolbar (hotbar with 1-9 keybinds)
    │   ├── Inventory grid (all items, organized by category)
    │   ├── Equipment slots (hat, tool, accessory)
    │   ├── Quick item info and stats
    │   └── Drag items to equip or use
    │
    └── SocialScene (nearby players overlay)
        ├── List of players in current area
        ├── View player profiles / avatars
        ├── Friend request / message shortcuts
        ├── Teleport to player (if allowed)
        └── Emote reactions
```

---

## 5. Design System: Windows XP Luna Theme

### 5.1 Color Palette

The classic Windows XP **Luna** theme in three variants:

| Token | Blue (Default) | Silver | Olive Green |
|-------|----------------|--------|-------------|
| `--xp-titlebar-top` | `#0A246A` | `#848484` | `#6B6B3C` |
| `--xp-titlebar-bottom` | `#3A6EA5` | `#AAAAAA` | `#8B8B5C` |
| `--xp-titlebar-text` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| `--xp-window-bg` | `#ECE9D8` | `#ECE9D8` | `#ECE9D8` |
| `--xp-button-face` | `#ECE9D8` | `#ECE9D8` | `#ECE9D8` |
| `--xp-button-highlight` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| `--xp-button-shadow` | `#ACA899` | `#ACA899` | `#ACA899` |
| `--xp-button-dark-shadow` | `#716F64` | `#716F64` | `#716F64` |
| `--xp-desktop-bg` | `#3A6EA5` | `#848484` | `#6B6B3C` |
| `--xp-start-bg` | `#3A6EA5` | `#848484` | `#8B8B5C` |
| `--xp-highlight` | `#316AC5` | `#316AC5` | `#316AC5` |
| `--xp-text` | `#000000` | `#000000` | `#000000` |
| `--xp-text-disabled` | `#ACA899` | `#ACA899` | `#ACA899` |

### 5.2 Typography

| Usage | Font | Size | Weight |
|-------|------|------|--------|
| Window title bar | Tahoma | 11px | Bold |
| Body text | Tahoma | 11px | Normal |
| Buttons | Tahoma | 11px | Normal |
| Start menu | Tahoma | 10px | Normal |
| Desktop icon labels | Tahoma | 11px | Normal |
| Headings | Tahoma | 14-18px | Bold |

> **Note:** Tahoma is the signature Windows XP font. We'll use it throughout for authenticity.

### 5.3 Component Styling

**Window Frame:**
- 3D raised border (1px highlight top/left, 1px shadow bottom/right)
- Title bar with gradient (top color → bottom color)
- Title bar buttons: Minimize `[_]`, Maximize `[□]`, Close `[X]`
- Close button colored red on hover (classic XP behavior)

**Buttons:**
- Classic XP 3D raised look
- States: normal, hover (slight highlight), pressed (sunken), disabled (grayed out)
- Default button has a darker border

**Input Fields:**
- Sunken 3D border
- White background
- Focus: dotted rectangle inside the field

**Scrollbars:**
- Custom scrollbars mimicking XP style
- 3D raised track and thumb

**Dialogs:**
- Centered modal with title bar
- Dimmed overlay behind modal
- OK / Cancel buttons

### 5.4 Sounds (optional enhancement)

| Action | Sound |
|--------|-------|
| Window open | `windows-xp-open.wav` |
| Window close | `windows-xp-close.wav` |
| Error | `windows-xp-error.wav` |
| Notification | `windows-xp-notify.wav` |
| Start menu | `windows-xp-start.wav` |
| Shutdown | `windows-xp-shutdown.wav` |

---

## 6. Data Model

### 6.1 User

```javascript
{
  id: string (uuid),
  username: string,
  displayName: string,
  avatar: string (pixel art sprite URL),
  bio: string,
  joinDate: ISO date string,
  status: 'online' | 'offline' | 'away' | 'playing',
  gameStats: {
    highScore: number,
    coinsCollected: number,
    levelsCompleted: number,
    totalPlayTime: number (seconds)
  },
  friends: string[] (user IDs),
  friendRequests: {
    incoming: string[],
    outgoing: string[]
  },
  settings: {
    theme: 'blue' | 'silver' | 'olive',
    soundsEnabled: boolean
  }
}
```

### 6.2 Post

```javascript
{
  id: string (uuid),
  authorId: string,
  content: string,
  media: {
    type: 'screenshot' | 'none',
    url: string | null
  },
  likes: string[] (user IDs),
  comments: Comment[],
  gameScore: number | null,  // If sharing a game score
  timestamp: ISO date string
}
```

### 6.3 Comment

```javascript
{
  id: string (uuid),
  authorId: string,
  content: string,
  timestamp: ISO date string
}
```

### 6.4 Message (Chat)

```javascript
{
  id: string (uuid),
  from: string (user ID),
  to: string (user ID),
  content: string,
  timestamp: ISO date string,
  read: boolean
}
```

### 6.5 Game Leaderboard Entry

```javascript
{
  userId: string,
  username: string,
  score: number,
  coins: number,
  level: number,
  timestamp: ISO date string
}
```

---

## 7. User Flows

### 7.1 Onboarding

```
Landing → Login/Register → Create Profile → Desktop (tutorial tooltip)
```

### 7.2 Social Media

```
Desktop → Double-click "Feed" icon → Feed window opens
  ├── View posts (scrollable)
  ├── Like a post (click thumbs-up)
  ├── Comment on a post
  ├── Create new post (click "Write Post" button)
  └── Click user → Open Profile window

Desktop → Double-click "Friends" icon → Friends window opens
  ├── View friends list
  ├── Search/add new friends
  ├── Accept/reject requests
  └── Click friend → Open chat window or profile

Desktop → Double-click "Chat" icon → Chat window opens
  ├── Select conversation from sidebar
  ├── Send/receive messages (real-time)
  └── Emoticons / retro stickers
```

### 7.3 Gaming (Top-Down Sandbox World)

```
Desktop → Double-click "Retro World" icon → Game window opens
  ├── Phaser canvas renders inside window
  ├── World loads at your last saved position
  ├── Explore the top-down world with WASD/Arrow keys
  ├── Click objects to interact (chop tree, pick fruit, open chest)
  ├── Press B → Open building mode → Place/remove objects
  ├── Press C → Open Creation Editor → Draw new pixel art objects
  ├── Press I → Open inventory → Equip tools, view items
  ├── See other players nearby → Chat, trade, build together
  ├── Build a house, decorate it, invite friends
  └── World auto-saves periodically
```

### 7.4 Social Sandbox Flows

```
Explore someone's world → Like it → Post to feed
  ├── "Check out my new treehouse! I built it in Retro World 🌲"
  └── Friends click the post → Opens game window at that location

Creation Editor → Draw a hat → Equip it → Friends see your new look
  ├── Draw a sword → Place it in the world → Friend picks it up
  └── Screenshot your creation → Post to feed

Build together → Two players in same area → Both can place objects
  ├── Chat in real-time via proximity chat
  ├── Trade items by dropping/picking up
  └── Build a collaborative project (town, maze, art gallery)
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Project scaffolding, file structure, build setup
- [ ] Windows XP CSS theme (colors, typography, 3D borders)
- [ ] Window Manager: open, close, drag, minimize, maximize
- [ ] Taskbar with Start menu
- [ ] Desktop with clickable icons
- [ ] Login / Registration app

### Phase 2: Social Features (Week 2)
- [ ] User profiles (view, edit)
- [ ] Social feed (create posts, like, comment)
- [ ] Friends system (add, accept, list)
- [ ] Client-side data storage (LocalStorage/IndexedDB)
- [ ] Notification system (XP-style toast balloons)

### Phase 3: Real-time Chat (Week 3)
- [ ] WebSocket server setup (or simulated with LocalStorage)
- [ ] Chat app UI with conversation list
- [ ] Message sending and receiving
- [ ] Online/offline status indicators
- [ ] Typing indicators

### Phase 4: Top-Down Sandbox World (Week 3-5)
- [ ] Phaser.js project setup inside GameApp window
- [ ] BootScene: asset loading with progress bar
- [ ] WorldScene: tilemap rendering from top-down perspective
- [ ] Player entity: 4-direction movement (WASD/arrows), animations
- [ ] World chunk system: infinite procedurally-generated world
- [ ] WorldObject system: placeable trees, buildings, decorations
- [ ] BuildingSystem: click-to-place, click-to-remove objects
- [ ] InteractionSystem: click objects for actions (chop, pick, open)
- [ ] CreationEditor: Manyland-style pixel art drawing canvas
- [ ] Object behavior definitions (solid, decorative, usable, wearable)
- [ ] InventorySystem: collect, store, equip items
- [ ] ToolSystem: tools with different behaviors (axe, pickaxe, hoe)
- [ ] NPC system: dialogue, quests, trading
- [ ] World persistence: save/load world state to LocalStorage
- [ ] SocialScene: see nearby players, profiles, emotes
- [ ] MultiplayerSync: real-time state sync for co-op building

### Phase 5: Pixel Art Assets (Throughout)
- [ ] Generate player sprites (4-direction idle, walk, tool-use animations)
- [ ] Generate NPC sprites (various characters, 4-direction)
- [ ] Generate top-down tileset (grass, dirt, water, sand, stone, path, crops)
- [ ] Generate world objects (trees, bushes, rocks, flowers, fences, furniture)
- [ ] Generate tool sprites (axe, pickaxe, watering can, hoe, fishing rod)
- [ ] Generate UI icons (Windows XP style)
- [ ] Generate desktop wallpapers
- [ ] Generate app logos and branding
- [ ] Generate avatar customization system (wearable items)

### Phase 6: Polish & Integration (Week 5)
- [ ] Game score sharing to social feed
- [ ] Sound effects and background music
- [ ] Theme switcher (Blue / Silver / Olive)
- [ ] Responsive considerations
- [ ] Performance optimization
- [ ] UI polish pass (using redesign skill)

---

## 9. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Vanilla JS (no React) | Keeps it lightweight; Windows XP aesthetic pairs better with direct DOM control |
| **Game Engine** | Phaser.js 3 | Best browser-based 2D game engine; official skills installed |
| **State Management** | Custom event-based service layer | Simple, no dependency overhead |
| **Data Storage** | LocalStorage + JSON | No backend needed for MVP; easy to upgrade to a real DB later |
| **Real-time Chat** | LocalStorage simulation → Socket.IO | MVP can simulate chat; Socket.IO for true real-time later |
| **World Persistence** | LocalStorage → IndexedDB | Each saved chunk serialized as JSON; IndexedDB for larger worlds |
| **Multiplayer** | BroadcastChannel API → Socket.IO | Co-located players sync via BroadcastChannel; Socket.IO for true multi-device |
| **Creation Editor** | Custom Phaser scene with offscreen canvas | Full pixel art drawing tools rendered inside the game window |
| **Asset Generation** | AI pixel art skills | Skills can generate consistent pixel art for sprites, tiles, UI |
| **Window Manager** | Custom implementation | Full control over XP behavior; lightweight |
| **CSS Approach** | Vanilla CSS + CSS custom properties | Theme switching via CSS variables; no framework lock-in |

---

## 10. Top-Down Sandbox World — Detailed Architecture

### 10.1 Scene Flow

```
BootScene → WorldScene (main persistent world)
                ├── CreationScene (opened on demand via hotkey)
                ├── InventoryScene (opened on demand via hotkey)
                └── SocialScene (opened on demand via hotkey)
```

All scenes layer over each other. The WorldScene always runs in the background while other scenes are modal overlays.

### 10.2 World System Architecture

```
World (infinite, chunk-based)
├── ChunkManager
│   ├── Each chunk = 16×16 tiles
│   ├── Chunks load/unload based on player position
│   ├── Persistent chunks saved to LocalStorage
│   └── Seed-based procedural generation for new chunks
│
├── TileMap (top-down rendering)
│   ├── Layers: ground, objects, overlay (roofs/trees)
│   ├── Tile types: grass, dirt, sand, water, stone, path, farmland
│   ├── Auto-tiling: tiles blend based on neighbors
│   └── Z-ordering: objects render sorted by Y position (fake depth)
│
└── WorldObject Registry
    ├── Each object has: id, type, position, properties
    ├── Object types: decorative, solid, interactive, usable, wearable
    ├── Player-placed objects stored in object layer
    └── Server-authoritative object positions (for multiplayer)
```

### 10.3 Top-Down Movement & Controls

| Input | Action |
|-------|--------|
| **W / Up Arrow** | Move up |
| **S / Down Arrow** | Move down |
| **A / Left Arrow** | Move left |
| **D / Right Arrow** | Move right |
| **Shift** | Run (faster movement) |
| **Left Click** | Interact with object / use equipped tool |
| **Right Click** | Open object context menu (pick up, examine) |
| **B** | Enter/exit Build Mode (place/remove objects) |
| **C** | Open Creation Editor (draw pixel art) |
| **I / Tab** | Open Inventory |
| **E** | Pick up item / talk to NPC |
| **1-9** | Hotbar slot selection |
| **Enter** | Chat (opens text input) |

### 10.4 Creation Editor (Manyland-Style)

```
CreationEditor
├── Canvas: resizable grid (default 16×16, up to 64×64)
├── Drawing tools: pencil, fill, line, rectangle, circle, eraser
├── Color palette: 16-color preset palette + free color picker
├── Behavior selector:
│   ├── Decorative — purely visual
│   ├── Solid — collision, can't walk through
│   ├── Usable — click to trigger an action
│   ├── Wearable — can be equipped by player avatar
│   ├── Plantable — grows over time (farming)
│   └── Tool — used in ToolSystem
├── Undo/Redo stack
├── Mirror (horizontal/vertical) and rotate tools
├── Import: load existing object as template to edit
├── Export: share creations as data string with friends
└── Save: stored in user's creation library & placed in world
```

### 10.5 Building & Interaction System

```
BuildingSystem
├── Build Mode (B key)
│   ├── Object palette: all owned items + saved creations
│   ├── Grid snap: objects align to tile grid while placing
│   ├── Placement preview (ghost object, green = valid, red = blocked)
│   ├── Remove mode: click placed object to delete (return to inventory)
│   ├── Rotate: scroll wheel or R key to rotate object
│   └── Confirm/cancel placement
│
└── InteractionSystem
    ├── Click object → execute its action (chop tree → get wood)
    ├── Equipped tool changes interaction behavior
    │   ├── Axe → chop trees/wood
    │   ├── Pickaxe → mine rocks/stone
    │   ├── Watering can → water crops
    │   ├── Hoe → till soil for planting
    │   └── Fishing rod → fish in water tiles
    └── NPC interaction → open dialogue box with options
```

### 10.6 Inventory & Economy

```
InventorySystem
├── Backpack slots (20-32 slots, expandable)
├── Hotbar (8-10 slots, visible at bottom of screen)
├── Equipment slots (hat, accessory, tool, shoes)
├── Item stacking (up to 99 per slot)
├── Drag-and-drop organization
├── Drop item (removes from inventory, spawns in world)
│
└── ToolSystem
    ├── Each tool has: type, durability, power level
    ├── Tool usage reduces durability
    ├── Tools can be crafted from raw materials
    └── Higher-tier tools: faster, longer lasting, unlock new resources
```

### 10.7 Multiplayer (Manyland-Style Social Sandbox)

```
MultiplayerSync
├── Real-time position sync (WebSocket / simulated via BroadcastChannel)
├── Players in same chunk are visible to each other
├── Proximity chat: messages appear to nearby players only
├── Object placement sync: placed objects appear for all
├── Inventory is local (privacy), but trading can be done by dropping
├── Friend teleport: visit a friend's current location
├── Emote system: wave, dance, sit, point (animations visible to nearby)
└── Co-build: multiple players can place/remove objects simultaneously
```

### 10.8 Visual Style (Top-Down)

- **Resolution**: 320×240 pixel art resolution (scaled up 3-4x) — classic top-down RPG ratio
- **Perspective**: True top-down (45° angle orthographic), not isometric
- **Tiles**: 16×16 pixel tiles (grass, water, paths, buildings)
- **Sprites**: 16×24 pixel characters (4-direction frames: up, down, left, right)
- **Objects**: Placed on tile grid, rendered with Y-sorting for depth
- **Color palette**: Limited retro palette (16-32 colors) matching the XP aesthetic
- **Lighting**: Simple tile-based lighting (day/night cycle optional)
- **Parallax**: None needed — top-down view uses layered fog/distance effects instead

---

## 11. Performance & Constraints

- **Single-page application**: No page reloads; everything is windowed
- **Offline-capable**: Core features work without internet (LocalStorage)
- **Lightweight**: Target < 5MB total (excluding generated assets)
- **Phaser rendering**: Uses WebGL with Canvas fallback
- **Window limits**: Max 5-7 open windows before performance degrades (reasonable UX constraint)

---

## 12. Future Enhancements (Post-MVP)

- [ ] Backend server (Node.js + Express + MongoDB)
- [ ] User authentication (register/login with hashed passwords)
- [ ] Persistent leaderboard across sessions
- [ ] Multiple game levels / worlds
- [ ] Customizable desktop themes
- [ ] Drag-and-drop file sharing between users
- [ ] Retro mini-games (Snake, Solitaire, Minesweeper as bonus apps)
- [ ] Day/night cycle with lighting effects
- [ ] Farming system (plant, grow, harvest crops)
- [ ] Crafting system (combine resources to make items/tools)
- [ ] Fishing mini-game
- [ ] Mining / caves underground layer
- [ ] Quests and achievements system
- [ ] Trading system between players
- [ ] Pets / companions that follow the player
- [ ] Music player app (Winamp-style)
- [ ] PWA support (installable, offline-first)

---

> **Document Status**: v1.0 — Architecture & Planning Phase
>
> This document serves as the source of truth for all architectural decisions.
> Update as the project evolves.
