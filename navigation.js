// 导入 i18n 实例
import {i18n} from './i18n/i18n.js';

// 全局设置对象
let appSettings = {
	width: 'auto',
	theme: 'original',
	background: {
		enabled: false,
		url: ''
	}
};

document.addEventListener('DOMContentLoaded', async () => {
	// 等待 i18n 初始化完成
	await i18n.init();

	// 应用初始翻译
	applyTranslations();

	// 首先加载设置，然后初始化页面
	loadSettings().then(settings => {
		// 应用加载的设置
		applySettings(settings);

		// 设置抽屉功能
		setupSettings();

		// 加载书签
		loadBookmarks();

		// 设置搜索功能
		setupSearch();
	});
});

// 应用翻译到页面元素
function applyTranslations() {
	// 更新页面标题
	document.title = i18n.t('bookmarks.title');

	// 更新搜索框占位符
	const searchInput = document.getElementById('searchInput');
	if (searchInput) {
		searchInput.placeholder = i18n.t('search.placeholder');
	}

	// 更新设置面板
	const settingsTitle = document.querySelector('#settingsDrawer h2');
	if (settingsTitle) {
		settingsTitle.textContent = i18n.t('settings.title');
	}

	// 更新宽度设置
	const widthLabel = document.querySelector('#settingWidthSelectLabel');
	if (widthLabel) {
		widthLabel.textContent = i18n.t('settings.width.label');
	}

	// 更新主题设置
	const themeLabel = document.querySelector('#settingThemeSelectLabel');
	if (themeLabel) {
		themeLabel.textContent = i18n.t('settings.theme.label');
	}

	// 更新背景设置
	const backgroundLabel = document.querySelector('#settingBackgroundEnableLabel');
	if (backgroundLabel) {
		backgroundLabel.textContent = i18n.t('settings.background.label');
	}

	// 更新保存按钮
	const saveButton = document.getElementById('saveSettings');
	if (saveButton) {
		saveButton.textContent = i18n.t('settings.save');
	}

	// 更新刷新背景按钮的提示文本
	const refreshButton = document.getElementById('refreshBackground');
	if (refreshButton) {
		refreshButton.title = i18n.t('settings.background.refresh');
	}

	// 更新下拉菜单选项的翻译
	document.querySelectorAll('option[data-i18n]').forEach(option => {
		const translationKey = option.getAttribute('data-i18n');
		if (translationKey) {
			option.textContent = i18n.t(translationKey);
		}
	});
}

// 加载所有设置
function loadSettings() {
	return new Promise((resolve) => {
		try {
			chrome.storage.sync.get('appSettings', (result) => {
				if (result.appSettings) {
					// 合并保存的设置和默认设置，确保所有必要的属性都存在
					appSettings = {
						...appSettings,
						...result.appSettings,
						// 确保background对象存在并包含所有必要的属性
						background: {
							...appSettings.background,
							...(result.appSettings.background || {})
						}
					};
					console.log('Settings loaded:', appSettings);
				} else {
					console.log('No saved settings found, using defaults');
				}
				resolve(appSettings);
			});
		} catch (error) {
			console.error('Error loading settings:', error);
			resolve(appSettings); // 出错时使用默认设置
		}
	});
}

// 应用设置到UI
function applySettings(settings) {
	// 应用宽度设置
	setContainerWidth(settings.width);
	const widthSelect = document.getElementById('widthSelect');
	if (widthSelect) widthSelect.value = settings.width;

	// 应用主题设置
	setTheme(settings.theme);
	const themeSelect = document.getElementById('themeSelect');
	if (themeSelect) themeSelect.value = settings.theme;

	// 应用背景图设置
	const backgroundEnabled = document.getElementById('backgroundEnabled');
	if (backgroundEnabled) backgroundEnabled.checked = settings.background.enabled;

	setBackground(settings.background.enabled, settings.background.url);
}

