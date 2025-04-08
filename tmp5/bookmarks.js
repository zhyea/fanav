function displayBookmarks(bookmarksTree) {
  const categoriesDiv = document.getElementById('categories');
  const searchBox = document.getElementById('search-box');
  let allBookmarks = [];
  
  function createCategory(title, bookmarks) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    categoryDiv.appendChild(titleElement);
    
    const listElement = document.createElement('ul');
    bookmarks.forEach(bookmark => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = bookmark.url;
      a.textContent = bookmark.title;
      li.appendChild(a);
      listElement.appendChild(li);
      allBookmarks.push({element: li, title: bookmark.title.toLowerCase()});
    });
    categoryDiv.appendChild(listElement);
    return categoryDiv;
  }
  
  function processNode(node, parentTitle = '未分类') {
    if (!node) return; // Validate node
    if (node.children) {
      node.children.forEach(child => {
        const newParentTitle = node.parentId === '0' ? '未分类' : node.title;
        processNode(child, newParentTitle);
      });
    } else if (node.url) {
      if (!categories[parentTitle]) {
        categories[parentTitle] = [];
      }
      categories[parentTitle].push(node);
    }
  }
  
  function filterBookmarks(searchTerm) {
    const term = searchTerm.toLowerCase();
    allBookmarks.forEach(bookmark => {
      const shouldShow = bookmark.title.includes(term);
      bookmark.element.style.display = shouldShow ? 'list-item' : 'none';
    });
  }
  
  searchBox.addEventListener('input', (e) => {
    filterBookmarks(e.target.value);
  });
  
  const categories = {};
  bookmarksTree.forEach(root => processNode(root));
  
  Object.entries(categories).forEach(([title, bookmarks]) => {
    categoriesDiv.appendChild(createCategory(title, bookmarks));
  });
}

chrome.bookmarks.getTree((bookmarksTree) => {
  if (chrome.runtime.lastError) {
    console.error('Error fetching bookmarks:', chrome.runtime.lastError);
    return;
  }
  displayBookmarks(bookmarksTree);
});

// 添加抽屉的初始化和控制逻辑
function initializeSettingsDrawer() {
  const drawer = document.getElementById('settings-drawer');
  const openButton = document.getElementById('open-drawer-button');
  const closeButton = document.getElementById('close-drawer-button');

  // 打开抽屉
  openButton.addEventListener('click', () => {
    drawer.style.transform = 'translateX(0)';
  });

  // 关闭抽屉
  closeButton.addEventListener('click', () => {
    drawer.style.transform = 'translateX(100%)';
  });
}

// 在页面加载完成后初始化抽屉
document.addEventListener('DOMContentLoaded', () => {
  initializeSettingsDrawer();
});
