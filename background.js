// 常见的停用词
const commonWords = [
	'the', 'be', 'to', 'of', 'and', 'that', 'have', 'with', 'this', 'from',
	'they', 'would', 'about', 'there', 'their', 'what', 'when', 'make', 'like',
	'time', 'just', 'know', 'take', 'people', 'year', 'your', 'good', 'some',
	'could', 'them', 'than', 'then', 'look', 'only', 'come', 'over', 'think'
];


// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === 'getBookmarks') {
		// 使用 Promise.all 处理所有异步操作
		(async () => {
			try {
				const bookmarkTreeNodes = await new Promise((resolve) => {
					chrome.bookmarks.getTree((nodes) => resolve(nodes));
				});

				sendResponse({
					bookmarks: bookmarkTreeNodes,
				});
			} catch (error) {
				console.error('Error processing bookmarks:', error);
				sendResponse({
					bookmarks: [],
				});
			}
		})();
		return true;
	}
});

chrome.action.onClicked.addListener(() => {
	chrome.tabs.create({url: 'navigation.html'}).then(r => console.log('load nav page...'));
});
