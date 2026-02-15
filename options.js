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

// 当前排除网站列表
let excludedSites = [];

// 当前复制格式
let copyFormat = 'plain';

// DOM 元素
const newSiteInput = document.getElementById('newSiteInput');
const addSiteBtn = document.getElementById('addSiteBtn');
const sitesList = document.getElementById('sitesList');
const saveBtn = document.getElementById('saveBtn');
const openShortcutsBtn = document.getElementById('openShortcutsBtn');
const toast = document.getElementById('toast');
const formatRadios = document.querySelectorAll('input[name="copyFormat"]');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadExcludedSites();
  loadCopyFormat();
  bindEvents();
});

// 绑定事件
function bindEvents() {
  addSiteBtn.addEventListener('click', addSite);
  newSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  });
  saveBtn.addEventListener('click', saveConfig);
  openShortcutsBtn.addEventListener('click', openShortcutsPage);
  
  // 复制格式选择事件
  formatRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      copyFormat = e.target.value;
      showToast('格式已选择，请点击保存按钮保存配置', 'success');
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
    sitesList.innerHTML = '<div class="site-item" style="justify-content: center; color: #999;">暂无排除网站</div>';
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
    deleteBtn.textContent = '删除';
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
    showToast('请输入网站URL', 'error');
    return;
  }
  
  if (excludedSites.includes(url)) {
    showToast('该网站已在排除列表中', 'error');
    return;
  }
  
  excludedSites.push(url);
  newSiteInput.value = '';
  renderSitesList();
  showToast('网站已添加，请点击保存按钮保存配置', 'success');
}

// 删除网站
function deleteSite(index) {
  excludedSites.splice(index, 1);
  renderSitesList();
  showToast('网站已删除，请点击保存按钮保存配置', 'success');
}

// 保存配置
function saveConfig() {
  chrome.storage.sync.set({ 
    [STORAGE_KEY]: excludedSites,
    [COPY_FORMAT_KEY]: copyFormat
  }, () => {
    if (chrome.runtime.lastError) {
      showToast('保存失败: ' + chrome.runtime.lastError.message, 'error');
    } else {
      showToast('配置已保存', 'success');
    }
  });
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