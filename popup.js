document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  chrome.storage.sync.get(['org', 'repo', 'token', 'folderName'], (result) => {
    document.getElementById('org').value = result.org || '';
    document.getElementById('repo').value = result.repo || '';
    document.getElementById('token').value = result.token || '';
    document.getElementById('folderName').value = result.folderName || '';
  });

  document.getElementById('syncButton').addEventListener('click', async () => {
    const org = document.getElementById('org').value;
    const repo = document.getElementById('repo').value;
    const token = document.getElementById('token').value;
    const folderName = document.getElementById('folderName').value;

    // Save settings
    chrome.storage.sync.set({ org, repo, token, folderName });

    // Send message to background script to start sync
    chrome.runtime.sendMessage(
      { action: 'startSync', org, repo, token, folderName },
      (response) => {
        document.getElementById('status').textContent = response.message;
      }
    );
  });
}); 