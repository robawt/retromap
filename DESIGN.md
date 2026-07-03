# RetroMap — Design System

> A retro Windows XP-styled social media platform with a top-down 2D sandbox world.
>
> Generated via **ui-ux-pro-max** design intelligence.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Style & Aesthetic](#2-visual-style--aesthetic)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Layout & Spacing](#5-layout--spacing)
6. [Component Library](#6-component-library)
7. [Iconography](#7-iconography)
8. [Animation & Interaction](#8-animation--interaction)
9. [Windows XP Shell Tokens](#9-windows-xp-shell-tokens)
10. [Top-Down Sandbox World Design](#10-top-down-sandbox-world-design)
11. [Design Anti-Patterns](#11-design-anti-patterns)
12. [Accessibility Considerations](#12-accessibility-considerations)

---

## 1. Design Philosophy

**RetroMap** blends two distinct but complementary aesthetics:

| Layer | Aesthetic | Source |
|-------|-----------|--------|
| **Shell (Desktop)** | Windows XP Luna (2001) | Blue, Silver, Olive themes |
| **Game (World)** | 16-bit pixel art (SNES era) | Stardew Valley / Zelda: A Link to the Past |
| **Social (Apps)** | XP-styled windows hosting modern content | Feeds, profiles, chat inside classic frames |
| **Branding** | Retro-futuristic pixel art with XP flair | Logo, badges, taskbar icons |

The core principle: **familiar nostalgia**. Users should feel like they're using Windows XP but discovering something new.

---

## 2. Visual Style & Aesthetic

### 2.1 Design Pattern

> **Pattern:** Feature-Rich Showcase + Hero-Centric Layout
> **Vibe:** Vibrant, high-contrast, blocky, nostalgic, arcade-meets-desktop

- The **Windows XP Shell** uses the classic Luna visual language (3D raised/sunken borders, gradient title bars, square corners)
- The **Game World** uses pixel art (16×16 tile grid, limited color palettes, 4-direction sprites)
- The **Social Apps** bridge both: XP-styled windows containing pixel-inspired content

### 2.2 Mood Board Keywords

```
retro | nostalgic | pixel art | 8-bit | 16-bit | arcade
windows xp | luna | desktop | taskbar | start menu
sandbox | building | creation | social | community
blocky | high-contrast | vibrant | playful | indie
```

### 2.3 Visual Hierarchy

| Level | Element | Treatment |
|-------|---------|-----------|
| **1** | Window Title Bar | Gradient + bold Tahoma text |
| **2** | Desktop Icons | Pixel art 32×32 + Tahoma label below |
| **3** | Modal Dialogs | Centered, dimmed overlay, OK/Cancel |
| **4** | Content Cards | Sunken 3D border inside windows |
| **5** | Buttons & Inputs | 3D raised/sunken with hover states |

---

## 3. Color System

### 3.1 Windows XP Luna Theme (Shell)

The shell uses three classic XP color schemes:

#### Blue (Default)

| Token | Hex | Usage |
|-------|-----|-------|
| `--xp-titlebar-top` | `#0A246A` | Window title bar gradient (top) |
| `--xp-titlebar-bottom` | `#3A6EA5` | Window title bar gradient (bottom) |
| `--xp-titlebar-text` | `#FFFFFF` | Title bar text |
| `--xp-window-bg` | `#ECE9D8` | Window content background |
| `--xp-desktop-bg` | `#3A6EA5` | Desktop wallpaper base |
| `--xp-start-bg` | `#3A6EA5` | Start menu / taskbar background |
| `--xp-taskbar` | `#245EDC` | Taskbar (classic blue XP taskbar) |
| `--xp-taskbar-text` | `#FFFFFF` | Taskbar text and clock |
| `--xp-button-face` | `#ECE9D8` | Button face color |
| `--xp-button-highlight` | `#FFFFFF` | Button top/left border (light source) |
| `--xp-button-shadow` | `#ACA899` | Button bottom/right border (shadow) |
| `--xp-button-dark-shadow` | `#716F64` | Darker shadow for 3D depth |
| `--xp-highlight` | `#316AC5` | Selection highlight |
| `--xp-text` | `#000000` | Primary text |
| `--xp-text-disabled` | `#ACA899` | Disabled text |
| `--xp-link` | `#0000FF` | Hyperlink color |
| `--xp-scrollbar` | `#D4D0C8` | Scrollbar face |

#### Silver

| Token | Hex |
|-------|-----|
| `--xp-titlebar-top` | `#848484` |
| `--xp-titlebar-bottom` | `#AAAAAA` |
| `--xp-desktop-bg` | `#848484` |
| `--xp-taskbar` | `#A0A0A0` |

#### Olive Green

| Token | Hex |
|-------|-----|
| `--xp-titlebar-top` | `#6B6B3C` |
| `--xp-titlebar-bottom` | `#8B8B5C` |
| `--xp-desktop-bg` | `#6B6B3C` |
| `--xp-taskbar` | `#6B6B3C` |

### 3.2 Pixel Art Game Palette (World)

The game uses a curated retro palette inspired by 16-bit RPGs:

| Role | Hex | Name |
|------|-----|------|
| Sky / Water | `#6BB8E8` | Sky Blue |
| Grass / Nature | `#5ABE5A` | Meadow Green |
| Dirt / Earth | `#C47D4A` | Sandy Brown |
| Stone / Path | `#9C9C9C` | Stone Gray |
| Deep Water | `#2C6BB8` | Deep Blue |
| Wood / Buildings | `#8B5E3C` | Chestnut |
| Foliage Dark | `#3A8C3A` | Forest Green |
| Snow / Light | `#F0F0F0` | Snow White |
| Cave / Dungeon | `#3C3C3C` | Cave Dark |
| Gold / Coins | `#FFD700` | Gold |
| Red / Danger | `#DC2626` | Danger Red |
| UI / Accent | `#2563EB` | Accent Blue |

### 3.3 Social Media Accent Palette

| Role | Hex | Usage |
|------|-----|-------|
| Like / Heart | `#E11D48` | Like button, notifications |
| Online Status | `#22C55E` | Online indicator |
| Mention / Tag | `#2563EB` | @mentions, hashtags |
| Warning | `#F59E0B` | Warning messages |
| Error | `#DC2626` | Error states |
| Success | `#16A34A` | Success states |

### 3.4 CSS Custom Properties

```css
:root {
  /* Shell Colors */
  --xp-titlebar-top: #0A246A;
  --xp-titlebar-bottom: #3A6EA5;
  --xp-titlebar-text: #FFFFFF;
  --xp-window-bg: #ECE9D8;
  --xp-desktop-bg: #3A6EA5;
  --xp-taskbar: #245EDC;
  --xp-taskbar-text: #FFFFFF;
  --xp-button-face: #ECE9D8;
  --xp-button-highlight: #FFFFFF;
  --xp-button-shadow: #ACA899;
  --xp-button-dark-shadow: #716F64;
  --xp-highlight: #316AC5;
  --xp-text: #000000;
  --xp-text-disabled: #ACA899;
  --xp-link: #0000FF;
  --xp-scrollbar: #D4D0C8;
  --xp-scrollbar-track: #F0F0F0;

  /* Spacing */
  --xp-border-width: 2px;
  --xp-window-padding: 8px;
  --xp-control-padding: 4px 12px;

  /* Effects */
  --xp-titlebar-gradient: linear-gradient(180deg, #0A246A 0%, #3A6EA5 100%);
  --xp-button-raised: inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #ACA899;
  --xp-button-sunken: inset 1px 1px 0 #716F64, inset -1px -1px 0 #FFFFFF;

  /* Fonts */
  --xp-font: Tahoma, 'MS Sans Serif', Geneva, sans-serif;
  --xp-font-size: 11px;
  --xp-font-size-lg: 14px;
  --xp-font-size-title: 12px;

  /* Pixel Art Fonts (for game) */
  --pixel-font-heading: 'Press Start 2P', monospace;
  --pixel-font-body: 'VT323', monospace;
}

/* Theme Variants */
.theme-silver {
  --xp-titlebar-top: #848484;
  --xp-titlebar-bottom: #AAAAAA;
  --xp-desktop-bg: #848484;
  --xp-taskbar: #A0A0A0;
  --xp-titlebar-gradient: linear-gradient(180deg, #848484 0%, #AAAAAA 100%);
}

.theme-olive {
  --xp-titlebar-top: #6B6B3C;
  --xp-titlebar-bottom: #8B8B5C;
  --xp-desktop-bg: #6B6B3C;
  --xp-taskbar: #6B6B3C;
  --xp-titlebar-gradient: linear-gradient(180deg, #6B6B3C 0%, #8B8B5C 100%);
}
```

---

## 4. Typography

### 4.1 Font Stack

| Usage | Font | Fallback | Size | Weight |
|-------|------|----------|------|--------|
| Window titles | Tahoma | `'MS Sans Serif'`, Geneva, sans-serif | 12px | 700 |
| Body / UI text | Tahoma | `'MS Sans Serif'`, Geneva, sans-serif | 11px | 400 |
| Buttons | Tahoma | `'MS Sans Serif'`, Geneva, sans-serif | 11px | 400 |
| Start menu | Tahoma | `'MS Sans Serif'`, Geneva, sans-serif | 10px | 400 |
| Desktop icons | Tahoma | `'MS Sans Serif'`, Geneva, sans-serif | 11px | 400 |
| Input fields | Tahoma | `'MS Sans Serif'`, Geneva, sans-serif | 11px | 400 |
| Game headings | `'Press Start 2P'` | monospace | 14-24px | 400 |
| Game body text | `'VT323'` | monospace | 16-20px | 400 |
| Game UI labels | `'Press Start 2P'` | monospace | 8-10px | 400 |
| Code / chat | `'Courier New'` | monospace | 11px | 400 |

### 4.2 CSS Imports

```css
/* Retro pixel fonts for game */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
```

### 4.3 Type Scale

| Level | Font | Size | Weight | Line Height | Tracking |
|-------|------|------|--------|-------------|----------|
| **Display** (game title) | Press Start 2P | 32px | 400 | 1.4 | 0 |
| **H1** (window title) | Tahoma | 14px | 700 | 1.2 | 0 |
| **H2** (section header) | Tahoma | 12px | 700 | 1.3 | 0 |
| **H3** (card title) | Tahoma | 11px | 700 | 1.4 | 0 |
| **Body** | Tahoma | 11px | 400 | 1.5 | 0 |
| **Small** | Tahoma | 10px | 400 | 1.4 | 0 |
| **Label** | Tahoma | 11px | 400 | 1.2 | 0 |
| **Game HUD** | Press Start 2P | 8px | 400 | 1.6 | 1px |
| **Game Chat** | VT323 | 18px | 400 | 1.3 | 0 |

### 4.4 Typography Rules

- **Window titles**: Sentence case, never all-caps. 12px bold Tahoma.
- **Body text**: 11px Tahoma — matches classic Windows XP UI perfectly.
- **Game text**: `VT323` for readable in-world text (dialogue, signs).
- **Game UI**: `Press Start 2P` at small sizes for score, health, labels.
- **Avoid**: Mixing pixel fonts with XP UI fonts. Pixel fonts only inside the game canvas.
- **Anti-pattern**: Using `Press Start 2P` for body text in the shell — it's illegible at small sizes.

---

## 5. Layout & Spacing

### 5.1 Spacing System

```
--xp-space-1: 2px   (micro gap)
--xp-space-2: 4px   (tight)
--xp-space-3: 8px   (default padding)
--xp-space-4: 12px  (comfortable)
--xp-space-5: 16px  (section)
--xp-space-6: 24px  (large section)
--xp-space-7: 32px  (page)
```

### 5.2 Window Layout

```
┌──────────────────────────────────┐
│ [Icon] Window Title  [_] [□] [X] │  ← 24px title bar (gradient)
├──────────────────────────────────┤
│                                  │
│   Content Area (8px padding)     │  ← --xp-window-padding: 8px
│                                  │
│   ┌────────────────────────┐     │
│   │ Sunken inner frame     │     │  ← 2px inset border
│   └────────────────────────┘     │
│                                  │
│   [  OK  ]  [ Cancel ]          │  ← Buttons bottom-right
│                                  │
└──────────────────────────────────┘
   ← 2px raised outer border →
```

### 5.3 Desktop Grid

- Desktop icons arranged in a grid starting at top-left
- Icon size: 32×32 pixel art + 11px label below
- Icon spacing: 8px horizontal, 16px vertical (including label)
- Taskbar height: 30px (fixed, positioned at bottom)
- Start menu: 340px × screen height (or max 600px)

### 5.4 Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| **Small** | < 640px | Windows stack vertically, taskbar icons compact |
| **Medium** | 640-1024px | Default XP layout, windows side-by-side |
| **Large** | 1024-1440px | Extended desktop, more icons, larger game window |
| **Extra Large** | > 1440px | Max-window sizes, comfortable spacing |

### 5.5 Game World Layout

- Game canvas fills the window content area (preserving aspect ratio)
- Default game viewport: 320×240 (scaled 3-4x to 960-1280px)
- Hotbar: 8 slots × 32px, positioned at bottom of game canvas
- Chat overlay: bottom-left, semi-transparent
- HUD: top-left (score, health, coins), top-right (minimap)

---

## 6. Component Library

### 6.1 Window Frame

```
.xp-window
  .xp-window-titlebar
    .xp-window-icon        ← 16×16
    .xp-window-title       ← Tahoma 12px bold
    .xp-window-controls
      .xp-btn-minimize     ← [_]
      .xp-btn-maximize     ← [□]
      .xp-btn-close        ← [X] (red on hover)
  .xp-window-menubar       ← optional
  .xp-window-body          ← sunken 3D border
    .xp-window-content
  .xp-window-statusbar     ← optional
```

### 6.2 Buttons

```css
.xp-button {
  font-family: Tahoma;
  font-size: 11px;
  padding: 4px 16px;
  min-width: 75px;
  min-height: 23px;
  background: #ECE9D8;
  border: none;
  box-shadow:
    inset 1px 1px 0 #FFFFFF,
    inset -1px -1px 0 #ACA899,
    1px 1px 0 #000000;        /* outer bevel */
  cursor: pointer;
}

.xp-button:hover {
  box-shadow:
    inset 1px 1px 0 #FFFFFF,
    inset -1px -1px 0 #ACA899,
    1px 1px 0 #000000;
  /* slightly brighter face */
  filter: brightness(1.05);
}

.xp-button:active {
  box-shadow:
    inset 1px 1px 0 #716F64,
    inset -1px -1px 0 #FFFFFF;
  padding: 5px 15px 3px 17px;  /* shift text on press */
}

.xp-button:disabled {
  color: #ACA899;
  box-shadow:
    inset 1px 1px 0 #FFFFFF,
    inset -1px -1px 0 #ACA899;
}

.xp-button-default {
  /* Darker border to indicate default action */
  outline: 1px solid #0A246A;
  outline-offset: -4px;
}

.xp-button-close {
  /* Used only in title bar */
  font-weight: 700;
  min-width: 21px;
  min-height: 21px;
  padding: 0;
  line-height: 21px;
}
.xp-button-close:hover {
  background: #E81123;
  color: #FFFFFF;
  filter: none;
}
```

### 6.3 Input Fields

```css
.xp-input {
  font-family: Tahoma;
  font-size: 11px;
  padding: 3px 5px;
  border: none;
  box-shadow:
    inset 1px 1px 0 #716F64,
    inset -1px -1px 0 #FFFFFF;
  background: #FFFFFF;
  outline: none;
}

.xp-input:focus {
  /* Dotted focus rectangle inside the field (classic XP) */
  outline: 1px dotted #000000;
  outline-offset: -2px;
}

.xp-textarea {
  font-family: Tahoma;
  font-size: 11px;
  padding: 3px 5px;
  border: none;
  box-shadow:
    inset 1px 1px 0 #716F64,
    inset -1px -1px 0 #FFFFFF;
  background: #FFFFFF;
  resize: both;
}
```

### 6.4 Desktop Icons

```css
.xp-desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 72px;
  padding: 4px;
  cursor: pointer;
  text-align: center;
}

.xp-desktop-icon img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.xp-desktop-icon span {
  font-family: Tahoma;
  font-size: 11px;
  color: #FFFFFF;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  margin-top: 2px;
  word-wrap: break-word;
  max-width: 68px;
}

.xp-desktop-icon.selected {
  background: rgba(49, 106, 197, 0.4);
}

.xp-desktop-icon.selected span {
  background: #316AC5;
}
```

### 6.5 Scrollbars

```css
/* Custom scrollbar to match XP style */
::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}

::-webkit-scrollbar-track {
  background: #F0F0F0;
  box-shadow: inset 1px 1px 0 #716F64;
}

::-webkit-scrollbar-thumb {
  background: #D4D0C8;
  box-shadow:
    inset 1px 1px 0 #FFFFFF,
    inset -1px -1px 0 #716F64;
}

::-webkit-scrollbar-button {
  background: #D4D0C8;
  box-shadow:
    inset 1px 1px 0 #FFFFFF,
    inset -1px -1px 0 #716F64;
  width: 16px;
  height: 16px;
}

::-webkit-scrollbar-corner {
  background: #D4D0C8;
}
```

### 6.6 Dialogs

```css
.xp-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.xp-dialog {
  background: #ECE9D8;
  box-shadow:
    1px 1px 0 #FFFFFF,
    -1px -1px 0 #716F64,
    2px 2px 0 #000000;
  min-width: 300px;
  max-width: 450px;
}

.xp-dialog-titlebar {
  background: linear-gradient(180deg, #0A246A 0%, #3A6EA5 100%);
  color: #FFFFFF;
  font-family: Tahoma;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.xp-dialog-body {
  padding: 16px;
  font-family: Tahoma;
  font-size: 11px;
}

.xp-dialog-actions {
  padding: 8px 16px 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

### 6.7 Taskbar

```css
.xp-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(180deg, #245EDC 0%, #1A4CB5 100%);
  display: flex;
  align-items: center;
  z-index: 9999;
  padding: 0 2px;
}

.xp-start-button {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
  background: linear-gradient(180deg, #3A6EA5 0%, #0A246A 100%);
  border-radius: 0 8px 8px 0;
  color: #FFFFFF;
  font-family: Tahoma;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  margin-right: 4px;
}

.xp-taskbar-items {
  display: flex;
  gap: 2px;
  flex: 1;
}

.xp-taskbar-item {
  height: 22px;
  padding: 0 12px;
  background: #3A6EA5;
  color: #FFFFFF;
  font-family: Tahoma;
  font-size: 11px;
  display: flex;
  align-items: center;
  cursor: pointer;
  min-width: 80px;
  max-width: 180px;
}

.xp-taskbar-item.active {
  background: #1A4CB5;
  box-shadow: inset 0 2px 0 #FFFFFF40;
}

.xp-taskbar-tray {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #FFFFFF;
  font-family: Tahoma;
  font-size: 11px;
  padding: 0 8px;
}

.xp-taskbar-clock {
  font-family: Tahoma;
  font-size: 11px;
  padding: 0 4px;
}
```

### 6.8 Progress Bar

```css
.xp-progress {
  height: 16px;
  background: #FFFFFF;
  box-shadow: inset 1px 1px 0 #716F64;
  position: relative;
}

.xp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3A6EA5 0%, #5A8EC5 50%, #3A6EA5 100%);
  background-size: 40px 100%;
  animation: progress-stripe 2s linear infinite;
}

@keyframes progress-stripe {
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
}
```

---

## 7. Iconography

### 7.1 Icon Style Guidelines

| Context | Style | Size | Format |
|---------|-------|------|--------|
| Desktop icons | Pixel art, XP-style | 32×32 | PNG (pixelated) |
| Window title bar | XP-styled system icons | 16×16 | PNG (pixelated) |
| Taskbar icons | XP-styled system icons | 16×16 | PNG (pixelated) |
| In-app buttons | Simple vector or pixel | 16×16 | SVG or PNG |
| Social actions | Vector, flat style | 20×20 | SVG |
| Game UI | Pixel art | 8-32px | PNG (pixelated) |

### 7.2 Key Icons Needed

| Icon | Context | Style |
|------|---------|-------|
| My Posts | Desktop | Folder-style 32×32 |
| Retro World | Desktop | Game controller 32×32 |
| Chat | Desktop | Envelope 32×32 |
| Friends | Desktop | People 32×32 |
| My Computer | Desktop | Classic PC 32×32 |
| Start logo | Taskbar | Windows flag 16×16 |
| Close | Title bar | [X] |
| Maximize | Title bar | [□] |
| Minimize | Title bar | [_] |
| Folder | File dialog | Yellow folder |
| Save | Dialog | Floppy disk |
| Like | Post | Thumbs up / Heart |
| Comment | Post | Speech bubble |
| Share | Post | Arrow |
| Settings | App | Gear |

---

## 8. Animation & Interaction

### 8.1 Timing

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Window open | 150ms | ease-out | Fade in + slight scale |
| Window close | 100ms | ease-in | Fade out |
| Window minimize | 200ms | ease-out | Slide down to taskbar |
| Button hover | 100ms | ease | Brightness shift |
| Button press | 50ms | step-end | Instant visual feedback |
| Dropdown open | 100ms | ease-out | |
| Tooltip appear | 200ms | ease-out | |
| Notification | 300ms | ease-out | Slide from system tray |
| Game transitions | 200-300ms | ease-out | Scene fades |

### 8.2 Micro-interactions

- **Window drag**: Live preview, no opacity change during drag
- **Button press**: Text shifts 1px down and right (classic XP feel)
- **Close button hover**: Turns red on hover, stays red while hovering
- **Desktop icon selection**: Semi-transparent blue highlight
- **Taskbar item**: Active state has inset top highlight
- **Tab switch**: Content swaps instantly (no crossfade — classic XP style)

### 8.3 Cursor Styles

```css
/* All interactive elements get proper cursors */
.xp-button, .xp-desktop-icon, .xp-taskbar-item,
.xp-start-button, .xp-window-controls button {
  cursor: pointer;
}

.xp-input, .xp-textarea {
  cursor: text;
}

.xp-link {
  cursor: pointer;
}

.xp-window-titlebar {
  cursor: default;
}

/* Game canvas gets custom cursors */
.game-canvas { cursor: crosshair; }
.game-canvas.interact { cursor: pointer; }
.game-canvas.move { cursor: move; }
```

### 8.4 Loading States

```css
/* Classic XP-style loading */
.xp-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  font-family: Tahoma;
  font-size: 11px;
  color: #000000;
}
```

---

## 9. Windows XP Shell Tokens

### 9.1 Complete CSS Token Map

All design tokens for the XP shell, organized by category:

```css
:root {
  /* ── Colors ── */
  --xp-titlebar-top: #0A246A;
  --xp-titlebar-bottom: #3A6EA5;
  --xp-titlebar-text: #FFFFFF;
  --xp-window-bg: #ECE9D8;
  --xp-window-border-light: #FFFFFF;
  --xp-window-border-dark: #716F64;
  --xp-desktop-bg: #3A6EA5;
  --xp-taskbar: #245EDC;
  --xp-taskbar-item: #3A6EA5;
  --xp-taskbar-item-active: #1A4CB5;
  --xp-start-gradient: linear-gradient(180deg, #3A6EA5 0%, #0A246A 100%);
  --xp-button-face: #ECE9D8;
  --xp-button-highlight: #FFFFFF;
  --xp-button-shadow: #ACA899;
  --xp-button-dark-shadow: #716F64;
  --xp-button-default-border: #0A246A;
  --xp-highlight: #316AC5;
  --xp-highlight-text: #FFFFFF;
  --xp-selection-bg: #316AC5;
  --xp-selection-text: #FFFFFF;
  --xp-text: #000000;
  --xp-text-disabled: #ACA899;
  --xp-link: #0000FF;
  --xp-scrollbar: #D4D0C8;
  --xp-scrollbar-track: #F0F0F0;
  --xp-scrollbar-btn: #D4D0C8;
  --xp-sunken-bg: #FFFFFF;
  --xp-sunken-border: inset 1px 1px 0 #716F64, inset -1px -1px 0 #FFFFFF;
  --xp-raised-border: inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #ACA899;
  --xp-tooltip-bg: #FFFFE1;
  --xp-dialog-overlay: rgba(0, 0, 0, 0.4);
  --xp-close-btn-hover: #E81123;
  --xp-close-btn-hover-text: #FFFFFF;

  /* ── Typography ── */
  --xp-font: Tahoma, 'MS Sans Serif', Geneva, sans-serif;
  --xp-font-size: 11px;
  --xp-font-size-lg: 14px;
  --xp-font-size-title: 12px;
  --xp-font-size-small: 10px;

  /* ── Spacing ── */
  --xp-space-1: 2px;
  --xp-space-2: 4px;
  --xp-space-3: 8px;
  --xp-space-4: 12px;
  --xp-space-5: 16px;
  --xp-space-6: 24px;
  --xp-space-7: 32px;
  --xp-window-padding: 8px;
  --xp-control-padding: 4px 12px;

  /* ── Borders ── */
  --xp-border-width: 2px;
  --xp-border-radius: 0px;  /* XP has square corners */
  --xp-titlebar-height: 24px;
  --xp-taskbar-height: 30px;

  /* ── Shadows ── */
  --xp-shadow-raised: inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #ACA899;
  --xp-shadow-sunken: inset 1px 1px 0 #716F64, inset -1px -1px 0 #FFFFFF;
  --xp-shadow-window: 1px 1px 0 #FFFFFF, -1px -1px 0 #716F64, 2px 2px 0 #00000040;

  /* ── Gradients ── */
  --xp-titlebar-gradient: linear-gradient(180deg, var(--xp-titlebar-top) 0%, var(--xp-titlebar-bottom) 100%);
  --xp-taskbar-gradient: linear-gradient(180deg, #245EDC 0%, #1A4CB5 100%);
  --xp-start-gradient: linear-gradient(180deg, #3A6EA5 0%, #0A246A 100%);
}
```

### 9.2 Title Bar Close Button — Special Behavior

```css
.xp-btn-close {
  font-family: 'Webdings', 'Segoe UI', Tahoma;
  font-size: 12px;
  font-weight: 700;
  min-width: 21px;
  min-height: 21px;
  padding: 0;
  line-height: 21px;
  text-align: center;
  background: #ECE9D8;
  cursor: pointer;
}

.xp-btn-close:hover {
  background: #E81123;
  color: #FFFFFF;
}
```

---

## 10. Top-Down Sandbox World Design

### 10.1 Visual Style

- **Perspective**: True top-down (orthographic), not isometric
- **Resolution**: 320×240 pixel art (scaled 3-4x for display)
- **Tile size**: 16×16 pixels
- **Character size**: 16×24 pixels (4-directional frames)
- **Color palette**: 16-32 colors per tile, limited retro palette
- **Rendering**: Y-sorting for depth (objects lower on screen render in front)

### 10.2 Tile Types & Colors

| Tile | Hex | Description |
|------|-----|-------------|
| Grass | `#5ABE5A` / `#4DA64D` | Bright green, slight variation |
| Dirt | `#C47D4A` / `#B06E3C` | Brown tones |
| Path | `#BF9B7A` | Lighter brown for paths |
| Sand | `#E8D5A3` | Beach/desert |
| Water | `#4A90D9` / `#2C6BB8` | Blue with animation |
| Stone | `#9C9C9C` / `#8A8A8A` | Gray tones |
| Snow | `#F0F0F0` / `#E0E0E0` | White/Light gray |
| Farmland | `#6B4423` / `#8B5E3C` | Tilled soil brown |
| Cave Floor | `#4A4A4A` / `#3C3C3C` | Dark stone |

### 10.3 Player Sprite Specifications

- **Frames per direction**: 3 (idle, walk1, walk2)
- **Directions**: down, left, right, up
- **Total frames**: 12 (4 directions × 3 frames)
- **Frame size**: 16×24 pixels
- **Animations**: walk cycle loops at ~4-6 fps
- **Tool use**: additional 4-8 frames for tool animations

### 10.4 Game HUD Design (Pixel Art)

```
┌──────────────────────────────────────┐
│ ♥♥♥   ★ 1250   ● 42   [map]        │
│                                      │
│                                      │
│           PLAYER @ (12, 8)           │
│                                      │
│                                      │
│                                      │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┐          │
│  │🪓│⛏│💧│🌾│🎣│🏹│🧺│📦│  │ ← Hotbar
│  └──┴──┴──┴──┴──┴──┴──┴──┘          │
│  [Proximity Chat...________________] │
└──────────────────────────────────────┘
```

- HUD rendered in `Press Start 2P` at 8px (scaled to ~16px)
- Hearts (♥) for health, horizontal layout
- Star (★) for score, Circle (●) for coins
- Hotbar: 8 slots, selected slot highlighted with XP-style selection
- Chat input at bottom

### 10.5 Creation Editor Design

The Creation Editor (Manyland-style) is a pixel art drawing tool:

```
┌─────────────── Creation Editor ───────────────────┐
│ [Save] [Load] [Export] [Import]  Undo Redo Mirror  │
├────────────────────────────────────────────────────┤
│                                                    │
│   ┌────────────────────────────────────────┐       │
│   │                                        │       │
│   │         Drawing Canvas (16×16)          │       │
│   │    Grid overlay, zoomed 8-16x          │       │
│   │                                        │       │
│   └────────────────────────────────────────┘       │
│                                                    │
│  Tools: [✏️] [🪣] [📏] [⬜] [⭕] [🧹]             │
│  Color: █ █ █ █ █ █ █ █ █ █ █ █ █ █ █ █          │
│  Behavior: [Decorative] [Solid] [Usable] [Wearable]│
└────────────────────────────────────────────────────┘
```

---

## 11. Design Anti-Patterns

### ❌ What to Avoid

| Anti-Pattern | Why | Instead |
|-------------|-----|---------|
| **Modern flat design** everywhere | Breaks XP immersion | Use 3D borders, gradients, classic controls |
| **Rounded corners** | XP uses square corners throughout | All corners are 90° |
| **Press Start 2P in shell UI** | Unreadable at small sizes | Use Tahoma for shell, pixel fonts only in game |
| **Pure black `#000` backgrounds** | Not XP-like; feels too modern | Use `#0F172A` or XP desktop blue |
| **Transparency / blur effects** | Not part of XP's visual language | Use solid colors, dithered gradients |
| **Emoji for icons** | Platform-inconsistent, low quality | Use SVG or pixel art icons |
| **Loading spinners** | Too modern; XP used animated hourglass or progress bars | Use XP-style progress bars |
| **Animating width/height** | Causes layout reflow | Use transform and opacity only |
| **Lucide/Feather icons** in shell | Too modern/clean for XP aesthetic | Use pixel art or classic XP-style icons |
| **Hamburger menus** | Pre-dates XP era | Use traditional menus or start menu |
| **Infinite scroll without scrollbar** | XP always shows scroll position | Always show scrollbar with thumb position |

---

## 12. Accessibility Considerations

| Requirement | Implementation |
|------------|----------------|
| **Color contrast** | All text meets WCAG AA 4.5:1 minimum (dark text on `#ECE9D8` passes easily) |
| **Focus indicators** | Dotted outline on focused elements (XP-style) |
| **Keyboard navigation** | Tab through windows, Enter to activate, Escape to close |
| **Screen reader labels** | All icon buttons have aria-label; window titles announced |
| **Reduced motion** | `prefers-reduced-motion` disables window animations, keeps instant transitions |
| **Touch targets** | Minimum 44×44px for interactive elements (applies to touch-enabled devices) |
| **Font scaling** | All text sized in px (XP convention); ensure minimum 11px for readability |
| **Color not only indicator** | Status indicators use icon + text + color (e.g., online: green dot + "Online" label) |
| **Skip navigation** | Hidden skip-link for keyboard users to bypass desktop to reach content |
| **Game accessibility** | Remappable keys, colorblind-friendly palette option, subtitle support |

### Contrast Reference

| Pair | Ratio | Passes AA? |
|------|-------|-----------|
| `#000000` on `#ECE9D8` | 17.5:1 | ✅ Yes |
| `#000000` on `#FFFFFF` | 21:1 | ✅ Yes |
| `#FFFFFF` on `#0A246A` | 15.3:1 | ✅ Yes |
| `#FFFFFF` on `#3A6EA5` | 5.8:1 | ✅ Yes |
| `#ACA899` on `#ECE9D8` | 2.3:1 | ❌ No (disabled text = acceptable exception) |
| `#FFFFFF` on `#245EDC` | 5.1:1 | ✅ Yes |

---

> **Document Status**: v1.0 — Design System
>
> This document is the source of truth for all visual design decisions in RetroMap.
> It integrates output from the **ui-ux-pro-max** design intelligence skill with
> the Windows XP Luna design language and 16-bit pixel art game aesthetics.
>
> Last updated: July 3, 2026
