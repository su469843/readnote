# ReadNote

一款基于 React Native 的笔记应用，支持 PDF 标注和 TTS 语音朗读。

## 功能

- 📝 笔记创建/编辑/删除
- 📄 PDF 文件标注（手绘标记）
- 🔊 TTS 语音朗读（支持 Edge TTS 云端 / Android 原生 TTS / Web Speech）
- ⚙️ 设置管理（TTS 端点、语音角色）

## 技术栈

- React Native 0.86 (Hermes + Old Architecture)
- TypeScript
- Zustand 状态管理
- SQLite 本地存储
- react-native-fs 文件系统
- react-native-pdf PDF 渲染
- react-native-svg SVG 标注层

## 开始使用

```bash
# 安装依赖
npm install

# 进入 iOS 目录安装 Pod
cd ios && pod install && cd ..

# 启动 Metro
npx react-native start

# 运行 Android
npx react-native run-android

# 运行 iOS
npx react-native run-ios
```

## 构建 APK

```bash
cd android
./gradlew assembleRelease
```

## 项目结构

```
src/
├── components/         # UI 组件
│   ├── AnnotationLayer.tsx   # PDF 标注层
│   ├── NoteCard.tsx          # 笔记卡片
│   └── TTSButton.tsx         # TTS 朗读按钮
├── screens/            # 页面
│   ├── HomeScreen.tsx
│   ├── NoteDetailScreen.tsx
│   ├── PDFViewerScreen.tsx
│   └── SettingsScreen.tsx
├── store/              # 全局状态
│   └── useStore.ts
├── types/              # TypeScript 类型
│   └── index.ts
└── utils/              # 工具函数
    ├── database.ts     # SQLite 数据库
    ├── fileManager.ts  # 文件系统管理
    ├── settings.ts     # 设置持久化
    └── ttsManager.ts   # TTS 语音管理
```
