# 6561 游戏 - 原生 Android 构建指南

## 环境要求

- Android Studio Hedgehog (2024.1.1) 或更新版本
- Java JDK 17
- Android SDK 35+

## 构建方法

### 使用 Android Studio

1. 打开 Android Studio
2. 选择 **Open an Existing Project**
3. 选择 `android/` 目录
4. 等待 Gradle 同步完成
5. 点击 **Run** 按钮运行，或 **Build → Build APK**

### 使用命令行

```bash
cd android
./gradlew assembleDebug
```

APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### Release 构建

```bash
./gradlew assembleRelease
```

## 应用信息

- **应用名称**: 6561
- **包名**: com.game6561.app
- **最低 Android 版本**: Android 8.0 (API 26)
- **技术栈**: Kotlin + Jetpack Compose

## 项目结构

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/game6561/app/
│   │   │   ├── game/          # 游戏核心逻辑
│   │   │   ├── ui/            # Compose UI 组件
│   │   │   ├── data/          # 数据持久化
│   │   │   ├── sound/         # 音效系统
│   │   │   ├── GameViewModel.kt
│   │   │   └── MainActivity.kt
│   │   └── res/               # 资源文件
│   ├── build.gradle.kts
│   └── proguard-rules.pro
├── build.gradle.kts
├── settings.gradle.kts
└── gradlew
```