// 设置背景图
function setBackground(enabled, url) {
	const body = document.body;

	if (enabled && url) {
		body.classList.add('has-background');
		body.style.backgroundImage = `url(${url})`;
	} else {
		body.classList.remove('has-background');
		body.style.backgroundImage = '';
	}
}

// 从Pexels获取背景图
async function fetchPexelsImage() {
	try {
		// 显示加载提示
		const refreshButton = document.getElementById('refreshBackground');
		if (refreshButton) {
			refreshButton.classList.add('loading');
			refreshButton.disabled = true;

			// 尝试恢复按钮状态的函数
			const restoreButton = () => {
				refreshButton.classList.remove('loading');
				refreshButton.disabled = false;
			};

			try {
				// 使用Pexels API获取高质量图片 - 加载速度更快，无CORS问题
				const pexelsImages = [
					'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1920',
					'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1920',
					'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1920',
					'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1920',
					'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920',
					'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=1920',
					'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=1920',
					'https://images.pexels.com/photos/2088170/pexels-photo-2088170.jpeg?auto=compress&cs=tinysrgb&w=1920'
				];

				// 随机选择一张图片
				const imageUrl = pexelsImages[Math.floor(Math.random() * pexelsImages.length)];

				// 使用Image对象预加载图片，检查是否可以访问
				const imgTest = new Image();
				let imgLoaded = false;

				imgTest.onload = () => {
					if (!imgLoaded) {
						imgLoaded = true;

						// 更新设置
						appSettings.background.url = imageUrl;
						appSettings.background.enabled = true;

						// 应用背景
						setBackground(true, imageUrl);

						// 更新UI
						const backgroundEnabled = document.getElementById('backgroundEnabled');
						if (backgroundEnabled) backgroundEnabled.checked = true;

						restoreButton();
					}
				};

				imgTest.onerror = () => {
					throw new Error('Failed to load Pexels image');
				};

				// 设置超时，如果5秒内没有加载完成，则尝试备用方案
				setTimeout(() => {
					if (!imgLoaded) {
						throw new Error('Pexels image loading timeout');
					}
				}, 5000);

				imgTest.src = imageUrl;

				return true;
			} catch (error) {
				console.warn('Error fetching Pexels image, trying fallback:', error);

				// 使用预定义的背景图列表作为备用方案
				const fallbackImages = [
					'https://source.unsplash.com/random/1920x1080/?nature',
					'https://source.unsplash.com/random/1920x1080/?landscape',
					'https://source.unsplash.com/random/1920x1080/?mountains',
					'https://source.unsplash.com/random/1920x1080/?ocean',
					'https://source.unsplash.com/random/1920x1080/?forest'
				];

				// 随机选择一张图片
				const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

				try {
					// 使用Image对象预加载图片，检查是否可以访问
					const imgFallback = new Image();
					let fallbackLoaded = false;

					imgFallback.onload = () => {
						if (!fallbackLoaded) {
							fallbackLoaded = true;

							// 更新设置
							appSettings.background.url = randomImage;
							appSettings.background.enabled = true;

							// 应用背景
							setBackground(true, randomImage);

							// 更新UI
							const backgroundEnabled = document.getElementById('backgroundEnabled');
							if (backgroundEnabled) backgroundEnabled.checked = true;

							restoreButton();
						}
					};

					imgFallback.onerror = () => {
						throw new Error('Failed to load fallback image');
					};

					// 设置超时
					setTimeout(() => {
						if (!fallbackLoaded) {
							throw new Error('Fallback image loading timeout');
						}
					}, 5000);

					imgFallback.src = randomImage;

					return true;
				} catch (fallbackError) {
					console.error('All background image sources failed:', fallbackError);
					restoreButton();
					return false;
				}
			}
		}
	} catch (error) {
		console.error('Error in fetchPexelsImage:', error);
		return false;
	}
}

