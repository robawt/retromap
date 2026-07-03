# RetroMap -- Project Architecture Document

A Windows XP-styled social media platform with a top-down 2D sandbox world.

---

## 1. Project Overview

RetroMap is a single-page web application that combines a Windows XP aesthetic with social media functionality and a built-in top-down 2D sandbox world. Users can create profiles, share posts, chat in real-time, and explore a persistent world with building, pixel-art creation tools, and social sandbox mechanics -- all inside a recreated Windows XP desktop environment.

### Core Pillars

| Pillar | Description |
|--------|-------------|
| Windows XP Shell | Full desktop environment: taskbar, start menu, window management, drag-to-move, minimize/maximize/close |
| Social Media | Profiles, posts, likes, comments, friend system, real-time chat |
| Top-Down Sandbox World | Persistent 2D world with building, exploration, pixel-art creation tools, and sandbox mechanics |
| Asset Pipeline | Pixel art sprites, logos, and UI assets |

---

## 2. Tech Stack

### Frontend Core

| Technology | Purpose |
|------------|---------|
| HTML5 / CSS3 | Structure and styling |
| JavaScript (ES6+) | Application logic, window management, dynamic UI |
| Phaser.js 3 | 2D game engine |
| WebSockets (Socket.IO) | Real-time chat and notifications |
| localStorage / IndexedDB | Client-side data persistence |

### Design System

| Tool | Purpose |
|------|---------|
| CSS custom properties with Windows XP theme | Visual fidelity to the original Luna theme |

---

## 3. Project Structure

```
retromap/
├── index.html                     # Main entry point
├── ARCHITECTURE.md                # This document
├── DESIGN.md                      # Design system documentation
│
├── assets/
│   ├── sprites/                   # Pixel art sprites (characters, objects, tiles)
│   ├── ui/
│   │   ├── icons/                 # Windows XP style icons
│   │   ├── logos/                 # Brand logos
│   │   └── backgrounds/           # Desktop backgrounds, game backgrounds
│   └── audio/
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
│   │   ├── profile/               # User profile and settings
│   │   ├── feed/                  # Social media feed
│   │   ├── chat/                  # Real-time messaging
│   │   ├── friends/               # Friends list / social graph
│   │   └── game/                  # 2D game launcher window
│   │
│   ├── components/                # Reusable UI components
│   │   ├── Button.js              # XP-styled buttons
│   │   ├── Input.js               # XP-styled input fields
│   │   ├── Dialog.js              # Modal dialogs
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
│   └── utils/                     # Utility functions
│       ├── helpers.js
│       ├── soundManager.js        # Windows XP sound effects
│       └── dateFormatter.js
│
└── styles/
    ├── main.css                   # Global styles
    ├── xp-theme.css               # Windows XP Luna theme (Blue, Silver, Olive)
    ├── components.css             # Component-specific styles
    └── apps/                      # Per-app styles
        ├── login.css
        ├── feed.css
        ├── chat.css
        ├── profile.css
        ├── friends.css
        └── game.css
```

---

## 4. Architecture and Component Design

### 4.1 Application Shell (Windows XP Desktop)

The entire app is a simulated Windows XP desktop environment:

```
+------------------------------------------------------------------+
|  Desktop Wallpaper                                                |
|                                                                   |
|   +----------+  +----------+                                      |
|   | My Posts |  |  Game    |      <- Desktop Icons                |
|   +----------+  +----------+                                      |
|                                                                   |
|   +----------------------------------------------------------+   |
|   | Feed App Window (draggable, resizable)                    |   |
|   | +------------------------------------------------------+ |   |
|   | | Post 1: "Just beat level 5!"                         | |   |
|   | | Post 2: "Anyone want to race?"                       | |   |
|   | +------------------------------------------------------+ |   |
|   +----------------------------------------------------------+   |
|                                                                   |
|   +-------------------------------------------------------------+ |
|   | Start | [Feed] [Game] [Chat] [Friends]        |    3:41 PM  | |
|   +-------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

**Key behaviors:**
- Windows can be dragged by their title bar
- Windows can be minimized (collapses to taskbar), maximized (full desktop), or closed
- The Start Menu provides access to all apps
- The Taskbar shows running apps and system tray (clock)
- Desktop icons launch applications with a double-click

### 4.2 Window Manager Pattern

```
WindowManager (singleton)
+-- createWindow(appId, config) -> Window instance
+-- closeWindow(windowId)
+-- minimizeWindow(windowId)
+-- maximizeWindow(windowId)
+-- focusWindow(windowId)
+-- getZIndex() -> next z-index value
+-- windows[] -> all open windows

