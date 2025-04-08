chrome.bookmarks.getTree((bookmarkTreeNodes) => {
  if (chrome.runtime.lastError) {
    console.error('Error fetching bookmarks:', chrome.runtime.lastError);
    return;
  }
  const bookmarksDiv = document.getElementById('bookmarks');
  
  function processNode(node) {
    if (node.url) {
      const link = document.createElement('a');
      link.href = node.url;
      link.textContent = node.title;
      link.className = 'bookmark-link';
      bookmarksDiv.appendChild(link);
    }
    if (node.children) {
      node.children.forEach(processNode);
    }
  }
  
  bookmarkTreeNodes.forEach(processNode);
});

function toggleDrawer() {
  const drawer = document.getElementById('drawer');
  drawer.classList.toggle('open');
}

document.getElementById('close-drawer').addEventListener('click', toggleDrawer);
document.getElementById('settings-button').addEventListener('click', toggleDrawer);