// 文件夹图标映射
const FOLDER_ICONS = {
	'bookmarks.uncategorized': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2H5V5c0-1.1.9-2 2-2z"/></svg>',
	'bookmarks.categories.common': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
	'bookmarks.categories.work': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.19 4H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.81-2-1.81-2zM20 18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v12z"/><path d="M17.73 13.3c.52-.27.27-1.03-.35-1.03h-1.48l-2.86-2.03h-2.37c-.41 0-.75.34-.75.75v4c0 .41.34.75.75.75h1.24l.92.5c.63.35 1.4.35 2.03 0l1.14-.62 1.73.94z"/></svg>',
	'bookmarks.categories.study': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm3.79 13.21L12 13.42l-3.79 2.79 1.44-4.45-3.75-2.84 4.67-.04L12 4.48l1.43 4.4 4.67.04-3.75 2.84 1.44 4.45z"/></svg>',
	'bookmarks.categories.entertainment': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 9V7h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2zm-4 10H4V5h14v14zM6 13h5v4H6zm6-6h4v3h-4zm-6 0h5v5H6z"/></svg>',
	'bookmarks.categories.shopping': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
	'bookmarks.categories.travel': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.19 4H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.81-2-1.81-2zM20 18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v12z"/><path d="M17.73 13.3c.52-.27.27-1.03-.35-1.03h-1.48l-2.86-2.03h-2.37c-.41 0-.75.34-.75.75v4c0 .41.34.75.75.75h1.24l.92.5c.63.35 1.4.35 2.03 0l1.14-.62 1.73.94z"/></svg>',
	'bookmarks.categories.tech': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 9V7h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2zm-4 10H4V5h14v14zM6 13h5v4H6zm6-6h4v3h-4zm-6 0h5v5H6z"/></svg>',
	'bookmarks.categories.social': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
	'bookmarks.categories.resources': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>',
	'bookmarks.categories.finance': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>'
};

// 获取默认文件夹图标
function getDefaultFolderIcon() {
	return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>';
}

// 保存所有设置
function saveSettings() {
	try {
		chrome.storage.sync.set({'appSettings': appSettings}, () => {
			if (chrome.runtime.lastError) {
				console.error('Error saving settings:', chrome.runtime.lastError);
			} else {
				console.log('Settings saved successfully:', appSettings);
			}
		});
	} catch (error) {
		console.error('Error saving settings:', error);
	}
}

// 设置容器宽度
function setContainerWidth(width) {
	// 更新全局设置
	appSettings.width = width;

	const containers = [
		document.querySelector('.nav-container'),
		document.querySelector('.search-box'),
		document.getElementById('bookmarksContainer'),
		document.querySelector('.error')
	];

	containers.forEach(container => {
		if (container) {
			if (width === 'auto') {
				container.style.maxWidth = 'none';
				container.style.width = 'calc(100vw - 40px)';
			} else {
				const widthNum = parseInt(width) || 800;
				container.style.maxWidth = `${widthNum}px`;
				container.style.width = '100%';
			}
		}
	});
}

// 设置主题
function setTheme(theme) {
	// 更新全局设置
	appSettings.theme = theme;

	const body = document.body;
	// 移除所有主题类
	body.classList.remove('theme-original', 'theme-simple', 'theme-fresh', 'theme-deep', 'theme-vintage', 'theme-colorful');
	// 添加选择的主题类
	body.classList.add(`theme-${theme}`);
}

