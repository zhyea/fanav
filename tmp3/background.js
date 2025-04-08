// 存储标签和书签的关系
const storage = {
  async saveBookmarkTags(bookmarkId, tags) {
    try {
      const data = await chrome.storage.local.get('bookmarkTags');
      const bookmarkTags = data.bookmarkTags || {};
      bookmarkTags[bookmarkId] = tags;
      await chrome.storage.local.set({ bookmarkTags });
      return true;
    } catch (error) {
      console.error('Error saving tags:', error);
      return false;
    }
  },

  async getBookmarkTags(bookmarkId) {
    try {
      const data = await chrome.storage.local.get('bookmarkTags');
      const bookmarkTags = data.bookmarkTags || {};
      return bookmarkTags[bookmarkId] || [];
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  },

  async getAllTags() {
    try {
      const data = await chrome.storage.local.get('bookmarkTags');
      const bookmarkTags = data.bookmarkTags || {};
      const tagSet = new Set();
      Object.values(bookmarkTags).forEach(tags => {
        if (Array.isArray(tags)) {
          tags.forEach(tag => tag && tagSet.add(tag));
        }
      });
      return Array.from(tagSet);
    } catch (error) {
      console.error('Error getting all tags:', error);
      return [];
    }
  }
};

// 提取网页内容并生成标签
async function generateTags(url) {
  try {
    // 获取网页内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    
    // 使用正则表达式提取标题和描述
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // 提取所有h1标签内容
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    const h1Text = h1Matches ? h1Matches.map(match => {
      const content = match.replace(/<[^>]+>/g, '');
      return content.trim();
    }).join(' ') : '';
    
    // 合并关键文本
    const keyText = `${title} ${description} ${h1Text}`;
    
    // 使用简单的关键词提取算法
    const words = keyText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !commonWords.includes(word));
    
    // 返回出现频率最高的词作为标签
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const tags = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    console.log('Generated tags for URL:', url, tags);
    return tags;
  } catch (error) {
    console.error('Error generating tags:', error);
    return [];
  }
}

// 常见的停用词
const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'that', 'have', 'with', 'this', 'from',
  'they', 'would', 'about', 'there', 'their', 'what', 'when', 'make', 'like',
  'time', 'just', 'know', 'take', 'people', 'year', 'your', 'good', 'some',
  'could', 'them', 'than', 'then', 'look', 'only', 'come', 'over', 'think'
];

// 将书签树展平为数组
function flattenBookmarks(nodes) {
  const bookmarks = [];
  
  function traverse(node) {
    if (node.url) {
      bookmarks.push(node);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  nodes.forEach(traverse);
  return bookmarks;
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBookmarks') {
    // 使用 Promise.all 处理所有异步操作
    (async () => {
      try {
        const bookmarkTreeNodes = await new Promise((resolve) => {
          chrome.bookmarks.getTree((nodes) => resolve(nodes));
        });

        // 获取所有书签
        const flatBookmarks = flattenBookmarks(bookmarkTreeNodes);
        console.log('Flattened bookmarks:', flatBookmarks.length);
        
        // 获取所有书签的标签
        const bookmarksWithTags = await Promise.all(
          flatBookmarks.map(async bookmark => {
            try {
              const tags = await storage.getBookmarkTags(bookmark.id);
              return {
                ...bookmark,
                tags: Array.isArray(tags) ? tags : []
              };
            } catch (error) {
              console.error('Error processing bookmark:', bookmark.id, error);
              return {
                ...bookmark,
                tags: []
              };
            }
          })
        );

        console.log('Processed bookmarks with tags:', bookmarksWithTags.length);
        sendResponse({
          bookmarks: bookmarkTreeNodes,
          bookmarksWithTags: bookmarksWithTags
        });
      } catch (error) {
        console.error('Error processing bookmarks:', error);
        sendResponse({
          bookmarks: [],
          bookmarksWithTags: []
        });
      }
    })();
    return true;
  }
  
  if (request.action === 'generateTags') {
    if (!request.url || !request.bookmarkId) {
      console.error('Missing parameters:', request);
      sendResponse({ error: 'Missing required parameters' });
      return true;
    }

    (async () => {
      try {
        const tags = await generateTags(request.url);
        const saved = await storage.saveBookmarkTags(request.bookmarkId, tags);
        if (saved) {
          console.log('Tags saved successfully:', request.bookmarkId, tags);
          sendResponse({ tags });
        } else {
          throw new Error('Failed to save tags');
        }
      } catch (error) {
        console.error('Error in generateTags:', error);
        sendResponse({ error: error.message || 'Failed to generate or save tags' });
      }
    })();
    return true;
  }
  
  if (request.action === 'getAllTags') {
    (async () => {
      try {
        const tags = await storage.getAllTags();
        console.log('Retrieved all tags:', tags.length);
        sendResponse({ tags });
      } catch (error) {
        console.error('Error getting all tags:', error);
        sendResponse({ tags: [] });
      }
    })();
    return true;
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL('navigation.html'),
    type: 'popup',
    width: 800,
    height: 600,
    left: Math.round((screen.width - 800) / 2),
    top: Math.round((screen.height - 600) / 2)
  });
});
