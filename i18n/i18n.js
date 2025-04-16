export class I18n {
	constructor() {
		this.currentLocale = 'en';
		this.translations = {};
		this.fallbackLocale = 'en';
		this.supportedLocales = ['en', 'zh', 'zh-tw', 'ja', 'ko', 'fr', 'de', 'ar'];
		this.rtlLocales = ['ar']; // 从右到左书写的语言
	}

	async init() {
		// 获取浏览器语言，支持带地区的语言代码（如 zh-TW）
		const browserLang = navigator.language.toLowerCase();
		const baseLang = browserLang.split('-')[0];

		console.log('Browser Lang', browserLang)

		// 优先匹配完整的语言代码（如 zh-tw），如果没有则匹配基础语言代码（如 zh）
		this.currentLocale = this.supportedLocales.includes(browserLang) ? browserLang :
			this.supportedLocales.includes(baseLang) ? baseLang : 'en';

		// 加载语言文件
		await this.loadTranslations();
		this.applyTextDirection();
	}

	applyTextDirection() {
		// 为从右到左书写的语言设置文档方向
		document.documentElement.dir = this.rtlLocales.includes(this.currentLocale) ? 'rtl' : 'ltr';
	}

	async loadTranslations() {
		try {
			// 加载英文翻译（作为后备语言）
			const enModule = await import('./en.js');
			this.translations['en'] = enModule.en;

			// 如果当前语言不是英文，加载对应的翻译
			if (this.currentLocale !== 'en') {
				// 仅允许受支持的语言代码进行导入和属性访问
				if (this.supportedLocales.includes(this.currentLocale)) {
					const fileName = this.currentLocale.replace('-', '');
					const module = await import(`./${this.currentLocale}.js`);
					this.translations[this.currentLocale] = module[fileName];
				} else {
					console.warn(`Unsupported locale: ${this.currentLocale}, falling back to English.`);
					this.currentLocale = 'en';
				}
			}
		} catch (error) {
			console.error(`Failed to load translations for ${this.currentLocale}:`, error);
			this.currentLocale = 'en'; // 如果加载失败，回退到英文
		}
	}

	t(key, ...args) {

		const keys = key.split('.');
		let value = this.translations[this.currentLocale];

		// 遍历键路径获取翻译
		for (const k of keys) {
			if (value && value[k]) {
				value = value[k];
			} else {
				// 如果当前语言没有找到翻译，尝试使用后备语言
				value = this.getFallbackTranslation(keys);
				break;
			}
		}

		if (!value) {
			return key;
		}

		// 替换参数
		if (args.length > 0) {
			return value.replace(/\{(\d+)\}/g, (match, index) => {
				const argIndex = parseInt(index);
				return argIndex < args.length ? args[argIndex] : match;
			});
		}

		return value;
	}

	getFallbackTranslation(keys) {
		let value = this.translations[this.fallbackLocale];
		for (const k of keys) {
			if (value && value[k]) {
				value = value[k];
			} else {
				return null;
			}
		}
		return value;
	}

	getCurrentLocale() {
		return this.currentLocale;
	}
}

// 创建并导出实例
const i18n = new I18n();
export {i18n};