Window (instance)
+-- element: DOM element (the window frame)
+-- titleBar: drag handle + title + controls
+-- contentArea: renders app content
+-- state: 'open' | 'minimized' | 'maximized' | 'closed'
+-- position: { x, y }
+-- size: { width, height }
+-- setPosition(x, y)
+-- setSize(w, h)
+-- render() -> updates DOM
```

### 4.3 Social App Pattern

Each social app (Feed, Profile, Chat, Friends) follows the same pattern:

```
SocialApp
+-- initialize(window) -> called when window opens
+-- render(container) -> renders content into window's content area
+-- update(data) -> responds to state changes
+-- destroy() -> cleanup when window closes
```

### 4.4 Phaser Game Integration -- Top-Down Sandbox World

The game lives inside a draggable window and simulates a persistent world.

```
GameApp (window wrapper)
+-- mountPhaser() -> creates Phaser.Game instance
+-- unmountPhaser() -> destroys Phaser game
|
+-- Phaser.Game
    +-- config: Phaser.Types.Core.GameConfig
    +-- scenes: [BootScene, WorldScene, CreationScene, InventoryScene, SocialScene]
    |
    +-- BootScene
    |   +-- preload() -> load all assets
    |   +-- create() -> transition to WorldScene
    |
    +-- WorldScene (core gameplay)
    |   +-- create() -> load world chunks, spawn player, NPCs
    |   +-- update() -> game loop (60fps)
    |   +-- Player entity (4-direction movement, WASD/arrow keys)
    |   +-- NPC entities (dialogue, give tasks, trade)
    |   +-- World objects (trees, buildings, furniture, decorations)
    |   +-- Tilemap rendered from top-down perspective
    |   +-- Camera follows player (smooth scrolling)
    |
    +-- CreationScene (pixel art editor)
    |   +-- Grid-based drawing canvas
    |   +-- Color palette picker
    |   +-- Object behavior definitions
    |   +-- Save creations to inventory / world
    |   +-- Undo/redo, mirror, rotate tools
    |
    +-- InventoryScene (overlay)
    |   +-- Toolbar (hotbar with 1-9 keybinds)
    |   +-- Inventory grid
    |   +-- Equipment slots
    |
    +-- SocialScene (nearby players overlay)
        +-- List of players in current area
        +-- View player profiles
        +-- Friend request / message shortcuts
        +-- Emote reactions
```

---

## 5. Design System: Windows XP Luna Theme

### 5.1 Color Palette

The classic Windows XP Luna theme in three variants:

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

### 5.3 Component Styling

**Window Frame:**
- 3D raised border (1px highlight top/left, 1px shadow bottom/right)
- Title bar with gradient (top color to bottom color)
- Title bar buttons: Minimize, Maximize, Close
- Close button colored red on hover

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

### 5.4 Sounds

| Action | Sound |
|--------|-------|
| Window open | windows-xp-open.wav |
| Window close | windows-xp-close.wav |
| Error | windows-xp-error.wav |
| Notification | windows-xp-notify.wav |
| Start menu | windows-xp-start.wav |
| Shutdown | windows-xp-shutdown.wav |

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
  gameScore: number | null,
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
Landing -> Login/Register -> Create Profile -> Desktop
```

### 7.2 Social Media

```
Desktop -> Double-click Feed icon -> Feed window opens
  +-- View posts (scrollable)
  +-- Like a post
  +-- Comment on a post
  +-- Create new post
  +-- Click user -> Open Profile window

Desktop -> Double-click Friends icon -> Friends window opens
  +-- View friends list
  +-- Search/add new friends
  +-- Accept/reject requests
  +-- Click friend -> Open chat window or profile

Desktop -> Double-click Chat icon -> Chat window opens
  +-- Select conversation from sidebar
  +-- Send/receive messages (real-time)
```