function setupSettings() {
	// 导入按钮和文件input声明只在此处
	const importBtn = document.getElementById('importBookmarksBtn');
	const importInput = document.getElementById('importFileInput');
	if (importBtn && importInput) {
		importBtn.textContent = i18n.t('bookmarks.import_file');
		importBtn.addEventListener('click', () => importInput.click());
		importInput.addEventListener('change', handleImportBookmarks);
	}

	const settingsButton = document.getElementById('settingsButton');
	const settingsDrawer = document.getElementById('settingsDrawer');
	const closeDrawer = document.getElementById('closeDrawer');
	const overlay = document.getElementById('overlay');
	const widthSelect = document.getElementById('widthSelect');
	const themeSelect = document.getElementById('themeSelect');
	const saveButton = document.getElementById('saveSettings');
	const backgroundEnabled = document.getElementById('backgroundEnabled');
	const refreshBackground = document.getElementById('refreshBackground');


	if (!settingsButton || !settingsDrawer || !closeDrawer || !overlay) {
		console.warn('Settings elements not found');
		return;
	}

	// 确保选择框显示当前设置
	if (widthSelect) widthSelect.value = appSettings.width;
	if (themeSelect) themeSelect.value = appSettings.theme;
	if (backgroundEnabled) backgroundEnabled.checked = appSettings.background.enabled;

	// 打开设置抽屉
	settingsButton.addEventListener('click', () => {
		settingsDrawer.classList.add('open');
		overlay.classList.remove('hidden');
		setTimeout(() => {
			overlay.classList.add('visible');
		}, 10); // 小延迟确保过渡效果
	});

	// 关闭设置抽屉（关闭按钮）
	closeDrawer.addEventListener('click', () => {
		closeSettingsDrawer();
	});

	// 关闭设置抽屉（点击遮罩层）
	overlay.addEventListener('click', () => {
		closeSettingsDrawer();
	});

	// 关闭设置抽屉的函数
	function closeSettingsDrawer() {
		overlay.classList.remove('visible');
		setTimeout(() => {
			settingsDrawer.classList.remove('open');
			overlay.classList.add('hidden');
		}, 300); // 等待遮罩层淡出
	}

	// 监听宽度选择
	if (widthSelect) {
		widthSelect.addEventListener('change', (e) => {
			const width = e.target.value;
			setContainerWidth(width); // 只应用设置，不保存
		});
	}

	// 监听主题选择
	if (themeSelect) {
		themeSelect.addEventListener('change', (e) => {
			const theme = e.target.value;
			setTheme(theme); // 只应用设置，不保存
		});
	}

	// 监听背景图设置
	if (backgroundEnabled) {
		backgroundEnabled.addEventListener('change', (e) => {
			appSettings.background.enabled = e.target.checked;

			if (e.target.checked && !appSettings.background.url) {
				// 如果启用背景但没有背景图，立即加载一张
				fetchPexelsImage();
			} else {
				// 应用当前设置
				setBackground(appSettings.background.enabled, appSettings.background.url);
			}
		});
	}

	// 监听保存按钮点击
	if (saveButton) {
		saveButton.addEventListener('click', () => {
			// 保存当前设置
			saveSettings();

			// 显示保存成功提示
			const successMessage = document.createElement('div');
			successMessage.className = 'save-success';
			successMessage.textContent = i18n.t('settings.saved');
			saveButton.parentNode.appendChild(successMessage);

			// 2秒后移除提示
			setTimeout(() => {
				successMessage.remove();
			}, 2000);

			// 关闭设置抽屉
			closeSettingsDrawer();
		});
	}

	// 监听刷新背景按钮点击
	if (refreshBackground) {
		refreshBackground.addEventListener('click', () => {
			fetchPexelsImage();
		});
	}
}

function loadBookmarks() {
	chrome.runtime.sendMessage({action: 'getBookmarks'}, (response) => {
		if (!response) {
			showError('bookmarks.error.loading');
			return;
		}

		if (chrome.runtime.lastError) {
			showError('bookmarks.error.chrome_runtime', chrome.runtime.lastError.message);
			return;
		}

		if (!response.bookmarks || !Array.isArray(response.bookmarks)) {
			showError('bookmarks.error.invalid_format');
			return;
		}

		const container = document.getElementById('bookmarksContainer');
		if (!container) {
			showError('bookmarks.error.container_not_found');
			return;
		}

		container.innerHTML = '';

		const bookmarkBar = findBookmarkBar(response.bookmarks[0]);
		if (bookmarkBar) {
			processBookmarkBar(bookmarkBar, container);
		} else {
			showError('未找到书签栏');
		}
	});
}

