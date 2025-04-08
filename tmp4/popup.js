document.addEventListener('DOMContentLoaded', () => {
  const bookmarkList = document.getElementById('bookmark-list');

  function createBookmarkItem(bookmark) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = bookmark.url;
    a.textContent = bookmark.title;
    a.target = '_blank';
    li.appendChild(a);
    return li;
  }

  function processBookmarks(bookmarks) {
    bookmarks.forEach(bookmark => {
      if (bookmark.url) {
        bookmarkList.appendChild(createBookmarkItem(bookmark));
      } else if (bookmark.children) {
        processBookmarks(bookmark.children);
      }
    });
  }

  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    processBookmarks(bookmarkTreeNodes);
  });
});
