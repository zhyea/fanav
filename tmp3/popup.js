// Popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openNavigation') {
    window.location.href = 'navigation.html';
  }
});
