// 常见的停用词
const commonWords = [
	'the', 'be', 'to', 'of', 'and', 'that', 'have', 'with', 'this', 'from',
	'they', 'would', 'about', 'there', 'their', 'what', 'when', 'make', 'like',
	'time', 'just', 'know', 'take', 'people', 'year', 'your', 'good', 'some',
	'could', 'them', 'than', 'then', 'look', 'only', 'come', 'over', 'think'
];

// 统一浏览器API
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
// 处理action/browser_action差异
browserAPI.myAction = browserAPI.browserAction || browserAPI.action;

browserAPI.myAction.onClicked.addListener(function() {
	browserAPI.tabs.create({url: 'navigation.html'}).then(function(r) {
		console.log('load nav page...');
	});
});
