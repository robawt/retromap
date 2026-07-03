# RetroMap -- Design System

A Windows XP-styled social media platform with a top-down 2D sandbox world.

---

## 1. Design Philosophy

RetroMap blends two distinct but complementary aesthetics:

| Layer | Aesthetic | Source |
|-------|-----------|--------|
| Shell (Desktop) | Windows XP Luna (2001) | Blue, Silver, Olive themes |
| Game (World) | 16-bit pixel art (SNES era) | Stardew Valley / Zelda: A Link to the Past |
| Social (Apps) | XP-styled windows hosting modern content | Feeds, profiles, chat inside classic frames |
| Branding | Pixel art with XP flair | Logo, badges, taskbar icons |

The core principle is familiar nostalgia. Users should feel like they are using Windows XP but discovering something new.

---

## 2. Visual Style and Aesthetic

### 2.1 Design Pattern

- The Windows XP Shell uses the classic Luna visual language (3D raised/sunken borders, gradient title bars, square corners)
- The Game World uses pixel art (16x16 tile grid, limited color palettes, 4-direction sprites)
- The Social Apps bridge both: XP-styled windows containing pixel-inspired content

### 2.2 Visual Hierarchy

| Level | Element | Treatment |
|-------|---------|-----------|
| 1 | Window Title Bar | Gradient + bold Tahoma text |
| 2 | Desktop Icons | Pixel art 32x32 + Tahoma label below |
| 3 | Modal Dialogs | Centered, dimmed overlay, OK/Cancel |
| 4 | Content Cards | Sunken 3D border inside windows |
| 5 | Buttons and Inputs | 3D raised/sunken with hover states |

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
| `--xp-taskbar` | `#245EDC` | Taskbar |
| `--xp-taskbar-text` | `#FFFFFF` | Taskbar text and clock |
| `--xp-button-face` | `#ECE9D8` | Button face color |
| `--xp-button-highlight` | `#FFFFFF` | Button top/left border |
| `--xp-button-shadow` | `#ACA899` | Button bottom/right border |
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
| Window titles | Tahoma | 'MS Sans Serif', Geneva, sans-serif | 12px | 700 |
| Body / UI text | Tahoma | 'MS Sans Serif', Geneva, sans-serif | 11px | 400 |
| Buttons | Tahoma | 'MS Sans Serif', Geneva, sans-serif | 11px | 400 |
| Start menu | Tahoma | 'MS Sans Serif', Geneva, sans-serif | 10px | 400 |
| Desktop icons | Tahoma | 'MS Sans Serif', Geneva, sans-serif | 11px | 400 |
| Input fields | Tahoma | 'MS Sans Serif', Geneva, sans-serif | 11px | 400 |
| Game headings | 'Press Start 2P' | monospace | 14-24px | 400 |
| Game body text | 'VT323' | monospace | 16-20px | 400 |
| Game UI labels | 'Press Start 2P' | monospace | 8-10px | 400 |
| Code / chat | 'Courier New' | monospace | 11px | 400 |

### 4.2 CSS Imports

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
```

### 4.3 Type Scale

| Level | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| Display (game title) | Press Start 2P | 32px | 400 | 1.4 |
| H1 (window title) | Tahoma | 14px | 700 | 1.2 |
| H2 (section header) | Tahoma | 12px | 700 | 1.3 |
| H3 (card title) | Tahoma | 11px | 700 | 1.4 |
| Body | Tahoma | 11px | 400 | 1.5 |
| Small | Tahoma | 10px | 400 | 1.4 |
| Label | Tahoma | 11px | 400 | 1.2 |
| Game HUD | Press Start 2P | 8px | 400 | 1.6 |
| Game Chat | VT323 | 18px | 400 | 1.3 |

### 4.4 Typography Rules

- Window titles: Sentence case, never all-caps. 12px bold Tahoma.
- Body text: 11px Tahoma.
- Game text: VT323 for readable in-world text.
- Game UI: Press Start 2P at small sizes for score, health, labels.
- Pixel fonts should only be used inside the game canvas, not in the shell UI.

---

## 5. Layout and Spacing

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
+----------------------------------+
| [Icon] Window Title  [_] [ ] [X] |  <- 24px title bar (gradient)
+----------------------------------+
|                                  |
|   Content Area (8px padding)     |
|                                  |
|   +----------------------------+ |
|   | Sunken inner frame         | |  <- 2px inset border
|   +----------------------------+ |
|                                  |
|   [  OK  ]  [ Cancel ]          |
|                                  |
+----------------------------------+
   <- 2px raised outer border ->
```

### 5.3 Desktop Grid

- Desktop icons arranged in a grid starting at top-left
- Icon size: 32x32 pixel art + 11px label below
- Icon spacing: 8px horizontal, 16px vertical (including label)
- Taskbar height: 30px (fixed, positioned at bottom)
- Start menu: 340px x screen height (or max 600px)

