// ...existing code...

document.addEventListener('DOMContentLoaded', function () {
    // Add a button to open bookmarks in a new tab
    const bookmarksButton = document.createElement('button');
    bookmarksButton.textContent = 'View Bookmarks';
    bookmarksButton.addEventListener('click', function () {
        window.open('bookmarks.html', '_blank'); // Ensure the path is correct
    });
    document.body.appendChild(bookmarksButton);
});

// ...existing code...