function findBookmarkBar(root) {
	if (!root || !root.children) return null;

	const set = new Set();

	root.children.forEach(child => child.children.forEach(item => set.add(item)));

	return Array.from(set)
}

function processBookmarkBar(bookmarkBar, container) {
	if (!bookmarkBar) return;

	const uncategorizedBookmarks = [];
	const folders = [];

	// 第一遍遍历：收集未分类书签和文件夹
	bookmarkBar.forEach(item => {
		if (item.url) {
			// 直接在书签栏下的链接归为未分类
			uncategorizedBookmarks.push(item);
		} else if (item.children) {
			folders.push(item);
		}
	});

	// 先渲染未分类书签（如果有的话）
	if (uncategorizedBookmarks.length > 0) {
		renderFolder({
			title: i18n.t('bookmarks.uncategorized'),
			children: uncategorizedBookmarks
		}, container);
	}

	// 渲染每个文件夹
	folders.forEach(folder => {
		const bookmarks = collectBookmarksRecursively(folder);
		if (bookmarks.length > 0) {
			renderFolder({
				title: folder.title,
				children: bookmarks
			}, container);
		}
	});
}

function collectBookmarksRecursively(node) {
	const bookmarks = [];

	function collect(item) {
		if (item.url) {
			bookmarks.push(item);
		} else if (item.children) {
			item.children.forEach(collect);
		}
	}

	collect(node);
	return bookmarks;
}

function showError(messageKey, ...args) {
	const container = document.getElementById('bookmarksContainer');
	if (container) {
		const errorDiv = document.createElement('div');
		errorDiv.className = 'error-message';
		errorDiv.textContent = i18n.t(messageKey, ...args);
		container.innerHTML = '';
		container.appendChild(errorDiv);
	}
}

// 安全的Base64编码（兼容中文）
function base64EncodeUnicode(str) {
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
		return String.fromCharCode('0x' + p1);
	}));
}

