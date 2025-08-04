# 🍽️ Zomato Review Sentiment Analyzer

A Chrome extension that performs sentiment analysis on Zomato restaurant reviews. The extension scrapes 5 random reviews from any Zomato restaurant page, analyzes their sentiment, and provides detailed insights including average sentiment score, most positive and least positive reviews.

## ✨ Features

- **Smart Review Scraping**: Automatically finds and extracts reviews from Zomato restaurant pages
- **Sentiment Analysis**: Uses keyword-based sentiment analysis to score reviews
- **Random Sampling**: Selects 5 random reviews from available reviews for analysis
- **Comprehensive Results**: Shows average sentiment score, most positive and least positive reviews
- **Beautiful UI**: Modern, responsive interface with gradient designs and smooth animations
- **Dual Interface**: Works both as a popup extension and with on-page overlay display

## 📊 Analysis Features

- **Average Sentiment Score**: Calculates the overall sentiment across all analyzed reviews
- **Sentiment Classification**: Categorizes reviews as Positive, Negative, or Neutral
- **Review Highlights**: Identifies the most positive and least positive reviews
- **Detailed Statistics**: Shows positive/negative word counts and individual review scores
- **Visual Indicators**: Color-coded results with emojis for easy interpretation

## 🚀 Installation

### Method 1: Load as Unpacked Extension (Recommended)

1. **Download the Extension Files**
   - Download all the files from this repository to a folder on your computer

2. **Open Chrome Extensions Page**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or go to Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

5. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Zomato Sentiment Analyzer" and click the pin icon

## 📖 How to Use

### Using the Extension Popup

1. **Navigate to a Zomato Restaurant Page**
   - Go to any restaurant page on Zomato (e.g., `https://www.zomato.com/restaurants/...`)
   - Make sure the URL contains `/restaurants/`

2. **Click the Extension Icon**
   - Click the extension icon in your Chrome toolbar
   - The popup will open with an "Analyze Reviews" button

3. **Analyze Reviews**
   - Click the "🔍 Analyze Reviews" button
   - Wait for the analysis to complete
   - View the results in the popup

### Using the On-Page Button

1. **Navigate to a Zomato Restaurant Page**
   - The extension automatically adds an "🔍 Analyze Reviews" button to restaurant pages

2. **Click the Analyze Button**
   - Click the button that appears on the page
   - Results will be displayed in an overlay on the page

## 📋 File Structure

```
zomato-sentiment-analyzer/
├── manifest.json          # Extension configuration
├── content.js            # Content script for page interaction
├── popup.html            # Popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── styles.css            # Content script styling
├── background.js         # Background service worker
└── README.md            # This file
```

## 🔧 Technical Details

### Sentiment Analysis Algorithm

The extension uses a keyword-based sentiment analysis approach:

**Positive Keywords:**
- good, great, excellent, amazing, wonderful, fantastic, delicious
- tasty, yummy, outstanding, perfect, love, enjoy, satisfied
- recommend, best, awesome, brilliant, superb, incredible

**Negative Keywords:**
- bad, terrible, awful, horrible, disgusting, worst, hate
- disappointed, poor, mediocre, average, bland, cold
- overcooked, undercooked, expensive, waste, avoid, never

**Scoring Method:**
- Score = (Positive Words / Total Words) - (Negative Words / Total Words)
- Range: -1 to +1 (negative to positive)
- Classification: > 0.1 = Positive, < -0.1 = Negative, else = Neutral

### Review Scraping Strategy

The extension uses multiple strategies to find reviews:

1. **CSS Selectors**: Tries common review selectors like `[data-testid="review-item"]`
2. **Class-based Search**: Looks for elements with "review" in their class names
3. **Content Analysis**: Filters text elements that look like reviews based on:
   - Length (50-500 characters)
   - Keywords (food, service, restaurant, good, bad, great)

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds and smooth animations
- **Responsive Layout**: Works on different screen sizes
- **Color Coding**: Green for positive, red for negative, gray for neutral
- **Emoji Indicators**: Visual sentiment indicators
- **Smooth Interactions**: Hover effects and transitions

## 🔒 Privacy & Security

- **No Data Collection**: The extension doesn't collect or store any user data
- **Local Processing**: All sentiment analysis happens locally in your browser
- **No External APIs**: No data is sent to external services
- **Open Source**: Full transparency of all code and functionality

## 🐛 Troubleshooting

### Extension Not Working?

1. **Check URL**: Make sure you're on a Zomato restaurant page (URL contains `/restaurants/`)
2. **Reload Page**: Try refreshing the page after installing the extension
3. **Check Console**: Open Developer Tools (F12) and check for any error messages
4. **Reinstall**: Try removing and reinstalling the extension

### No Reviews Found?

1. **Scroll Down**: Some reviews might be loaded dynamically as you scroll
2. **Wait for Loading**: Give the page time to fully load
3. **Different Restaurant**: Try a different restaurant page
4. **Check Page Structure**: The extension might need updates for new Zomato layouts

## 🤝 Contributing

Feel free to contribute to this project by:

1. **Reporting Bugs**: Open an issue for any problems you encounter
2. **Suggesting Features**: Propose new features or improvements
3. **Code Contributions**: Submit pull requests with improvements
4. **Documentation**: Help improve the README or add comments

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built for educational and personal use
- Inspired by the need for quick restaurant review insights
- Uses modern web technologies and Chrome Extension APIs

---

**Note**: This extension is not affiliated with Zomato and is created for educational purposes. Please respect Zomato's terms of service when using this extension. 
 