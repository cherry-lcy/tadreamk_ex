# 🎮 Play with Object

> An interactive shape editor built with React featuring drag, resize, rotate, and an expressive animated face.

[![Made with React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Live Demo

[Click here for live demo](https://your-demo-link.com) *(Add your deployment link)*

## 📋 Table of Contents

- [Features](#features)
- [Supported Object Types & Modifications](#supported-object-types--modifications)
- [Installation & Setup](#installation--setup)
- [How to Use](#how-to-use)
- [Technical Architecture](#technical-architecture)
- [Known Issues](#known-issues)
- [Browser Compatibility](#browser-compatibility)
- [AI Usage Disclosure](#ai-usage-disclosure)
- [License](#license)

---

## 🚀 Features

| Category | Capabilities |
|----------|--------------|
| **Transform** | Drag to move, corner handles to resize, top knob to rotate |
| **Styling** | Fill color, border color, border toggle, drop shadow |
| **Shape** | Rectangle, Circle, Triangle (switch anytime) |
| **Flip** | Horizontal flip ↔️, Vertical flip ↕️ |
| **Context Menu** | Right-click shape for quick property changes |
| **Animated Face** | Eyes follow mouse cursor, mouth changes with interaction |
| **Visual Feedback** | Real-time property updates, emotion indicator |

---

## 🎨 Supported Object Types & Modifications

| Object Type | Move | Resize | Rotate | Recolor | Border | Shadow | Flip H | Flip V |
|-------------|:----:|:------:|:------:|:-------:|:------:|:------:|:------:|:------:|
| **Rectangle** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Circle** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Triangle** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Face Expression Mapping

| User Action | Face Expression |
|-------------|-----------------|
| Dragging (moving) | 😟 Unhappy (downturned mouth) |
| Resizing / Rotating | 😄 Happy (upturned smile) |
| Idle | 😐 Neutral smile |

Eyes continuously track mouse cursor position relative to shape center.

---

## 🛠 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/play-with-object.git
cd play-with-object

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173` (or the port shown in terminal).

### Build for Production

```bash
npm run build
```

## 🖱️ How to Use

### Basic Interactions

| Action | How To |
|--------|--------|
| **Move** | Click and drag anywhere inside the shape |
| **Resize** | Click and drag any white corner circle |
| **Rotate** | Click and drag the orange top knob |
| **Change Shape** | Use toolbar dropdown or right-click → shape menu |
| **Change Color** | Toolbar color pickers or right-click menu |
| **Toggle Border** | Toolbar button or right-click → Toggle Border |
| **Toggle Shadow** | Toolbar button or right-click → Toggle Shadow |
| **Flip** | Toolbar buttons or right-click menu |

### Toolbar Controls

Located at the top of the screen:

- Shape selector (Rectangle / Circle / Triangle)
- Fill color picker
- Border color picker
- Border ON/OFF button
- Shadow toggle
- Horizontal Flip button
- Vertical Flip button

Right-click on the shape to access:

- Shape type selection
- Fill color presets (Coral, Mint, Ocean, Salmon, Gold)
- Border color presets (Black, White)
- Toggle Border
- Toggle Shadow
- Flip Horizontal / Vertical

### Visual Feedback

- Bottom-right corner shows current emotion state
- Shape face updates mouth expression based on action
- Eyes follow your mouse cursor around the screen

---

## 🧱 Technical Architecture

### Component Structure
App (main)
├── Toolbar (controls)
├── SVG Canvas
│   ├── Grid background
│   └── Interactive Shape Group
│       ├── Shape (rect/circle/triangle)
│       ├── Face (eyes + mouth)
│       ├── Resize handles (4 corners)
│       └── Rotate handle (top center)
└── Context Menu (conditional render)

## Core Utilities

| Function | Purpose |
|----------|---------|
| `rotatePoint(x, y, cx, cy, rad)` | Rotates a point around a center |
| `isPointInRotatedRect(px, py, rect)` | Hit test for rotated shapes |
| `getHandleAt(px, py, rect)` | Detects which resize handle was clicked |

## State Management

All state managed via React `useState` hooks:

- Shape properties (type, color, border, shadow, flip)
- Transform properties (x, y, width, height, rotation)
- Interaction flags (isDragging, activeHandle, rotateActive)
- UI state (contextMenuVisible, emotion, mousePos)

## Event Handling Flow
## 🔄 Interaction Flow
MouseDown on shape/handle
↓
Set interaction flags + store initial state
↓
MouseMove → Update transform based on interaction type
↓
MouseUp → Clear flags, reset to idle


## ⚠️ Known Issues

| Issue | Description | Workaround |
|-------|-------------|------------|
| Context menu closes on click inside | The global click listener closes menu even when clicking menu options | Click options quickly or use toolbar buttons instead |
| Triangle flip bounding box | Flip transforms are applied around center but triangle geometry may appear offset | Minor visual only, functionality unaffected |
| Rotation + Flip combination | Applying both rotation and flip can produce unexpected orientation | Reset rotation before flipping, or flip before rotating |
| Minimum size limit | Shapes cannot be smaller than 40x40 pixels | Prevents handles from becoming unusable |
| Touch devices | Not optimized for touch gestures | Use mouse/trackpad for full functionality |
| Eye tracking on resize | Eye movement calculation uses screen coordinates, may lag during fast resize | Normal behavior, resolves when resize ends |

## 🌐 Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Google Chrome | 90+ | ✅ Fully supported |
| Mozilla Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Microsoft Edge | 90+ | ✅ Fully supported |
| Opera | 76+ | ✅ Fully supported |

> **Note:** Requires JavaScript enabled. No additional plugins required.

## 🤖 AI Usage Disclosure

This project was developed with responsible use of AI coding assistants.

### AI Tools Used
- **GitHub Copilot / Deepseek** - For code completion, debugging assistance, and generating boilerplate

### What Was Verified Manually
- **Coordinate transformation logic** - All geometry functions (`rotatePoint`, `isPointInRotatedRect`) were tested with multiple rotation angles
- **Event handler cleanup** - Verified `removeEventListener` prevents memory leaks
- **Resize handle behavior** - Manual testing confirmed correct anchor points for each corner
- **Face animation** - Verified eye tracking and mouth expressions respond correctly to interactions
- **Cross-browser testing** - Manual testing on Chrome, Firefox, and Safari

### Code Written Without AI Assistance
- State management structure and custom hooks
- SVG rendering logic and conditional styling
- Flip transform implementation (debugged manually)
- Emotion-to-expression mapping

The AI was used as a productivity tool, but all final code was reviewed, understood, and modified as needed before inclusion.