### 5.4 Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Small | < 640px | Windows stack vertically, taskbar icons compact |
| Medium | 640-1024px | Default XP layout, windows side-by-side |
| Large | 1024-1440px | Extended desktop, more icons, larger game window |
| Extra Large | > 1440px | Max-window sizes, comfortable spacing |

### 5.5 Game World Layout

- Game canvas fills the window content area
- Default game viewport: 320x240 (scaled 3-4x to 960-1280px)
- Hotbar: 8 slots x 32px, positioned at bottom of game canvas
- Chat overlay: bottom-left, semi-transparent
- HUD: top-left (score, health, coins), top-right (minimap)

---

## 6. Component Library

### 6.1 Window Frame

```
.xp-window
  .xp-window-titlebar
    .xp-window-icon        <- 16x16
    .xp-window-title       <- Tahoma 12px bold
    .xp-window-controls
      .xp-btn-minimize     <- [_]
      .xp-btn-maximize     <- [ ]
      .xp-btn-close        <- [X] (red on hover)
  .xp-window-body          <- sunken 3D border
    .xp-window-content
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
    inset -1px -1px 0 #ACA899;
  cursor: pointer;
}

.xp-button:active {
  box-shadow:
    inset 1px 1px 0 #716F64,
    inset -1px -1px 0 #FFFFFF;
}

.xp-button:disabled {
  color: #ACA899;
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
  outline: 1px dotted #000000;
  outline-offset: -2px;
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
  max-width: 68px;
}
```

### 6.5 Scrollbars

```css
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
}

.xp-taskbar-items {
  display: flex;
  gap: 2px;
  flex: 1;
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
```

### 6.8 Progress Bar

```css
.xp-progress {
  height: 16px;
  background: #FFFFFF;
  box-shadow: inset 1px 1px 0 #716F64;
}

.xp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3A6EA5 0%, #5A8EC5 50%, #3A6EA5 100%);
  background-size: 40px 100%;
  animation: progress-stripe 2s linear infinite;
}
```

---

## 7. Iconography

### 7.1 Icon Style Guidelines

| Context | Style | Size | Format |
|---------|-------|------|--------|
| Desktop icons | Pixel art, XP-style | 32x32 | SVG |
| Window title bar | XP-styled system icons | 16x16 | SVG |
| Taskbar icons | XP-styled system icons | 16x16 | SVG |
| In-app buttons | Simple vector or pixel | 16x16 | SVG |
| Social actions | Vector, flat style | 20x20 | SVG |
| Game UI | Pixel art | 8-32px | PNG |

### 7.2 Key Icons

| Icon | Context | Style |
|------|---------|-------|
| My Posts | Desktop | Folder-style 32x32 |
| Retro World | Desktop | Game controller 32x32 |
| Chat | Desktop | Envelope 32x32 |
| Friends | Desktop | People 32x32 |
| Start logo | Taskbar | Windows flag 16x16 |
| Settings | App | Gear |
| Like | Post | Thumbs up / Heart |
| Comment | Post | Speech bubble |

---

## 8. Animation and Interaction

### 8.1 Timing

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Window open | 150ms | ease-out | Fade in + slight scale |
| Window close | 100ms | ease-in | Fade out |
| Window minimize | 200ms | ease-out | Slide down to taskbar |
| Button hover | 100ms | ease | Brightness shift |
| Button press | 50ms | step-end | Instant visual feedback |
| Tooltip appear | 200ms | ease-out | |
| Notification | 300ms | ease-out | Slide from system tray |
| Game transitions | 200-300ms | ease-out | Scene fades |

### 8.2 Micro-interactions

- Window drag: live preview, no opacity change during drag
- Button press: text shifts 1px down and right
- Close button hover: turns red on hover
- Desktop icon selection: semi-transparent blue highlight
- Taskbar item: active state has inset top highlight
- Tab switch: content swaps instantly (no crossfade)

### 8.3 Cursor Styles

```css
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
```

---

## 9. Windows XP Shell Tokens

### 9.1 Complete CSS Token Map

