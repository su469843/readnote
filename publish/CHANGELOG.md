# ReadNote Changelog

## v1.4.0-beta.1 (2026-07-05)

### 下载

根据设备 CPU 架构选择对应 APK：

| 架构 | 适用设备 |
|------|---------|
| arm64-v8a | 主流手机/平板（推荐） |
| armeabi-v7a | 老旧设备 |
| x86_64 | 模拟器 / Intel 平板 |
| x86 | 老旧模拟器 |

### 闪退修复

- HomeScreen: loadNotes / handleCreateNote / handleDeleteNote 添加 try/catch，防止数据库未初始化时白屏闪退
- NoteDetailScreen: loadNote / saveNote 添加 try/catch
- SettingsScreen: handleSave 异步保存添加 try/catch
- PDFViewerScreen: route.params undefined 保护；handleAnnotationAdd / handleClearAnnotations 添加 catch
- Sidebar: 动画组件卸载时 stop()，防止 native 驱动层 dangling reference 导致闪退
- AnnotationLayer: SVG 空 path 防御 + 非法坐标过滤，防止 react-native-svg native crash

### TTS 修复

- 替换 response.blob() + FileReader（Hermes 引擎不支持的 Web API）
- 改用 XMLHttpRequest + arraybuffer + btoa() 方案

### 引擎切换

- 从 Hermes 切换到 JSC，解决华为平板上的 Hermes native abort（SIGABRT in mqt_v_js）
- 影响：APK 体积略有增加，但兼容性更稳定

### 构建优化

- 按 CPU 架构拆分 APK（ABI splits），每个安装包只带对应架构的 so 库
- 安装包体积更小，内存占用更低

### 内存优化

- FlatList: 虚拟化参数调优（windowSize=5, maxToRenderPerBatch=5, removeClippedSubviews）
- 数据库列表查询: LIMIT 100, content 只取前 200 字符
- PDF 页面离开时释放标注数据
- PanResponder 改为 useRef 固定实例，消除闭包陷阱
