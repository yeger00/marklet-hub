# GitHub Bookmarklet Sync

A Chrome extension that syncs JavaScript files from a GitHub repository into bookmarklets in your Chrome bookmarks bar.

## Installation Instructions

### From Chrome Web Store
*(Coming soon)*

### Manual Installation
1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" button in the top left
5. Select the folder containing the extension files

## Usage
1. Click the extension icon in your Chrome toolbar
2. Enter the GitHub organization and repository names
3. (Optional) Enter a GitHub personal access token if you need to access private repositories
4. (Optional) Specify a custom folder name for the bookmarklets
5. Click "Sync" to create bookmarklets from all .js files in the repository

## Features
- Automatically converts JavaScript files to bookmarklets
- Maintains folder structure from the GitHub repository
- Supports both public and private repositories
- Updates existing bookmarklets when re-syncing
- Basic code minification for better bookmarklet compatibility

## Notes
- Only .js files will be converted to bookmarklets
- The extension requires permission to manage your bookmarks
- For private repositories, you'll need to provide a GitHub personal access token

## Contributing
Feel free to open issues or submit pull requests if you find any bugs or have suggestions for improvements.

## License
[MIT License](LICENSE) 