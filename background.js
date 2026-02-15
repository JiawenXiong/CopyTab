// 存储键名
const STORAGE_KEY = 'excludedSites';
const COPY_FORMAT_KEY = 'copyFormat';

// 默认排除网站列表
const DEFAULT_EXCLUDED_SITES = [
  'chrome://',
  'chrome-extension://',
  'edge://',
  'about:',
  'opera://',
  'brave://',
  'vivaldi://'
];

// 复制格式枚举
const COPY_FORMAT = {
  PLAIN: 'plain',        // 普通格式：标题换行链接
  MARKDOWN: 'markdown',  // Markdown格式：[标题](链接)
  MARKDOWN_LINK: 'markdown-link'  // Markdown链接格式：[标题](链接)（带标题）
};

// 当前排除网站列表
let excludedSites = [...DEFAULT_EXCLUDED_SITES];

// 当前复制格式
let copyFormat = COPY_FORMAT.PLAIN;

// 图标配置
const ICONS = {
  default: {
    '16': 'icons/icon16.png',
    '32': 'icons/icon32.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png'
  },
  success: {
    '16': 'icons/icon16-success.png',
    '32': 'icons/icon32-success.png',
    '48': 'icons/icon48-success.png',
    '128': 'icons/icon128-success.png'
  }
};

// 检查URL是否在排除列表中（支持通配符）
function isExcludedUrl(url) {
  return excludedSites.some(site => {
    // 如果包含通配符 *，使用正则表达式匹配
    if (site.includes('*')) {
      // 将通配符模式转换为正则表达式
      // 转义正则特殊字符（除了 *）
      const pattern = site
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
        .replace(/\*/g, '.*'); // 将 * 替换为 .*
      
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(url);
    }
    // 如果不包含通配符，使用前缀匹配
    return url.startsWith(site);
  });
}

// 根据格式格式化复制内容
function formatCopyContent(title, url, format) {
  switch (format) {
    case COPY_FORMAT.MARKDOWN:
      return `[${title}](${url})`;
    case COPY_FORMAT.MARKDOWN_LINK:
      return `[${title}](${url})`;
    case COPY_FORMAT.PLAIN:
    default:
      return `${title}\n${url}`;
  }
}

// 设置图标 - 兼容不同版本的Chrome
function setIcon(iconSet) {
  try {
    if (chrome.action && chrome.action.setIcon) {
      chrome.action.setIcon({ path: iconSet });
    } else if (chrome.browserAction && chrome.browserAction.setIcon) {
      chrome.browserAction.setIcon({ path: iconSet });
    }
  } catch (error) {
    console.error('设置图标失败:', error);
  }
}

// 检查标签页是否仍然有效
async function isTabValid(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    return tab && !tab.discarded;
  } catch (error) {
    console.log('标签页无效:', error.message);
    return false;
  }
}

// 从存储加载排除网站列表
function loadExcludedSites() {
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    if (result[STORAGE_KEY] && Array.isArray(result[STORAGE_KEY])) {
      excludedSites = result[STORAGE_KEY];
      console.log('已加载自定义排除列表:', excludedSites);
    } else {
      excludedSites = [...DEFAULT_EXCLUDED_SITES];
      console.log('使用默认排除列表:', excludedSites);
    }
  });
}

// 从存储加载复制格式
function loadCopyFormat() {
  chrome.storage.sync.get([COPY_FORMAT_KEY], (result) => {
    if (result[COPY_FORMAT_KEY] && Object.values(COPY_FORMAT).includes(result[COPY_FORMAT_KEY])) {
      copyFormat = result[COPY_FORMAT_KEY];
      console.log('已加载复制格式:', copyFormat);
    } else {
      copyFormat = COPY_FORMAT.PLAIN;
      console.log('使用默认复制格式:', copyFormat);
    }
  });
}

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    if (changes[STORAGE_KEY]) {
      excludedSites = changes[STORAGE_KEY].newValue;
      console.log('排除列表已更新:', excludedSites);
    }
    if (changes[COPY_FORMAT_KEY]) {
      copyFormat = changes[COPY_FORMAT_KEY].newValue;
      console.log('复制格式已更新:', copyFormat);
    }
  }
});

// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === 'copy-title-and-url') {
    copyTitleAndUrl();
  }
});

// 复制标题和URL
async function copyTitleAndUrl() {
  try {
    // 获取当前激活的标签页
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tabs || tabs.length === 0) {
      console.error('无法获取当前标签页信息');
      return;
    }
    
    const tab = tabs[0];
    
    if (!tab || !tab.url) {
      console.error('标签页信息不完整');
      return;
    }
    
    // 检查标签页是否仍然有效
    const isValid = await isTabValid(tab.id);
    if (!isValid) {
      console.error('标签页已关闭或无效');
      return;
    }
    
    // 检查URL是否在排除列表中
    if (isExcludedUrl(tab.url)) {
      console.log('当前网站在排除列表中，不执行复制操作');
      return;
    }
    
    // 准备复制的内容
    const title = tab.title || '无标题';
    const url = tab.url;
    const textToCopy = formatCopyContent(title, url, copyFormat);
    
    console.log('开始复制:', title, url);
    
    // 注入脚本到页面执行复制操作
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyToClipboard,
      args: [textToCopy]
    });
    
    if (result && result[0] && result[0].result) {
      console.log('复制成功');
      // 显示成功图标
      setIcon(ICONS.success);
      // 2秒后恢复默认图标
      setTimeout(() => {
        setIcon(ICONS.default);
      }, 2000);
    } else {
      console.error('复制失败: 返回结果无效');
    }
  } catch (error) {
    console.error('复制过程中出错:', error.message);
  }
}

// 在页面上下文中执行的复制函数 - 使用 document.execCommand 避免 navigator.clipboard 的授权问题
function copyToClipboard(text) {
  return new Promise((resolve) => {
    try {
      // 检查 document.body 是否存在
      if (!document.body) {
        console.error('document.body 不存在');
        resolve(false);
        return;
      }
      
      // 创建隐藏的 textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      
      // 选中文本
      textarea.select();
      textarea.setSelectionRange(0, 99999); // 适配移动设备
      
      // 执行复制命令
      const successful = document.execCommand('copy');
      
      // 移除 textarea
      document.body.removeChild(textarea);
      
      if (successful) {
        resolve(true);
      } else {
        console.error('复制命令执行失败');
        resolve(false);
      }
    } catch (error) {
      console.error('复制过程中出错:', error.message);
      resolve(false);
    }
  });
}

// 初始化：加载排除网站列表和复制格式
loadExcludedSites();
loadCopyFormat();