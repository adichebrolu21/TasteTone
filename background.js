// Background service worker for Zomato Sentiment Analyzer

chrome.runtime.onInstalled.addListener(() => {
    console.log('Zomato Sentiment Analyzer extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will be handled by the popup, but we can add additional logic here if needed
    console.log('Extension icon clicked on tab:', tab.url);
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTabInfo') {
        // Return information about the current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                sendResponse({
                    url: tabs[0].url,
                    isZomato: tabs[0].url.includes('zomato.com'),
                    isRestaurantPage: tabs[0].url.includes('/restaurants/')
                });
            }
        });
        return true; // Keep message channel open for async response
    }
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
    chrome.runtime.reload();
}); 