function renderFolder(folder, container) {
	if (!folder.children || folder.children.length === 0) return;

	const folderElement = document.createElement('div');
	folderElement.className = 'bookmark-folder';

	// 添加文件夹标题
	const folderTitle = document.createElement('h2');

	// 添加文件夹图标
	const folderIcon = document.createElement('span');
	folderIcon.className = 'folder-icon';
	folderIcon.innerHTML = FOLDER_ICONS[folder.title] || getDefaultFolderIcon();

	// 分类标题文本靠左
	const folderText = document.createElement('span');
	folderText.className = 'folder-title-text';
	folderText.textContent = i18n.t(folder.title);

	// 添加分享按钮
	const shareIcon = document.createElement('span');
	shareIcon.className = 'share-btn';
	shareIcon.title = i18n.t('bookmarks.share') || 'Share';
	shareIcon.setAttribute('aria-label', i18n.t('bookmarks.share') || 'Share');
	shareIcon.style.display = 'inline-flex';
	shareIcon.style.cursor = 'pointer';
	shareIcon.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 20 20" fill="#FFFFFF" style="vertical-align:middle;">
			<path d="m8.5 4c.27614 0 .5.22386.5.5 0 .24545778-.17687704.4496079-.41012499.49194425l-.08987501.00805575h-3c-.77969882 0-1.420449.59488554-1.49313345 1.35553954l-.00686655.14446046v8c0 .7796706.59488554 1.4204457 1.35553954 1.4931332l.14446046.0068668h8c.7796706 0 1.4204457-.5949121 1.4931332-1.3555442l.0068668-.1444558v-1c0-.2761.2239-.5.5-.5.2454222 0 .4496.1769086.4919429.4101355l.0080571.0898645v1c0 1.325472-1.0315469 2.4100378-2.3356256 2.4946823l-.1643744.0053177h-8c-1.3254816 0-2.41003853-1.0315469-2.49468231-2.3356256l-.00531769-.1643744v-8c0-1.3254816 1.03153766-2.41003853 2.33562452-2.49468231l.16437548-.00531769zm4.768-.89136.0617.05301 4.4971 4.42118c.2099.20633.229.53775.0573.76685l-.0572.06544-4.4971 4.42258c-.3378.3322-.8869.1189-.9469-.3338l-.0053-.0823v-2.0955l-.2577.0232c-1.8003.1924-3.52574 1.0235-5.18729 2.5071-.38943.3478-.99194.019-.92789-.5063.49872-4.09021 2.58567-6.34463 6.14828-6.62742l.2246-.01511v-2.12975c0-.47977.5302-.73818.8904-.46918z"/>
		</svg>
	`;
	shareIcon.addEventListener('click', function (e) {
		e.stopPropagation();
		const exportData = {
			category: folder.title,
			bookmarks: folder.children.filter(child => child.url).map(child => ({
				title: child.title,
				url: child.url
			}))
		};
		const json = JSON.stringify(exportData);
		const base64 = base64EncodeUnicode(json);
		const blob = new Blob([base64], {type: 'text/plain'});
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `${folder.title || 'bookmarks'}.zhx`;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			URL.revokeObjectURL(a.href);
			document.body.removeChild(a);
		}, 100);
	});

	folderTitle.appendChild(folderIcon);
	folderTitle.appendChild(folderText);
	folderTitle.appendChild(shareIcon);
	folderTitle.style.justifyContent = 'space-between';

	folderElement.appendChild(folderTitle);

	// 创建书签列表容器
	const bookmarkList = document.createElement('div');
	bookmarkList.className = 'bookmark-list';

	// 渲染书签
	folder.children.forEach(child => {
		if (child.url) {
			const bookmark = createBookmarkElement(child);
			bookmarkList.appendChild(bookmark);
		}
	});

	if (bookmarkList.children.length > 0) {
		folderElement.appendChild(bookmarkList);
		container.appendChild(folderElement);
	}
}

function createBookmarkElement(bookmark) {
	const link = document.createElement('a');
	link.href = bookmark.url;
	link.className = 'bookmark-link';
	link.target = '_blank';
	link.rel = 'noopener';

	// 添加图标
	const icon = document.createElement('img');
	try {
		const url = new URL(bookmark.url);

		// 优化图标获取，使用多个备选服务
		const iconServices = [
			`https://icon.horse/icon/${url.hostname}`,
			`https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`,
			`https://api.iowen.cn/favicon/${url.hostname}.png`
		];

		// 使用第一个服务，其他作为备选
		icon.src = iconServices[0];
		let currentServiceIndex = 0;

		// 如果图标加载失败，尝试下一个服务
		icon.onerror = () => {
			currentServiceIndex++;
			if (currentServiceIndex < iconServices.length) {
				icon.src = iconServices[currentServiceIndex];
			} else {
				icon.src = getDefaultIcon();
			}
		};
	} catch {
		icon.src = getDefaultIcon();
	}

	icon.width = 16;
	icon.height = 16;
	icon.alt = '';

	// 添加标题文本
	const title = document.createElement('span');
	title.textContent = bookmark.title || bookmark.url;

	link.appendChild(icon);
	link.appendChild(title);
	return link;
}

