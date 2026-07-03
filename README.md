# RetroMap

A Windows XP-styled single-page web application combining a retro desktop shell with social features and a top-down 2D sandbox world.

## Overview

RetroMap recreates the Windows XP desktop experience inside a browser, with user profiles, posts, chat, and a Stardew Valley / Manyland-inspired pixel-art sandbox world. Users can create profiles, share posts, chat with friends, explore a persistent world, build structures, and create pixel art — all within a Windows XP desktop environment.

### Core Pillars

- **Windows XP Shell** -- Full desktop with taskbar, start menu, draggable windows, minimize/maximize/close
- **Social Media** -- Profiles, posts, likes, comments, friend system, real-time chat
- **Top-Down Sandbox World** -- Persistent 2D world with building, exploration, pixel-art creation tools
- **Pixel Art Assets** -- Custom pixel-art icons, logos, and UI elements

## Features

### Windows XP Desktop Shell
- Luna theme with Blue, Silver, and Olive color schemes via CSS custom properties
- Window Manager supporting drag, resize, minimize, maximize, and close with XP-style title bar controls
- Taskbar with Start button, window items for open apps, system tray with live clock
- Start Menu with classic sidebar layout and application shortcuts
- Desktop icons with single-click select and double-click launch

### User Profile
- Account system with registration and login via localStorage
- Profile banner with avatar, display name, @username, and online status
- Editable bio with inline save/cancel
- Game stats display (high score, coins collected, items created, play time)
- Settings with theme switcher (Blue/Silver/Olive), sound toggle, and sign out

### Design System
- Windows XP Luna color tokens with full CSS custom property support
- 3D border effects (classic raised/sunken button and window styling)
- Tahoma typography throughout
- Custom XP-style 16px scrollbars with 3D thumb and buttons
- Hand-crafted SVG pixel art for all desktop icons and branding

### Coming Soon
- Social feed with posts, likes, and comments
- Real-time chat with friends
- Friends list with search and requests
- Top-down sandbox world (Phaser.js)
- Pixel art creation editor
- Building system with grid-snapping
- Inventory, tools, NPCs

## Screenshots

Screenshots coming soon.

| View | Description |
|------|-------------|
| Login Window | RetroMap login/register form over the XP desktop |
| Desktop | Full desktop with icons, taskbar, and Start menu |
| Profile App | User profile with banner, bio, stats, and settings |
| Start Menu | Classic sidebar start menu with app shortcuts |

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools or servers required -- just open the HTML file

### Running Locally

```bash
# Clone the repository
git clone https://github.com/robawt/retromap.git

# Navigate to the project
cd retromap

# Open in browser (choose one):
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

No web server, npm install, or build step required. Everything runs directly in the browser using localStorage for data persistence.

### Deployment

This project is a static site and can be deployed to any static hosting service:

- **GitHub Pages** -- Push to a `gh-pages` branch or configure from the repo Settings > Pages
- **Netlify** -- Drag the project folder to [netlify.com](https://netlify.com) or connect your Git repo
- **Vercel** -- Import the project from your Git repository at [vercel.com](https://vercel.com)

No build step needed for any of these -- just point to `index.html`.

## Architecture

### Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 / CSS3 | Structure and styling (vanilla, no frameworks) |
| JavaScript (ES6+) | Application logic, window management, dynamic UI |
| Phaser.js 3 (planned) | 2D sandbox game engine |
| localStorage | Client-side data persistence |

### Project Structure

```
retromap/
├── index.html                  # Main entry point
├── ARCHITECTURE.md             # Architecture documentation
├── DESIGN.md                   # Design system documentation
├── README.md                   # This file
│
├── assets/
│   └── ui/
│       ├── icons/              # SVG pixel-art icons (8 files)
│       └── logos/              # RetroMap brand logo
│
├── src/
│   ├── main.js                 # Application entry point and app registry
│   ├── shell/                  # Windows XP desktop shell
│   │   ├── WindowManager.js    # Window lifecycle and z-index management
│   │   ├── Window.js           # Draggable window with XP chrome
│   │   ├── Desktop.js          # Desktop icons and wallpaper
│   │   ├── Taskbar.js          # Bottom taskbar with clock
│   │   └── StartMenu.js        # Classic start menu
│   ├── apps/                   # Applications
│   │   ├── login/              # Login and registration
│   │   └── profile/            # User profile and settings
│   ├── components/             # Reusable UI components
│   │   ├── Button.js           # XP 3D buttons
│   │   ├── Input.js            # XP sunken input fields
│   │   ├── Dialog.js           # Modal dialogs (alert/confirm/prompt)
│   │   └── ProgressBar.js      # Animated XP progress bar
│   ├── services/
│   │   └── StorageService.js   # Centralized localStorage access
│   └── utils/
│       ├── helpers.js          # DOM helpers, ID generation, events
│       ├── dateFormatter.js    # Clock and relative time formatting
│       └── soundManager.js     # Audio playback for XP sounds
│
├── styles/
│   ├── xp-theme.css            # Theme variables (Blue/Silver/Olive)
│   ├── main.css                # Desktop, taskbar, start menu layout
│   ├── components.css          # Window, button, input, dialog styles
│   └── apps/
│       ├── login.css           # Login form styles
│       └── profile.css         # Profile page styles
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Vanilla JS | Lightweight; XP aesthetic pairs better with direct DOM control |
| Game Engine | Phaser.js 3 (planned) | Best browser-based 2D engine for the sandbox world |
| Data Storage | localStorage | No backend needed for MVP; easy to upgrade later |
| CSS Approach | CSS custom properties | Theme switching via variables; no framework lock-in |

## Roadmap

### Phase 1 -- Foundation (Complete)
- Project scaffolding and file structure
- Windows XP CSS theme (Blue/Silver/Olive)
- Window Manager: open, close, drag, minimize, maximize
- Taskbar with Start menu and clock
- Desktop with clickable pixel-art icons
- Login and Registration app
- User profile with bio editing, stats, and settings

### Phase 2 -- Social Features (In Progress)
- Social feed (create posts, like, comment)
- Friends system (add, accept, list)
- Notification system (XP-style toast balloons)
- Post sharing from game

### Phase 3 -- Real-time Chat
- Chat app with conversation list
- Message sending and receiving
- Online/offline status indicators

### Phase 4 -- Top-Down Sandbox World
- Phaser.js game engine setup
- Top-down tilemap rendering
- 4-direction player movement
- World chunk system
- Building system
- Pixel art creation editor
- Inventory and tools
- NPCs and interactions

### Phase 5 -- Assets and Polish
- Pixel art sprites generation
- Sound effects and music
- Performance optimization
- PWA support

## Built With

- Vanilla JavaScript -- no frameworks, no dependencies
- CSS Custom Properties -- theme switching and design tokens
- SVG -- pixel-art icons and logos
- localStorage -- client-side data persistence
- Phaser.js 3 (planned) -- 2D sandbox game engine

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** -- Full system architecture, data models, and implementation plan
- **[DESIGN.md](DESIGN.md)** -- Design system with colors, typography, components, and accessibility
