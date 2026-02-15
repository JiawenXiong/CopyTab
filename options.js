// 存储键名
const STORAGE_KEY = 'excludedSites';
const COPY_FORMAT_KEY = 'copyFormat';
const FIRST_INSTALL_KEY = 'firstInstall';

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

// 当前排除网站列表
let excludedSites = [];

// 当前复制格式
let copyFormat = 'plain';

// DOM 元素
const newSiteInput = document.getElementById('newSiteInput');
const addSiteBtn = document.getElementById('addSiteBtn');
const sitesList = document.getElementById('sitesList');
const openShortcutsBtn = document.getElementById('openShortcutsBtn');
const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');
const formatRadios = document.querySelectorAll('input[name="copyFormat"]');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  checkFirstInstall();
  loadExcludedSites();
  loadCopyFormat();
  loadCurrentShortcut();
  bindEvents();
});

// 检查是否首次安装
function checkFirstInstall() {
  chrome.storage.sync.get([FIRST_INSTALL_KEY], (result) => {
    if (!result[FIRST_INSTALL_KEY]) {
      // 首次安装，显示快捷键配置提示
      showShortcutSetupNotification();
      // 标记为已安装
      chrome.storage.sync.set({ [FIRST_INSTALL_KEY]: true });
    }
  });
}

