# 6561 Game - iOS Native (SwiftUI)

## Building & Running

### Prerequisites
- Xcode 16+ 
- iOS 17+ target device or simulator

### Setup

1. Open Xcode
2. Select **File → Open** and choose `ios/Game6561/` directory
3. Xcode will automatically detect the Swift files and set up the project
4. Select your target device/simulator
5. Press **⌘R** to build and run

### Project Structure

```
ios/Game6561/
├── Game6561App.swift          # App entry point
├── ContentView.swift          # Main game screen
├── Info.plist                 # App configuration
├── Game/
│   ├── GameState.swift        # Data models
│   └── GameEngine.swift       # Game logic (merge, slide, etc.)
├── Data/
│   └── GamePreferences.swift  # UserDefaults persistence
├── Sound/
│   └── SoundManager.swift     # AVAudioEngine sound synthesis
├── ViewModel/
│   └── GameViewModel.swift    # ObservableObject state manager
└── Views/
    ├── GameBoardView.swift    # Swipeable 6×6 tile grid
    ├── ScoreBoardView.swift   # Score/Best/Moves/Time
    ├── ControlBarView.swift   # Action buttons
    ├── OverlayView.swift      # Win/GameOver overlays
    ├── SettingsView.swift     # Settings dialog
    ├── StatsView.swift        # Statistics dialog
    └── TutorialView.swift     # Welcome tutorial
```

## Features

- Native SwiftUI with dark/light theme support
- Swipe gestures and hardware keyboard support (iPad)
- Sound effects via AVAudioEngine (sine/sawtooth synthesis)
- Haptic feedback on merges
- Game state persistence via UserDefaults
- Game statistics tracking
- Undo support (up to 10 moves)
- Combo scoring system
