# CopyTab

[中文版](README.md) | English

A simple and practical Chrome extension for quickly copying the current webpage's title and URL using keyboard shortcuts.

![CopyTab Logo](icons/icon128.png)

## ✨ Features

- ⌨️ **Keyboard Shortcut**: Quick copy with `Alt+C` shortcut
- 📋 **Multiple Formats**: Support for plain text and Markdown formats
- 🚫 **Exclude Websites**: Add websites to exclude, with wildcard support for bulk blocking
- ⚡ **Fast Response**: Works even before the page fully loads
- 🎨 **Visual Feedback**: Icon turns to a green checkmark when copy succeeds
- ⚙️ **Configurable**: Easily configure all settings in the popup

## 📦 Installation

### Install from Source

1. Download or clone this repository
2. Open Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `copytab` folder

## 🎯 Usage

### Basic Usage

1. Press `Alt+C` shortcut on any webpage
2. The webpage title and URL will be automatically copied to clipboard

### Copy Formats

Supports two copy formats:

**Plain Format:**
```
Page Title
https://example.com
```

**Markdown Format:**
```
[Page Title](https://example.com)
```

### Configuration Settings

Click the extension icon to open the configuration page where you can:

- **Change Shortcut**: Click "Modify Shortcut" to go to browser shortcut settings
- **Select Copy Format**: Choose between plain text or Markdown format
- **Manage Excluded Websites**: Add or remove websites where you don't want copy to trigger

### Wildcard Support

Excluded websites support the `*` wildcard for bulk blocking:

- `https://*.google.com` - Block all google subdomains
- `https://example.com/*` - Block all paths on example.com
- `*://*.internal.com` - Block all protocols and subdomains of internal.com

## 🛠️ Development

### Project Structure

```
copytab/
├── manifest.json          # Extension configuration
├── background.js          # Background script
├── options.html           # Configuration page
├── options.css            # Configuration page styles
├── options.js             # Configuration page logic
├── icons/                 # Icon files
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon16-success.png
│   ├── icon32-success.png
│   ├── icon48-success.png
│   └── icon128-success.png
└── README.md             # Project documentation
```

### Tech Stack

- **Manifest V3**: Latest Chrome extension standard
- **JavaScript**: Pure vanilla JavaScript, no dependencies
- **CSS3**: Modern styling
- **Chrome APIs**:
  - `chrome.commands` - Shortcut management
  - `chrome.tabs` - Tab operations
  - `chrome.scripting` - Script injection
  - `chrome.storage` - Configuration storage
  - `chrome.action` - Extension icon operations

## 📝 Configuration

All configurations are saved in `chrome.storage.sync` and will automatically sync to devices using the same Google account.

### Configuration Items

- `excludedSites`: Excluded websites list (array)
- `copyFormat`: Copy format (`plain` or `markdown`)

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

Thanks to all users who use and contribute to this project!

---

**CopyTab** - Make copying easier!