// 显示快捷键配置通知
function showShortcutSetupNotification() {
  const notification = document.createElement('div');
  notification.className = 'setup-notification';
  notification.innerHTML = `
    <div class="setup-notification-content">
      <h3>🎉 ${t('welcomeTitle')}</h3>
      <p>${t('welcomeMessage')}</p>
      <button id="setupShortcutBtn" class="btn btn-primary">${t('setupShortcut')}</button>
      <button id="dismissSetupBtn" class="btn btn-secondary">${t('dismiss')}</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // 绑定按钮事件
  document.getElementById('setupShortcutBtn').addEventListener('click', () => {
    openShortcutsPage();
    notification.remove();
  });
  
  document.getElementById('dismissSetupBtn').addEventListener('click', () => {
    notification.remove();
  });
  
  // 10秒后自动消失
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 10000);
}

// 应用翻译
function applyTranslations() {
  // 翻译所有带有 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = chrome.i18n.getMessage(key);
    if (translation) {
      element.textContent = translation;
    }
  });
  
  // 翻译所有带有 data-i18n-placeholder 属性的元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = chrome.i18n.getMessage(key);
    if (translation) {
      element.placeholder = translation;
    }
  });
  
  // 更新页面标题
  const titleElement = document.querySelector('title');
  if (titleElement && titleElement.hasAttribute('data-i18n')) {
    const key = titleElement.getAttribute('data-i18n');
    const translation = chrome.i18n.getMessage(key);
    if (translation) {
      document.title = translation;
    }
  }
}

// 获取翻译文本
function t(key) {
  return chrome.i18n.getMessage(key) || key;
}

// 加载当前快捷键
function loadCurrentShortcut() {
  chrome.commands.getAll((commands) => {
    const copyCommand = commands.find(cmd => cmd.name === 'copy-title-and-url');
    if (copyCommand && copyCommand.shortcut) {
      const shortcutElement = document.querySelector('.shortcut-current');
      if (shortcutElement) {
        // 格式化快捷键显示
        const formattedShortcut = formatShortcut(copyCommand.shortcut);
        shortcutElement.textContent = formattedShortcut;
      }
    }
  });
}

// 格式化快捷键显示
function formatShortcut(shortcut) {
  // 将快捷键中的分隔符替换为 +
  return shortcut.split(/\s+/).join(' + ');
}

// 绑定事件
function bindEvents() {
  addSiteBtn.addEventListener('click', addSite);
  newSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  });
  openShortcutsBtn.addEventListener('click', openShortcutsPage);
  resetBtn.addEventListener('click', showResetConfirmation);
  
  // 复制格式选择事件 - 自动保存
  // 由于单选按钮是隐藏的，我们需要监听卡片的点击事件
  document.querySelectorAll('.format-option').forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    if (radio) {
      option.addEventListener('click', () => {
        // 手动选中单选按钮
        radio.checked = true;
        copyFormat = radio.value;
        autoSaveConfig();
        showToast(t('formatSelected'), 'success');
      });
    }
  });
  
  // 同时也监听单选按钮的 change 事件（作为备份）
  formatRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      copyFormat = e.target.value;
      autoSaveConfig();
      showToast(t('formatSelected'), 'success');
    });
  });
}

// 从存储加载排除网站列表
function loadExcludedSites() {
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    if (result[STORAGE_KEY] && Array.isArray(result[STORAGE_KEY])) {
      excludedSites = result[STORAGE_KEY];
    } else {
      excludedSites = [...DEFAULT_EXCLUDED_SITES];
    }
    renderSitesList();
  });
}

// 从存储加载复制格式
function loadCopyFormat() {
  chrome.storage.sync.get([COPY_FORMAT_KEY], (result) => {
    if (result[COPY_FORMAT_KEY]) {
      copyFormat = result[COPY_FORMAT_KEY];
      // 更新单选按钮状态
      formatRadios.forEach(radio => {
        radio.checked = (radio.value === copyFormat);
      });
    }
  });
}

// 渲染排除网站列表
function renderSitesList() {
  sitesList.innerHTML = '';
  
  if (excludedSites.length === 0) {
    sitesList.innerHTML = `<div class="site-item" style="justify-content: center; color: #999;">${t('noExcludedSites')}</div>`;
    return;
  }

  excludedSites.forEach((site, index) => {
    const item = document.createElement('div');
    item.className = 'site-item';
    
    const urlSpan = document.createElement('span');
    urlSpan.className = 'site-url';
    urlSpan.textContent = site;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = t('delete');
    deleteBtn.addEventListener('click', () => deleteSite(index));
    
    item.appendChild(urlSpan);
    item.appendChild(deleteBtn);
    sitesList.appendChild(item);
  });
}

// 添加网站
function addSite() {
  const url = newSiteInput.value.trim();
  
  if (!url) {
    showToast(t('enterUrl'), 'error');
    return;
  }
  
  if (excludedSites.includes(url)) {
    showToast(t('siteExists'), 'error');
    return;
  }
  
  excludedSites.push(url);
  newSiteInput.value = '';
  renderSitesList();
  autoSaveConfig();
  showToast(t('siteAdded'), 'success');
}

// 删除网站
function deleteSite(index) {
  excludedSites.splice(index, 1);
  renderSitesList();
  autoSaveConfig();
  showToast(t('siteDeleted'), 'success');
}

// 自动保存配置（不显示提示）
function autoSaveConfig() {
  chrome.storage.sync.set({ 
    [STORAGE_KEY]: excludedSites,
    [COPY_FORMAT_KEY]: copyFormat
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('自动保存失败:', chrome.runtime.lastError.message);
    }
  });
}

// 显示恢复确认对话框
function showResetConfirmation() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${t('resetConfirmTitle')}</h3>
      <p>${t('resetConfirmMessage')}</p>
      <div class="modal-actions">
        <button id="cancelResetBtn" class="btn btn-secondary">${t('cancel')}</button>
        <button id="confirmResetBtn" class="btn btn-danger">${t('confirm')}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 绑定按钮事件
  document.getElementById('cancelResetBtn').addEventListener('click', () => {
    modal.remove();
  });
  
  document.getElementById('confirmResetBtn').addEventListener('click', () => {
    resetToDefaults();
    modal.remove();
  });
  
  // 点击遮罩层关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// 恢复默认配置
function resetToDefaults() {
  excludedSites = [...DEFAULT_EXCLUDED_SITES];
  copyFormat = 'plain';
  
  // 更新UI
  renderSitesList();
  formatRadios.forEach(radio => {
    radio.checked = (radio.value === copyFormat);
  });
  
  // 保存到存储
  autoSaveConfig();
  showToast(t('resetSuccess'), 'success');
}

// 打开快捷键配置页面
function openShortcutsPage() {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
}

// 显示 Toast 提示
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}