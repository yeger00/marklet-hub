async function createBookmarkHierarchy(parentId, path, files) {
  for (const file of files) {
    if (file.type === 'dir') {
      // Create folder
      const folder = await chrome.bookmarks.create({
        parentId: parentId,
        title: file.name
      });
      
      // Fetch and process contents of this directory
      const contents = await fetchDirectoryContents(file.url);
      await createBookmarkHierarchy(folder.id, `${path}/${file.name}`, contents);
    } else {
      // Create bookmark for file
      await chrome.bookmarks.create({
        parentId: parentId,
        title: file.name,
        url: file.html_url
      });
    }
  }
}

async function fetchDirectoryContents(url, token) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  
  return await response.json();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSync') {
    const { org, repo, token } = request;
    
    // Create main folder for repo
    chrome.bookmarks.create({
      parentId: '1',  // Places in Bookmarks Bar
      title: `${org}/${repo}`
    }, async (folder) => {
      try {
        const apiUrl = `https://api.github.com/repos/${org}/${repo}/contents`;
        const contents = await fetchDirectoryContents(apiUrl, token);
        await createBookmarkHierarchy(folder.id, '', contents);
        sendResponse({ message: 'Sync completed successfully!' });
      } catch (error) {
        sendResponse({ message: `Error: ${error.message}` });
      }
    });
    
    return true; // Indicates we'll send response asynchronously
  }
}); 