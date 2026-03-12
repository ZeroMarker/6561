# 6561

A puzzle game where you merge three identical numbers to reach 6561. A variant of the popular 2048 game.

## How to Play

- **Goal**: Merge tiles to reach the 6561 tile!
- **Controls**: Use arrow keys, WASD, or swipe (on touch devices) to move all tiles in one direction
- **Merge Rule**: Three identical numbers merge into the next power of 3
  - 3 + 3 + 3 → 9
  - 9 + 9 + 9 → 27
  - 27 + 27 + 27 → 81
  - ... continue until you reach 6561!

## Features

- 🎮 Classic 6×6 grid gameplay
- 📱 Responsive design for mobile and desktop
- 📲 PWA support - install and play offline
- 💾 Local storage for high scores
- 🎨 Smooth animations and clean UI

## Tech Stack

- Pure HTML, CSS, and JavaScript - no dependencies
- Progressive Web App (PWA) enabled
- Service Worker for offline support

## Installation

### Play Online

Simply open `index.html` in your browser.

### Install as PWA

1. Open the page in a modern browser (Chrome, Edge, Safari)
2. Click the "Install" or "Add to Home Screen" button
3. Launch the app from your home screen and play offline!

### Local Development

```bash
# Clone or download the repository
# Open index.html in your browser
# Or serve with a local server
npx serve .
```

## Project Structure

```
6561/
├── index.html      # Main game file
├── manifest.json   # PWA manifest
├── sw.js           # Service Worker for offline support
├── icon-192.png    # PWA icon (192x192)
├── icon-512.png    # PWA icon (512x512)
└── README.md       # This file
```

## License

MIT License
