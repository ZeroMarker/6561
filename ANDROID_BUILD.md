# 6561 游戏 - Android 构建指南

## 项目结构

```
6561/
├── www/                 # Web 资源 (HTML/CSS/JS)
├── android/             # Android 原生项目 (用 Android Studio 打开)
├── capacitor.config.json
└── ...
```

## 环境要求

### 1. 安装 Java JDK 17
- 下载：https://www.oracle.com/java/technologies/downloads/
- 安装后设置环境变量：
  ```
  JAVA_HOME = C:\Program Files\Java\jdk-17
  ```

### 2. 安装 Android Studio
- 下载：https://developer.android.com/studio
- 安装后打开 **SDK Manager**，安装：
  - Android SDK Platform (API 33 或更高)
  - Android SDK Build-Tools
  - Android SDK Command-line Tools

设置环境变量：
```
ANDROID_HOME = C:\Users\你的用户名\AppData\Local\Android\Sdk
```

## 构建方法

### 方法一：使用命令行

```bash
cd E:\6561\android
gradlew assembleDebug
```

生成的 APK 位置：
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### 方法二：使用 Android Studio（推荐）

1. 打开 **Android Studio**
2. 选择 **Open an Existing Project**
3. 选择 `E:\6561\android` 目录
4. 等待 Gradle 同步完成
5. 点击菜单 **Build → Build Bundle(s) / APK(s) → Build APK(s)**
6. APK 生成后会显示通知，点击 **locate** 查看文件

## 发布版本（Release APK）

```bash
cd E:\6561\android
gradlew assembleRelease
```

## 在真机上运行

1. 启用手机的 **开发者选项** 和 **USB 调试**
2. 用 USB 连接电脑
3. 在 Android Studio 中点击 **Run** 按钮（绿色三角形）
4. 或在命令行运行：`gradlew installDebug`

## 应用信息

- **应用名称**: 6561
- **包名**: com.game6561.app
- **版本**: 1.0
- **最低 Android 版本**: Android 5.0 (API 21)

## 常见问题

### 错误：JAVA_HOME is not set
设置 JAVA_HOME 环境变量指向 JDK 安装目录

### 错误：SDK not found
设置 ANDROID_HOME 环境变量，或在 Android Studio 中配置 SDK 路径

### 错误：Gradle sync failed
打开 Android Studio，让 Gradle 自动同步，或点击 **File → Sync Project with Gradle Files**
