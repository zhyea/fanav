chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "https://www.example.com" }); // 替换为目标页面的 URL
});
