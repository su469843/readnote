# Project Instructions — ReadNote

This file provides context for AI assistants working on this project.

## Project Type

React Native 0.86 (Old Architecture, JSC), TypeScript, Zustand, SQLite.

### Commands
- Install: `npm install`
- Test: `npm test`
- Build (Android): `cd android && ./gradlew assembleRelease`
- Start Metro: `npx react-native start`

### Branches
- `beta` — 开发/预发布分支，所有修复和功能先合入这里
- `master` — 正式版分支（暂未启用）

### Versioning
- Tag 格式: v&lt;major&gt;.&lt;minor&gt;.&lt;patch&gt;[-beta.&lt;N&gt;]
- 每次发布前在 publish/CHANGELOG.md 写入版本详情
- CI 自动从 CHANGELOG 提取内容作为 Release body

## 关键决策记录

| 日期 | 决策 |
|------|------|
| 2026-07-04 | 改为 JSC 引擎（hermesEnabled=false），解决华为平板 SIGABRT 问题 |
| 2026-07-04 | 启用 ABI splits，按架构拆包（arm64-v8a / armeabi-v7a / x86_64 / x86） |
| 2026-07-04 | 发布流程: 打 tag → CI 构建 → 自动上传 Release + 从 CHANGELOG 生成 body |

## 架构说明

- **引擎**: JSC（已从 Hermes 切换）
- **架构**: Old Architecture（newArchEnabled=false）
- **导航**: @react-navigation/native-stack
- **状态管理**: Zustand
- **数据库**: react-native-sqlite-storage
- **PDF**: react-native-pdf
- **SVG**: react-native-svg
- **TTS**: Edge TTS (OpenAI 兼容 API) / Android 原生 TTS

## 修复记录

1. **数据库未初始化 → 未处理的 Promise rejection**: 所有 async 函数必须有 try/catch
2. **Hermes native abort (SIGABRT in mqt_v_js)**: 华为平板兼容性问题，切 JSC
3. **route.params 解构 undefined**: 导航参数必须加 ?? {} 保护
4. **动画组件卸载后 native driver 继续运行**: useEffect 必须 return () =&gt; animation.stop()
5. **SVG 空 path / 非法坐标**: buildPathData 必须过滤 isFinite 坐标

## 内存优化

- FlatList: windowSize=5, removeClippedSubviews=true
- 笔记列表查询: LIMIT 100, substr(content,1,200)
- PDF 页面离开时释放 annotationData
- PanResponder 用 useRef 固定实例

## MEMORY.md

项目根目录下有 MEMORY.md（被 .gitignore 忽略），记录最近一次 AI 会话的详细上下文。
