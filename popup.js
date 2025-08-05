// Popup script for Zomato Sentiment Analyzer

document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    const noReviews = document.getElementById('noReviews');

    // Check if we're on a Zomato page when popup opens
    checkCurrentPage();

    // Add click event to analyze button
    analyzeBtn.addEventListener('click', async () => {
        await analyzeReviews();
    });

    async function checkCurrentPage() {
        try {
            // Get current tab info
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('zomato.com')) {
                showNoReviewsMessage('Please navigate to a Zomato restaurant page to analyze reviews.');
                return;
            }

            if (!tab.url.includes('/restaurants/') && 
                !tab.url.includes('/restaurant/') && 
                !tab.url.includes('/place/') && 
                !tab.url.includes('/dining/') && 
                !tab.url.includes('/food/') && 
                !tab.url.includes('/menu/') && 
                !tab.url.includes('/order/') && 
                !tab.url.includes('/reviews/') && 
                !tab.url.includes('/photos/') && 
                !tab.url.includes('/info/')) {
                showNoReviewsMessage('Please navigate to a specific restaurant page to analyze reviews.');
                return;
            }

            // Page looks good, enable analyze button
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = '🔍 Analyze Reviews';

        } catch (err) {
            console.error('Error checking current page:', err);
            showError('Failed to check current page. Please refresh and try again.');
        }
    }

    async function analyzeReviews() {
        try {
            // Show loading state
            showLoading();
            hideResults();
            hideError();
            hideNoReviews();

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }

            // Send message to content script to analyze reviews
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'analyzeReviews'
            });

            if (!response) {
                throw new Error('No response from content script. Please refresh the page and try again.');
            }

            if (!response.success) {
                throw new Error(response.error || 'Failed to analyze reviews');
            }

            // Display results
            displayResults(response);

        } catch (err) {
            console.error('Error analyzing reviews:', err);
            showError(err.message || 'Failed to analyze reviews. Please try again.');
        } finally {
            hideLoading();
        }
    }

    function displayResults(data) {
        // Update summary
        document.getElementById('avgSentiment').textContent = capitalizeFirst(data.averageSentiment);
        document.getElementById('avgScore').textContent = data.averageScore.toFixed(3);
        document.getElementById('totalReviews').textContent = data.totalReviews;

        // Update highlights
        document.getElementById('mostPositive').textContent = data.mostPositive.text;
        document.getElementById('mostPositiveScore').textContent = data.mostPositive.analysis.score.toFixed(3);
        document.getElementById('leastPositive').textContent = data.leastPositive.text;
        document.getElementById('leastPositiveScore').textContent = data.leastPositive.analysis.score.toFixed(3);

        // Update all reviews list
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = data.reviews.map((review, index) => `
            <div class="review-item ${review.analysis.sentiment}">
                <div class="review-header">
                    <span class="review-number">Review ${index + 1}</span>
                    <span class="badge ${review.analysis.sentiment}">
                        ${getSentimentEmoji(review.analysis.sentiment)} ${capitalizeFirst(review.analysis.sentiment)}
                    </span>
                </div>
                <div class="review-content">${review.text}</div>
                <div class="review-stats">
                    <span>Score: ${review.analysis.score.toFixed(3)}</span>
                    <span>Positive words: ${review.analysis.positiveWords}</span>
                    <span>Negative words: ${review.analysis.negativeWords}</span>
                </div>
            </div>
        `).join('');

        showResults();
    }

    function showLoading() {
        loading.classList.remove('hidden');
        analyzeBtn.disabled = true;
    }

    function hideLoading() {
        loading.classList.add('hidden');
        analyzeBtn.disabled = false;
    }

    function showResults() {
        results.classList.remove('hidden');
    }

    function hideResults() {
        results.classList.add('hidden');
    }

    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        error.classList.remove('hidden');
    }

    function hideError() {
        error.classList.add('hidden');
    }

    function showNoReviewsMessage(message) {
        document.getElementById('noReviews').querySelector('p').textContent = message;
        noReviews.classList.remove('hidden');
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '🔍 Analyze Reviews (Disabled)';
    }

    function hideNoReviews() {
        noReviews.classList.add('hidden');
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getSentimentEmoji(sentiment) {
        switch (sentiment) {
            case 'positive': return '😊';
            case 'negative': return '😞';
            default: return '😐';
        }
    }
}); 