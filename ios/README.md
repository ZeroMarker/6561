# 6561 Game - iOS Native (SwiftUI)

## Building & Running

### Prerequisites

- macOS with Xcode 16+
- [XcodeGen](https://github.com/yonaskolb/XcodeGen)（用于生成 Xcode 工程）

### Setup

```bash
cd ios
xcodegen generate        # 生成 Game6561.xcodeproj
open Game6561.xcodeproj  # 打开 Xcode
```

然后在 Xcode 中选择目标设备/模拟器，按 **⌘R** 运行。

> 说明：`Game6561.xcodeproj` 由 XcodeGen 从 `project.yml` 生成，不直接提交到仓库。

### Project Structure

```
ios/
├── project.yml                # XcodeGen 配置（生成工程）
├── Game6561/
│   ├── Game6561App.swift      # App entry point
│   ├── ContentView.swift      # Main game screen
│   ├── Info.plist             # App configuration
│   ├── LaunchScreen.storyboard
│   ├── Assets.xcassets        # Asset catalog
│   ├── Game/
│   │   ├── GameState.swift    # Data models
│   │   └── GameEngine.swift   # Game logic (merge, slide, etc.)
│   ├── Data/
│   │   └── GamePreferences.swift # UserDefaults persistence
│   ├── Sound/
│   │   └── SoundManager.swift # AVAudioEngine sound synthesis
│   ├── ViewModel/
│   │   └── GameViewModel.swift # ObservableObject state manager
│   └── Views/
│       ├── GameBoardView.swift # Swipeable 6×6 tile grid
│       ├── ScoreBoardView.swift
│       ├── ControlBarView.swift
│       ├── OverlayView.swift   # Win/GameOver overlays
│       ├── SettingsView.swift
│       ├── StatsView.swift
│       └── TutorialView.swift
└── README.md
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

## CI 自动构建与发布

打 tag（`v*`）时 CI 会自动构建并发布：

- **iOS Simulator App**（`Game6561-simulator.zip`，无签名）：解压后将 `Game6561.app` 拖入模拟器即可安装运行
- **真机 ipa**：当前 CI 未配置 Apple 签名证书，因此不产出真机安装包。如需真机安装：
  1. 在 Xcode 中打开 `Game6561.xcodeproj`，配置你的 Team 与签名
  2. `Product → Archive` 导出 ipa（或 ad-hoc 分发）
  3. 后续如需在 CI 自动签名，可参考 [apple-actions/import-codesigning-certs](https://github.com/apple-actions/import-codesigning-certs) 配置证书 secrets 后追加 `xcodebuild -exportArchive` 步骤