### 7.3 Gaming (Top-Down Sandbox World)

```
Desktop -> Double-click Retro World icon -> Game window opens
  +-- Phaser canvas renders inside window
  +-- World loads at last saved position
  +-- Explore the world with WASD/Arrow keys
  +-- Click objects to interact
  +-- Press B -> Enter building mode
  +-- Press C -> Open Creation Editor
  +-- Press I -> Open inventory
  +-- World auto-saves periodically
```

### 7.4 Social Sandbox Flows

```
Explore someone's world -> Like it -> Post to feed
  +-- Friends click the post -> Opens game window at that location

Creation Editor -> Draw an item -> Equip it -> Friends see your new look
  +-- Draw an object -> Place it in the world -> Friend picks it up
  +-- Screenshot your creation -> Post to feed

Build together -> Two players in same area -> Both can place objects
  +-- Chat in real-time via proximity chat
  +-- Trade items by dropping/picking up
  +-- Build a collaborative project
```

---

## 8. Implementation Phases

### Phase 1: Foundation
- [x] Project scaffolding, file structure
- [x] Windows XP CSS theme (colors, typography, 3D borders)
- [x] Window Manager: open, close, drag, minimize, maximize
- [x] Taskbar with Start menu
- [x] Desktop with clickable icons
- [x] Login / Registration app
- [x] User profile with bio, stats, and settings

### Phase 2: Social Features
- [ ] Social feed (posts, likes, comments)
- [ ] Friends system (add, accept, list)
- [ ] Notification system (XP-style toast balloons)

### Phase 3: Real-time Chat
- [ ] WebSocket server setup
- [ ] Chat app UI with conversation list
- [ ] Message sending and receiving
- [ ] Online/offline status indicators

### Phase 4: Top-Down Sandbox World
- [ ] Phaser.js project setup inside GameApp window
- [ ] BootScene: asset loading with progress bar
- [ ] WorldScene: tilemap rendering from top-down perspective
- [ ] Player entity: 4-direction movement
- [ ] World chunk system
- [ ] Building system
- [ ] Creation Editor
- [ ] Inventory and tools
- [ ] NPC system
- [ ] World persistence

### Phase 5: Assets and Polish
- [ ] Generate player sprites
- [ ] Generate tilesets and world objects
- [ ] Generate UI icons and branding
- [ ] Sound effects and background music
- [ ] Theme switcher
- [ ] Performance optimization

---

## 9. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Vanilla JS | Lightweight; direct DOM control for XP aesthetic |
| Game Engine | Phaser.js 3 | Best browser-based 2D game engine |
| State Management | Custom event-based service layer | Simple, no dependency overhead |
| Data Storage | localStorage + JSON | No backend needed for MVP |
| Real-time Chat | localStorage simulation -> Socket.IO | MVP can simulate chat; Socket.IO for later |
| World Persistence | localStorage -> IndexedDB | Serialized chunks; IndexedDB for larger worlds |
| CSS Approach | Vanilla CSS + custom properties | Theme switching via CSS variables |

---

## 10. Top-Down Sandbox World -- Detailed Architecture

### 10.1 Scene Flow

```
BootScene -> WorldScene (main persistent world)
                +-- CreationScene (opened on demand)
                +-- InventoryScene (opened on demand)
                +-- SocialScene (opened on demand)
```

All scenes layer over each other. The WorldScene always runs in the background while other scenes are modal overlays.

### 10.2 World System Architecture

```
World (infinite, chunk-based)
+-- ChunkManager
|   +-- Each chunk = 16x16 tiles
|   +-- Chunks load/unload based on player position
|   +-- Persistent chunks saved to localStorage
|   +-- Seed-based procedural generation for new chunks
|
+-- TileMap (top-down rendering)
|   +-- Layers: ground, objects, overlay
|   +-- Tile types: grass, dirt, sand, water, stone, path, farmland
|   +-- Auto-tiling: tiles blend based on neighbors
|   +-- Z-ordering: objects render sorted by Y position
|
+-- WorldObject Registry
    +-- Object types: decorative, solid, interactive, usable, wearable
    +-- Player-placed objects stored in object layer
```