// 获取默认图标的 SVG（预先编码以提高性能）
const DEFAULT_ICON = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/><path fill="#ccc" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM3.5 8c0-1 .2-1.9.6-2.8l1.5 1.5c-.1.4-.1.9-.1 1.3 0 1.1.2 2.1.5 3L3.8 13C3.6 11.4 3.5 9.7 3.5 8zm9 0c0 1.7-.1 3.4-.3 5l-2.2-2c.3-.9.5-1.9.5-3 0-.4 0-.9-.1-1.3l1.5-1.5c.4.9.6 1.8.6 2.8zM8 2.5c1.7 0 3.4.1 5 .3l-2 2.2c-.9-.3-1.9-.5-3-.5-.4 0-.9 0-1.3.1L5.2 3.1c.9-.4 1.8-.6 2.8-.6z"/></svg>');

function getDefaultIcon() {
	return DEFAULT_ICON;
}

// 处理导入书签功能
async function handleImportBookmarks(e) {
	const file = e.target.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = async function (evt) {
		try {
			let base64 = evt.target.result;
			if (base64.startsWith('data:')) base64 = base64.split(',')[1];
			const jsonStr = decodeURIComponent(Array.prototype.map.call(atob(base64), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
			const data = JSON.parse(jsonStr);
			if (!data || !data.category || !Array.isArray(data.bookmarks)) throw new Error('Invalid format');

			const importedCategory = data.category;
			const importedBookmarks = data.bookmarks;

			chrome.bookmarks.getTree(async (tree) => {
				const bar = findBookmarkBar(tree[0]);
				if (!bar) throw new Error('No bookmark bar');

				let targetFolder = bar.find(f => f.title === importedCategory && f.children);
				if (!targetFolder) {
					// 新建分类
					chrome.bookmarks.create({
						parentId: bar[0].parentId,
						title: importedCategory
					}, function (newFolder) {
						insertBookmarksToFolder(newFolder.id, importedBookmarks, [], true);
						showImportMessage(i18n.t('bookmarks.import_success'));
					});
				} else {
					// 合并分类
					const existingUrls = new Set();
					targetFolder.children.forEach(b => b.url && existingUrls.add(b.url));
					const deduped = importedBookmarks.filter(b => b.url && !existingUrls.has(b.url));
					if (deduped.length === 0) {
						showImportMessage(i18n.t('bookmarks.import_skip'));
						return;
					}
					insertBookmarksToFolder(targetFolder.id, deduped, Array.from(existingUrls), false);
					showImportMessage(i18n.t('bookmarks.import_merge'));
				}
			});
		} catch (err) {
			showImportMessage(i18n.t('bookmarks.import_fail'));
		}
	};
	reader.readAsText(file);
}

function insertBookmarksToFolder(folderId, bookmarks, existingUrls, isNewFolder) {
	bookmarks.forEach(b => {
		if (!b.url || existingUrls.includes(b.url)) return;
		chrome.bookmarks.create({
			parentId: folderId,
			title: b.title,
			url: b.url
		});
	});
	setTimeout(() => loadBookmarks(), 500);
}

function showImportMessage(msg) {
	const importBtn = document.getElementById('importBookmarksBtn');
	if (!importBtn) return;
	let tip = document.createElement('div');
	tip.className = 'import-success';
	tip.textContent = msg;
	importBtn.parentNode.appendChild(tip);
	setTimeout(() => tip.remove(), 2000);
}

function setupSearch() {
	const searchInput = document.getElementById('searchInput');
	if (!searchInput) return;

	searchInput.addEventListener('input', (e) => {
		const searchTerm = e.target.value.toLowerCase();
		const bookmarkLinks = document.querySelectorAll('.bookmark-link');

		bookmarkLinks.forEach(link => {
			const title = link.querySelector('span').textContent.toLowerCase();
			const url = link.href.toLowerCase();
			const visible = title.includes(searchTerm) || url.includes(searchTerm);
			link.style.display = visible ? 'flex' : 'none';
		});

		// 隐藏空文件夹
		document.querySelectorAll('.bookmark-folder').forEach(folder => {
			const hasVisibleBookmarks = folder.querySelector('.bookmark-link[style="display: flex;"]');
			folder.style.display = hasVisibleBookmarks ? 'block' : 'none';
		});
	});
}
