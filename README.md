# Zomato Review Sentiment Analyzer

A Chrome extension that analyzes the sentiment of restaurant reviews on Zomato.com using keyword-based sentiment analysis.

## Features

- 🔍 **Smart Review Detection**: Automatically finds and analyzes restaurant reviews on Zomato pages
- 📊 **Sentiment Analysis**: Uses weighted keyword analysis to determine review sentiment
- 🎯 **Visual Results**: Displays analysis results in a beautiful overlay on the page
- 📱 **Popup Interface**: Clean popup interface for easy access and control
- 🔄 **Dynamic Content Support**: Works with dynamically loaded content

## Installation

### Method 1: Load as Unpacked Extension

1. **Download the extension files** to a folder on your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in the top right)
4. **Click "Load unpacked"** and select the folder containing the extension files
5. **Pin the extension** to your toolbar for easy access

### Method 2: Manual Installation

1. Create a new folder called `zomato-sentiment-analyzer`
2. Copy all the extension files into this folder:
   - `manifest.json`
   - `content.js`
   - `background.js`
   - `popup.html`
   - `popup.js`
   - `popup.css`
   - `styles.css`
3. Follow steps 2-5 from Method 1

## How to Use

### Using the Popup
1. **Navigate to a Zomato restaurant page** (e.g., `https://www.zomato.com/restaurants/...`)
2. **Click the extension icon** in your Chrome toolbar
3. **Click "🔍 Analyze Reviews"** in the popup
4. **View the results** showing sentiment analysis of the reviews

### Using the Page Button
1. **Navigate to any Zomato page**
2. **Look for the "🔍 Analyze Reviews" button** in the top-right corner
3. **Click the button** to analyze reviews on the current page
4. **View the results** in the overlay that appears

## Testing the Extension

### Test 1: Basic Functionality
1. Go to any Zomato restaurant page
2. Click the extension icon
3. Click "Analyze Reviews"
4. You should see analysis results

### Test 2: Page Button
1. Go to any Zomato page
2. Look for the floating "🔍 Analyze Reviews" button
3. Click it to test the page-based analysis

### Test 3: Error Handling
1. Go to a non-Zomato page
2. Click the extension icon
3. You should see a message asking you to navigate to a Zomato page

## Troubleshooting

### Extension Not Working?

1. **Check the console** (F12 → Console tab) for error messages
2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Find your extension and click the refresh icon
3. **Refresh the Zomato page** after reloading the extension
4. **Check permissions**:
   - Go to `chrome://extensions/`
   - Click "Details" on your extension
   - Ensure all permissions are granted

### No Reviews Found?

1. **Wait for the page to fully load** (reviews might be loaded dynamically)
2. **Scroll down** on the restaurant page to load more reviews
3. **Try refreshing the page** and then analyzing again
4. **Check if you're on a restaurant page** with actual reviews

### Button Not Appearing?

1. **Refresh the page** after installing the extension
2. **Check the console** for any JavaScript errors
3. **Ensure you're on a Zomato page** (URL contains `zomato.com`)
4. **Try navigating to a different Zomato page**

## Technical Details

### Sentiment Analysis Algorithm
- Uses weighted keyword matching
- Positive words: excellent, amazing, delicious, love, etc.
- Negative words: terrible, awful, hate, disgusting, etc.
- Neutral words are ignored
- Scores range from -1 (very negative) to +1 (very positive)

### Review Detection
- Searches for review-specific CSS selectors
- Falls back to keyword-based text analysis
- Filters out navigation, buttons, and hidden elements
- Handles dynamically loaded content

### Browser Compatibility
- Chrome 88+ (Manifest V3)
- Requires `activeTab`, `scripting`, and `tabs` permissions
- Works on all Zomato.com pages

## File Structure

```
zomato-sentiment-analyzer/
├── manifest.json      # Extension configuration
├── content.js         # Main content script (runs on Zomato pages)
├── background.js      # Background service worker
├── popup.html         # Popup interface HTML
├── popup.js           # Popup interface logic
├── popup.css          # Popup styling
├── styles.css         # Content script styling
└── README.md          # This file
```

## Development

### Making Changes
1. Edit the files as needed
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Refresh the Zomato page to test changes

### Debugging
- Open Chrome DevTools (F12)
- Check the Console tab for extension logs
- Look for messages starting with "ZOMATO SENTIMENT ANALYZER DEBUG"

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Ensure all files are present and properly formatted
3. Try reloading the extension and refreshing the page
4. Verify you're on a Zomato restaurant page with reviews

## License

This extension is provided as-is for educational and personal use. 
 