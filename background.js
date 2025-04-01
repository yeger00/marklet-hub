async function createBookmarkHierarchy(parentId, path, files, token) {
  for (const file of files) {
    if (file.type === 'dir') {
      // Create folder
      const folder = await chrome.bookmarks.create({
        parentId: parentId,
        title: file.name
      });
      
      // Fetch and process contents of this directory
      const contents = await fetchDirectoryContents(file.url, token);
      await createBookmarkHierarchy(folder.id, `${path}/${file.name}`, contents, token);
    } else if (file.name.endsWith('.js')) {
      // For JavaScript files, create bookmarklet
      try {
        const jsContent = await fetchFileContent(file.download_url, token);
        const bookmarkletUrl = createBookmarkletUrl(jsContent);
        await chrome.bookmarks.create({
          parentId: parentId,
          title: file.name.replace('.js', ''),
          url: bookmarkletUrl
        });
      } catch (error) {
        console.error(`Error creating bookmarklet for ${file.name}:`, error);
      }
    }
  }
}

async function fetchFileContent(url, token) {
  const headers = {
    'Accept': 'application/vnd.github.v3.raw'
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.statusText}`);
  }
  
  return await response.text();
}

function createBookmarkletUrl(code) {
  // Remove comments
  code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  
  // Basic minification (remove unnecessary whitespace)
  code = code.replace(/\s+/g, ' ').trim();
  
  // Wrap in IIFE if not already wrapped
  if (!code.startsWith('(function')) {
    code = `(function(){${code}})()`;
  }
  
  // Create bookmarklet URL
  return `javascript:${encodeURIComponent(code)}`;
}

async function fetchDirectoryContents(url, token) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  // Only add Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found or private. Token may be required.');
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  
  return await response.json();
}

async function findAndDeleteExistingFolder(searchName) {
  return new Promise((resolve) => {
    chrome.bookmarks.search({ title: searchName }, async (results) => {
      for (const bookmark of results) {
        // Only delete if it's in the bookmark bar
        if (bookmark.parentId === '1') {
          await chrome.bookmarks.removeTree(bookmark.id);
        }
      }
      resolve();
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSync') {
    const { org, repo, token, folderName } = request;
    const finalFolderName = folderName || `${org}/${repo}`;
    
    // First delete existing folder if it exists
    findAndDeleteExistingFolder(finalFolderName).then(() => {
      // Create new folder for repo
      chrome.bookmarks.create({
        parentId: '1',  // Places in Bookmarks Bar
        title: finalFolderName
      }, async (folder) => {
        try {
          const apiUrl = `https://api.github.com/repos/${org}/${repo}/contents`;
          const contents = await fetchDirectoryContents(apiUrl, token);
          await createBookmarkHierarchy(folder.id, '', contents, token);
          sendResponse({ message: 'Bookmarklets created successfully!' });
        } catch (error) {
          sendResponse({ message: `Error: ${error.message}` });
        }
      });
    });
    
    return true;
  }
}); 