### 10.3 Top-Down Movement and Controls

| Input | Action |
|-------|--------|
| W / Up Arrow | Move up |
| S / Down Arrow | Move down |
| A / Left Arrow | Move left |
| D / Right Arrow | Move right |
| Shift | Run |
| Left Click | Interact with object / use equipped tool |
| Right Click | Open object context menu |
| B | Enter/exit Build Mode |
| C | Open Creation Editor |
| I / Tab | Open Inventory |
| E | Pick up item / talk to NPC |
| 1-9 | Hotbar slot selection |
| Enter | Chat (opens text input) |

### 10.4 Creation Editor

```
CreationEditor
+-- Canvas: resizable grid (default 16x16, up to 64x64)
+-- Drawing tools: pencil, fill, line, rectangle, circle, eraser
+-- Color palette: 16-color preset palette + free color picker
+-- Behavior selector:
|   +-- Decorative -- purely visual
|   +-- Solid -- collision
|   +-- Usable -- click to trigger an action
|   +-- Wearable -- can be equipped
|   +-- Plantable -- grows over time
|   +-- Tool -- used in ToolSystem
+-- Undo/Redo stack
+-- Mirror and rotate tools
+-- Save to user's creation library
```

### 10.5 Building and Interaction System

```
BuildingSystem
+-- Build Mode (B key)
|   +-- Object palette: all owned items + saved creations
|   +-- Grid snap: objects align to tile grid while placing
|   +-- Placement preview (ghost object)
|   +-- Remove mode: click placed object to delete
|   +-- Rotate: scroll wheel or R key
|
+-- InteractionSystem
    +-- Click object -> execute its action
    +-- Equipped tool changes interaction behavior
    +-- NPC interaction -> open dialogue box
```

### 10.6 Inventory and Economy

```
InventorySystem
+-- Backpack slots (20-32 slots, expandable)
+-- Hotbar (8-10 slots, visible at bottom of screen)
+-- Equipment slots
+-- Item stacking (up to 99 per slot)
+-- Drag-and-drop organization
|
+-- ToolSystem
    +-- Each tool has: type, durability, power level
    +-- Tool usage reduces durability
    +-- Tools can be crafted from raw materials
```

### 10.7 Multiplayer

```
MultiplayerSync
+-- Real-time position sync
+-- Players in same chunk are visible to each other
+-- Proximity chat
+-- Object placement sync
+-- Friend teleport
+-- Co-build: multiple players can place/remove objects simultaneously
```

### 10.8 Visual Style

- Resolution: 320x240 pixel art resolution (scaled up 3-4x)
- Perspective: True top-down orthographic
- Tiles: 16x16 pixel tiles (grass, water, paths, buildings)
- Sprites: 16x24 pixel characters (4-direction frames: up, down, left, right)
- Objects: Placed on tile grid, rendered with Y-sorting for depth
- Color palette: Limited retro palette (16-32 colors)

---

## 11. Performance and Constraints

- Single-page application with no page reloads
- Offline-capable: core features work without internet (localStorage)
- Target < 5MB total (excluding generated assets)
- Phaser rendering uses WebGL with Canvas fallback
- Window limits: max 5-7 open windows before performance degrades

---

## 12. Future Enhancements

- Backend server (Node.js + Express + MongoDB)
- User authentication with hashed passwords
- Persistent leaderboard across sessions
- Multiple game worlds
- Customizable desktop themes
- Drag-and-drop file sharing between users
- Retro mini-games (Snake, Solitaire, Minesweeper)
- Day/night cycle with lighting effects
- Farming, crafting, and fishing systems
- Mining / caves underground layer
- Quests and achievements system
- Trading system between players
- Pets / companions
- Music player app (Winamp-style)
- PWA support (installable, offline-first)

---

> Document Status: v1.0
> This document serves as the source of truth for all architectural decisions.
