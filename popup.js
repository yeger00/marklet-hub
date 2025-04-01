document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  chrome.storage.sync.get(['org', 'repo', 'token'], (result) => {
    document.getElementById('org').value = result.org || '';
    document.getElementById('repo').value = result.repo || '';
    document.getElementById('token').value = result.token || '';
  });

  document.getElementById('syncButton').addEventListener('click', async () => {
    const org = document.getElementById('org').value;
    const repo = document.getElementById('repo').value;
    const token = document.getElementById('token').value;

    // Save settings
    chrome.storage.sync.set({ org, repo, token });

    // Send message to background script to start sync
    chrome.runtime.sendMessage(
      { action: 'startSync', org, repo, token },
      (response) => {
        document.getElementById('status').textContent = response.message;
      }
    );
  });
}); 