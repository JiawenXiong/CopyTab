# CopyTab

中文版 | [English](README_EN.md)

一个简单实用的 Chrome 扩展，通过快捷键快速复制当前网页的标题和链接。

![CopyTab Logo](icons/icon128.png)

## ✨ 功能特性

- ⌨️ **快捷键操作**：使用 `Alt+C` 快捷键快速复制
- 📋 **多种格式支持**：支持普通格式和 Markdown 格式
- 🚫 **排除网站**：支持添加排除网站，支持通配符批量屏蔽
- ⚡ **快速响应**：无需等待页面完全加载即可复制
- 🎨 **视觉反馈**：复制成功后图标变为绿色勾
- ⚙️ **可配置**：在弹窗中轻松配置所有设置

## 📦 安装方法

### 从源码安装

1. 下载或克隆此仓库
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `copytab` 文件夹

## 🎯 使用方法

### 基本使用

1. 在任意网页上按 `Alt+C` 快捷键
2. 网页标题和链接会自动复制到剪贴板

### 复制格式

支持两种复制格式：

**普通格式：**
```
网页标题
https://example.com
```

**Markdown 格式：**
```
[网页标题](https://example.com)
```

### 配置设置

点击扩展图标打开配置页面，可以：

- **修改快捷键**：点击"修改快捷键"按钮跳转到浏览器快捷键设置
- **选择复制格式**：选择普通格式或 Markdown 格式
- **管理排除网站**：添加或删除不需要触发复制功能的网站

### 通配符支持

排除网站支持通配符 `*`，可以批量屏蔽网站：

- `https://*.google.com` - 屏蔽所有 google 子域名
- `https://example.com/*` - 屏蔽 example.com 的所有路径
- `*://*.internal.com` - 屏蔽 internal.com 的所有协议和子域名

## 🛠️ 开发

### 项目结构

```
copytab/
├── manifest.json          # 扩展配置文件
├── background.js          # 后台脚本
├── options.html           # 配置页面
├── options.css            # 配置页面样式
├── options.js             # 配置页面逻辑
├── icons/                 # 图标文件
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon16-success.png
│   ├── icon32-success.png
│   ├── icon48-success.png
│   └── icon128-success.png
└── README.md             # 项目说明
```

### 技术栈

- **Manifest V3**：最新的 Chrome 扩展标准
- **JavaScript**：纯原生 JavaScript，无依赖
- **CSS3**：现代化样式设计
- **Chrome APIs**：
  - `chrome.commands` - 快捷键管理
  - `chrome.tabs` - 标签页操作
  - `chrome.scripting` - 脚本注入
  - `chrome.storage` - 配置存储
  - `chrome.action` - 扩展图标操作

## 📝 配置说明

所有配置保存在 `chrome.storage.sync` 中，会自动同步到使用相同 Google 账号的设备。

### 配置项

- `excludedSites`：排除网站列表（数组）
- `copyFormat`：复制格式（`plain` 或 `markdown`）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有使用和贡献此项目的用户！

---

**CopyTab** - 让复制变得更简单！