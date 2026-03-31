# 6561

A puzzle game where you merge three identical numbers to reach 6561. A variant of the popular 2048 game.

## 🎮 How to Play

- **Goal**: Merge tiles to reach the **6561** tile!
- **Controls**: Use arrow keys, WASD, or swipe (on touch devices) to move all tiles
- **Merge Rule**: Three identical numbers merge into the next power of 3
  - 3 + 3 + 3 → 9
  - 9 + 9 + 9 → 27
  - 27 + 27 + 27 → 81
  - ... continue until you reach 6561!

## ✨ Features

- 🎯 Classic 6×6 grid gameplay
- 📱 Responsive design for mobile and desktop
- 📲 PWA support - install and play offline
- 💾 Auto-save game progress
- 🏆 High score tracking
- ⏱️ Move counter and timer
- 🌙 Dark/Light theme toggle
- 🔊 Sound effects with mute option
- ↶ Undo moves (up to 10)
- 🎨 Smooth animations and clean UI
- 📊 Game statistics on game over

## 🚀 Quick Start

### Play Online

Simply open `index.html` in your browser.

### Install as PWA

1. Open the page in a modern browser (Chrome, Edge, Safari)
2. Click the "Install" or "Add to Home Screen" button
3. Launch the app from your home screen and play offline!

### Local Development

```bash
# Clone or download the repository
cd 6561

# Install dependencies
npm install

# Start local server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## 🎮 Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Move tiles | Arrow Keys / WASD | Swipe |
| Undo | Ctrl+Z / Cmd+Z | Tap Undo button |
| New Game | - | Click "New Game" |
| Toggle Theme | - | Click "Dark/Light" |
| Toggle Sound | - | Click "On/Off" |

## 📁 Project Structure

```
6561/
├── index.html          # Main game file
├── styles.css          # Styles with theme support
├── game.js             # Game logic and rendering
├── sw.js               # Service Worker for offline support
├── manifest.json       # PWA manifest
├── icon-192.png        # PWA icon (192x192)
├── icon-512.png        # PWA icon (512x512)
├── scripts/
│   └── minify.js       # Build script
├── tests/
│   └── game.test.js    # Unit tests
├── www/                # Production build output
├── android/            # Android app (Capacitor)
└── README.md           # This file
```

## 🛠️ Tech Stack

- Pure HTML, CSS, and JavaScript - no framework dependencies
- Progressive Web App (PWA) enabled
- Service Worker for offline support
- Vitest for unit testing
- ESLint & Prettier for code quality
- Capacitor for Android builds

## 📱 Android Build

See [ANDROID_BUILD.md](ANDROID_BUILD.md) for detailed Android build instructions.

## 🧪 Running Tests

```bash
# Run tests once
npm test

# Watch mode for development
npm run test:watch
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start local development server |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint JavaScript files |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run build` | Build for production |
| `npm run capacitor:sync` | Sync with Android project |

## 🎯 Game Rules

1. **Three-tile merge**: Unlike 2048 which merges pairs, 6561 requires **three** identical tiles to merge
2. **Power of 3**: Each merge produces the next power of 3 (3→9→27→81→243→729→2187→6561)
3. **Game over**: The game ends when no more moves are possible (grid is full and no merges available)
4. **Win condition**: Create a tile with the value 6561

## 💾 Save System

- Game state is automatically saved after each move
- Progress persists across browser sessions
- High scores are stored in localStorage
- To reset: Clear browser data for this site

## ⚙️ Settings

| Setting | Storage Key | Values |
|---------|-------------|--------|
| Theme | `theme6561` | `light`, `dark` |
| Sound | `sound6561` | `true`, `false` |
| Tutorial | `tutorial6561` | `true`, `false` |
| Best Score | `best6561` | Number |
| Game State | `gameState6561` | JSON object |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Lint code: `npm run lint`
6. Submit a pull request

## 📄 License

ISC License

## 🙏 Acknowledgments

- Inspired by the popular 2048 game by Gabriele Cirulli
- Built with pure vanilla JavaScript for maximum performance and zero dependencies
