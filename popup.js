// Popup script for Zomato Sentiment Analyzer

class PopupManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkCurrentTab();
    }

    bindEvents() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.addEventListener('click', () => this.analyzeReviews());
    }

    async checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            console.log('Current tab URL:', tab.url);
            
            if (!tab.url.includes('zomato.com')) {
                this.showMessage('Please navigate to a Zomato page to use this extension.');
                return;
            }

            // Allow any Zomato page - don't restrict to restaurant pages
            console.log('On Zomato page, extension ready to use');
        } catch (error) {
            console.error('Error checking current tab:', error);
        }
    }

    async analyzeReviews() {
        this.showLoading();
        this.hideResults();
        this.hideError();
        this.hideNoReviews();

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            console.log('Analyzing reviews for URL:', tab.url);
            
            if (!tab.url.includes('zomato.com')) {
                this.showError('Please navigate to a Zomato page.');
                return;
            }

            // Allow any Zomato page to be analyzed
            console.log('Attempting to analyze reviews on any Zomato page');

            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzeReviews' });
            
            if (response.success) {
                this.displayResults(response);
            } else {
                if (response.error === 'No reviews found on this page') {
                    this.showNoReviews();
                } else {
                    this.showError(response.error || 'Failed to analyze reviews');
                }
            }
        } catch (error) {
            console.error('Error analyzing reviews:', error);
            this.showError('Failed to analyze reviews. Please make sure you are on a Zomato restaurant page and the page has loaded completely.');
        } finally {
            this.hideLoading();
        }
    }

    displayResults(data) {
        // Display summary
        document.getElementById('avgSentiment').textContent = this.capitalizeFirst(data.averageSentiment);
        document.getElementById('avgScore').textContent = data.averageScore.toFixed(3);
        document.getElementById('totalReviews').textContent = data.totalReviews;

        // Display most positive review
        document.getElementById('mostPositive').textContent = data.mostPositive.text;
        document.getElementById('mostPositiveScore').textContent = data.mostPositive.analysis.score.toFixed(3);

        // Display least positive review
        document.getElementById('leastPositive').textContent = data.leastPositive.text;
        document.getElementById('leastPositiveScore').textContent = data.leastPositive.analysis.score.toFixed(3);

        // Display all reviews
        this.displayAllReviews(data.reviews);

        this.showResults();
    }

    displayAllReviews(reviews) {
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = '';

        reviews.forEach((review, index) => {
            const reviewElement = document.createElement('div');
            reviewElement.className = `review-item ${review.analysis.sentiment}`;
            
            reviewElement.innerHTML = `
                <div class="review-header">
                    <span class="review-number">Review ${index + 1}</span>
                    <span class="sentiment-badge ${review.analysis.sentiment}">
                        ${this.getSentimentEmoji(review.analysis.sentiment)} ${this.capitalizeFirst(review.analysis.sentiment)}
                    </span>
                </div>
                <div class="review-content">${review.text}</div>
                <div class="review-stats">
                    <span>Score: ${review.analysis.score.toFixed(3)}</span>
                    <span>Positive words: ${review.analysis.positiveWords}</span>
                    <span>Negative words: ${review.analysis.negativeWords}</span>
                </div>
            `;
            
            reviewsList.appendChild(reviewElement);
        });
    }

    getSentimentEmoji(sentiment) {
        switch (sentiment) {
            case 'positive': return '😊';
            case 'negative': return '😞';
            default: return '😐';
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('analyzeBtn').disabled = true;
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('analyzeBtn').disabled = false;
    }

    showResults() {
        document.getElementById('results').classList.remove('hidden');
    }

    hideResults() {
        document.getElementById('results').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('error').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }

    showNoReviews() {
        document.getElementById('noReviews').classList.remove('hidden');
    }

    hideNoReviews() {
        document.getElementById('noReviews').classList.add('hidden');
    }

    showMessage(message) {
        // Simple message display
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize popup
new PopupManager(); 