```css
:root {
  /* Colors */
  --xp-titlebar-top: #0A246A;
  --xp-titlebar-bottom: #3A6EA5;
  --xp-titlebar-text: #FFFFFF;
  --xp-window-bg: #ECE9D8;
  --xp-desktop-bg: #3A6EA5;
  --xp-taskbar: #245EDC;
  --xp-taskbar-item: #3A6EA5;
  --xp-taskbar-item-active: #1A4CB5;
  --xp-button-face: #ECE9D8;
  --xp-button-highlight: #FFFFFF;
  --xp-button-shadow: #ACA899;
  --xp-button-dark-shadow: #716F64;
  --xp-highlight: #316AC5;
  --xp-highlight-text: #FFFFFF;
  --xp-text: #000000;
  --xp-text-disabled: #ACA899;
  --xp-link: #0000FF;
  --xp-scrollbar: #D4D0C8;
  --xp-scrollbar-track: #F0F0F0;
  --xp-sunken-bg: #FFFFFF;
  --xp-tooltip-bg: #FFFFE1;
  --xp-close-btn-hover: #E81123;

  /* Typography */
  --xp-font: Tahoma, 'MS Sans Serif', Geneva, sans-serif;
  --xp-font-size: 11px;
  --xp-font-size-lg: 14px;
  --xp-font-size-title: 12px;
  --xp-font-size-small: 10px;

  /* Spacing */
  --xp-space-1: 2px;
  --xp-space-2: 4px;
  --xp-space-3: 8px;
  --xp-space-4: 12px;
  --xp-space-5: 16px;
  --xp-space-6: 24px;
  --xp-space-7: 32px;
  --xp-window-padding: 8px;
  --xp-control-padding: 4px 12px;

  /* Borders */
  --xp-border-width: 2px;
  --xp-border-radius: 0px;
  --xp-titlebar-height: 24px;
  --xp-taskbar-height: 30px;

  /* Shadows */
  --xp-shadow-raised: inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #ACA899;
  --xp-shadow-sunken: inset 1px 1px 0 #716F64, inset -1px -1px 0 #FFFFFF;

  /* Gradients */
  --xp-titlebar-gradient: linear-gradient(180deg, var(--xp-titlebar-top) 0%, var(--xp-titlebar-bottom) 100%);
  --xp-taskbar-gradient: linear-gradient(180deg, #245EDC 0%, #1A4CB5 100%);
}

.theme-silver {
  --xp-titlebar-top: #848484;
  --xp-titlebar-bottom: #AAAAAA;
  --xp-desktop-bg: #848484;
  --xp-taskbar: #A0A0A0;
  --xp-close-btn-hover: #B00000;
}

.theme-olive {
  --xp-titlebar-top: #6B6B3C;
  --xp-titlebar-bottom: #8B8B5C;
  --xp-desktop-bg: #6B6B3C;
  --xp-taskbar: #6B6B3C;
  --xp-close-btn-hover: #B00000;
}
```

---

## 10. Top-Down Sandbox World Design

### 10.1 Visual Style

- Perspective: True top-down (orthographic), not isometric
- Resolution: 320x240 pixel art (scaled 3-4x for display)
- Tile size: 16x16 pixels
- Character size: 16x24 pixels (4-directional frames)
- Color palette: 16-32 colors per tile
- Rendering: Y-sorting for depth

### 10.2 Tile Types and Colors

| Tile | Hex | Description |
|------|-----|-------------|
| Grass | `#5ABE5A` / `#4DA64D` | Bright green |
| Dirt | `#C47D4A` / `#B06E3C` | Brown tones |
| Path | `#BF9B7A` | Lighter brown |
| Sand | `#E8D5A3` | Beach/desert |
| Water | `#4A90D9` / `#2C6BB8` | Blue |
| Stone | `#9C9C9C` / `#8A8A8A` | Gray |
| Snow | `#F0F0F0` / `#E0E0E0` | White |
| Farmland | `#6B4423` / `#8B5E3C` | Tilled soil |
| Cave Floor | `#4A4A4A` / `#3C3C3C` | Dark stone |

### 10.3 Player Sprite Specifications

- Frames per direction: 3 (idle, walk1, walk2)
- Directions: down, left, right, up
- Total frames: 12 (4 directions x 3 frames)
- Frame size: 16x24 pixels
- Animations: walk cycle at 4-6 fps

### 10.4 Game HUD Design

- HUD rendered in Press Start 2P at 8px (scaled to ~16px)
- Hearts for health, horizontal layout
- Star for score, circle for coins
- Hotbar: 8 slots, selected slot highlighted with XP-style selection
- Chat input at bottom

---

## 11. Accessibility Considerations

| Requirement | Implementation |
|------------|----------------|
| Color contrast | All text meets WCAG AA 4.5:1 minimum |
| Focus indicators | Dotted outline on focused elements (XP-style) |
| Keyboard navigation | Tab through windows, Enter to activate, Escape to close |
| Screen reader labels | Icon buttons have aria-label; window titles announced |
| Reduced motion | prefers-reduced-motion disables window animations |
| Touch targets | Minimum 44x44px for interactive elements on touch devices |
| Font scaling | Minimum 11px for readability |
| Color not only indicator | Status indicators use icon + text + color |
| Game accessibility | Remappable keys, colorblind-friendly palette option |

### Contrast Reference

| Pair | Ratio | Passes AA? |
|------|-------|-----------|
| `#000000` on `#ECE9D8` | 17.5:1 | Yes |
| `#000000` on `#FFFFFF` | 21:1 | Yes |
| `#FFFFFF` on `#0A246A` | 15.3:1 | Yes |
| `#FFFFFF` on `#3A6EA5` | 5.8:1 | Yes |
| `#ACA899` on `#ECE9D8` | 2.3:1 | No (disabled text, acceptable exception) |
| `#FFFFFF` on `#245EDC` | 5.1:1 | Yes |

---

> Document Status: v1.0
> This document is the source of truth for all visual design decisions in RetroMap.
