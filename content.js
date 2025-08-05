// Content script for Zomato Review Sentiment Analyzer

class ZomatoReviewAnalyzer {
    constructor() {
        this.reviews = [];
        this.sentimentScores = [];
        this.init();
    }

    init() {
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        // Also listen for navigation changes (for SPA)
        let currentUrl = window.location.href;
        const checkUrlChange = () => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                console.log('URL changed, re-initializing...');
                setTimeout(() => this.setup(), 1000);
            }
        };
        
        // Check for URL changes every 2 seconds
        setInterval(checkUrlChange, 2000);
    }

    setup() {
        // Add analyze button to the page
        this.addAnalyzeButton();
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'analyzeReviews') {
                // Add a small delay to ensure page is fully loaded
                setTimeout(() => {
                    this.analyzeReviews().then(results => {
                        sendResponse(results);
                    }).catch(error => {
                        console.error('Error in analyzeReviews:', error);
                        sendResponse({
                            success: false,
                            error: error.message || 'Failed to analyze reviews'
                        });
                    });
                }, 1000); // 1 second delay
                return true; // Keep message channel open for async response
            }
        });
    }

    addAnalyzeButton() {
        // Check if we're on a Zomato page (very flexible detection)
        const isZomatoPage = window.location.href.includes('zomato.com');
        
        console.log('URL check:', {
            url: window.location.href,
            isZomato: isZomatoPage
        });

        // Add button to any Zomato page
        if (!isZomatoPage) {
            console.log('Not on Zomato page, skipping button addition');
            return;
        }

        // Remove existing button if any
        const existingButton = document.getElementById('sentiment-analyze-btn');
        if (existingButton) {
            existingButton.remove();
        }

        // Create analyze button
        const button = document.createElement('button');
        button.id = 'sentiment-analyze-btn';
        button.textContent = '🔍 Analyze Reviews';
        button.className = 'sentiment-analyze-button';
        button.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            z-index: 10000 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 25px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
            transition: all 0.3s ease !important;
        `;
        
        button.addEventListener('click', () => this.analyzeReviewsAndDisplay());
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });

        // Add to body for guaranteed placement
        document.body.appendChild(button);
        console.log('Analyze button added to page');
    }

    async scrapeReviews() {
        const reviews = [];
        
        console.log('Starting review scraping...');
        console.log('Current URL:', window.location.href);
        
        // Wait a bit for dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // More comprehensive selectors for Zomato reviews
        const reviewSelectors = [
            '[data-testid="review-item"]',
            '[data-testid="review-text"]',
            '[data-testid="user-review"]',
            '[data-testid="review-content"]',
            '.review-item',
            '.review-container',
            '.user-review',
            '[class*="review"]',
            '[class*="Review"]',
            '.review-text',
            '.review-content',
            '.user-review-text',
            '.review-description',
            '.review-body',
            '.review-message',
            '.review-comment',
            '.review-detail',
            '.review-summary',
            '.review-full-text',
            '.review-snippet',
            '.review-excerpt',
            '.review-paragraph',
            '.user-review-content',
            '.review-user-content',
            '.review-user-text',
            '.review-user-message',
            '.review-user-comment',
            '.review-user-description',
            '.review-user-body',
            '.review-user-summary',
            '.review-user-full-text',
            '.review-user-snippet',
            '.review-user-excerpt',
            '.review-user-paragraph',
            // Additional selectors for modern Zomato
            '[data-testid="review"]',
            '[data-testid="user-review-text"]',
            '[data-testid="review-text-content"]',
            '.review-text-content',
            '.user-review-text-content',
            '.review-description-text',
            '.review-body-text',
            '.review-message-text',
            '.review-comment-text',
            '.review-detail-text',
            '.review-summary-text',
            '.review-full-text-content',
            '.review-snippet-text',
            '.review-excerpt-text',
            '.review-paragraph-text'
        ];

        let reviewElements = [];
        
        // Try different selectors to find reviews
        for (const selector of reviewSelectors) {
            reviewElements = document.querySelectorAll(selector);
            if (reviewElements.length > 0) {
                console.log(`Found ${reviewElements.length} reviews with selector: ${selector}`);
                break;
            }
        }

        // If no reviews found with specific selectors, try more aggressive search
        if (reviewElements.length === 0) {
            console.log('No reviews found with specific selectors, trying broader search...');
            
            // Look for elements with review-related text patterns
            const allElements = document.querySelectorAll('*');
            reviewElements = Array.from(allElements).filter(el => {
                const text = el.textContent.trim();
                
                // More comprehensive review keywords
                const reviewKeywords = [
                    'food', 'service', 'restaurant', 'delicious', 'tasty', 'good', 'bad', 'great',
                    'amazing', 'terrible', 'love', 'hate', 'recommend', 'avoid', 'experience',
                    'quality', 'taste', 'atmosphere', 'staff', 'wait', 'price', 'value', 'dish',
                    'meal', 'cuisine', 'flavor', 'portion', 'ambiance', 'delivery', 'takeaway',
                    'dine-in', 'excellent', 'outstanding', 'fantastic', 'brilliant', 'superb',
                    'incredible', 'wonderful', 'yummy', 'enjoy', 'satisfied', 'best', 'awesome',
                    'nice', 'pleasant', 'fresh', 'hot', 'crispy', 'juicy', 'flavorful', 'aromatic',
                    'authentic', 'traditional', 'homemade', 'generous', 'reasonable', 'affordable',
                    'worth', 'premium', 'awful', 'horrible', 'disgusting', 'worst', 'disappointed',
                    'poor', 'mediocre', 'bland', 'cold', 'overcooked', 'undercooked', 'expensive',
                    'waste', 'never', 'dry', 'soggy', 'burnt', 'tasteless', 'flavorless', 'greasy',
                    'oily', 'salty', 'spicy', 'slow', 'rude', 'unfriendly', 'dirty', 'noisy',
                    'crowded', 'small', 'overpriced'
                ];
                
                const hasReviewKeywords = reviewKeywords.some(keyword => text.toLowerCase().includes(keyword));
                const hasReasonableLength = text.length > 20 && text.length < 2000;
                const hasMultipleWords = text.split(' ').length > 3;
                const isNotNavigation = !el.closest('nav') && !el.closest('header') && !el.closest('footer');
                const isNotButton = !el.tagName || !['BUTTON', 'A', 'INPUT', 'SELECT', 'OPTION'].includes(el.tagName);
                const isNotScript = !el.closest('script') && !el.closest('style');
                const isNotHidden = el.offsetHeight > 0 && el.offsetWidth > 0;
                const isNotExtension = !el.id || !el.id.includes('sentiment-');
                
                return hasReviewKeywords && hasReasonableLength && hasMultipleWords && 
                       isNotNavigation && isNotButton && isNotScript && isNotHidden && isNotExtension;
            });
            
            console.log(`Found ${reviewElements.length} potential review elements`);
        }

        // If still no reviews found, try one more time after a longer delay
        if (reviewElements.length === 0) {
            console.log('No reviews found, waiting longer for dynamic content to load...');
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
            
            // Try the search again with even broader criteria
            const allElements = document.querySelectorAll('*');
            reviewElements = Array.from(allElements).filter(el => {
                const text = el.textContent.trim();
                
                // Even broader keywords
                const broadKeywords = [
                    'food', 'service', 'restaurant', 'delicious', 'tasty', 'good', 'bad', 'great',
                    'amazing', 'terrible', 'love', 'hate', 'recommend', 'avoid', 'experience',
                    'quality', 'taste', 'atmosphere', 'staff', 'wait', 'price', 'value', 'dish',
                    'meal', 'cuisine', 'flavor', 'portion', 'ambiance', 'delivery', 'takeaway',
                    'dine-in', 'excellent', 'outstanding', 'fantastic', 'brilliant', 'superb',
                    'incredible', 'wonderful', 'yummy', 'enjoy', 'satisfied', 'best', 'awesome',
                    'nice', 'pleasant', 'fresh', 'hot', 'crispy', 'juicy', 'flavorful', 'aromatic',
                    'authentic', 'traditional', 'homemade', 'generous', 'reasonable', 'affordable',
                    'worth', 'premium', 'awful', 'horrible', 'disgusting', 'worst', 'disappointed',
                    'poor', 'mediocre', 'bland', 'cold', 'overcooked', 'undercooked', 'expensive',
                    'waste', 'never', 'dry', 'soggy', 'burnt', 'tasteless', 'flavorless', 'greasy',
                    'oily', 'salty', 'spicy', 'slow', 'rude', 'unfriendly', 'dirty', 'noisy',
                    'crowded', 'small', 'overpriced', 'like', 'dislike', 'enjoyed', 'hated',
                    'loved', 'enjoyable', 'disappointing', 'satisfying', 'unsatisfying', 'perfect',
                    'imperfect', 'wonderful', 'awful', 'fantastic', 'terrible', 'amazing', 'horrible',
                    'incredible', 'disgusting', 'outstanding', 'poor', 'excellent', 'mediocre',
                    'superb', 'awful', 'brilliant', 'terrible', 'fantastic', 'horrible'
                ];
                
                const hasReviewKeywords = broadKeywords.some(keyword => text.toLowerCase().includes(keyword));
                const hasReasonableLength = text.length > 15 && text.length < 3000;
                const hasMultipleWords = text.split(' ').length > 2;
                const isNotNavigation = !el.closest('nav') && !el.closest('header') && !el.closest('footer');
                const isNotButton = !el.tagName || !['BUTTON', 'A', 'INPUT', 'SELECT', 'OPTION'].includes(el.tagName);
                const isNotScript = !el.closest('script') && !el.closest('style');
                const isNotHidden = el.offsetHeight > 0 && el.offsetWidth > 0;
                const isNotExtension = !el.id || !el.id.includes('sentiment-');
                
                return hasReviewKeywords && hasReasonableLength && hasMultipleWords && 
                       isNotNavigation && isNotButton && isNotScript && isNotHidden && isNotExtension;
            });
            
            console.log(`After longer retry: Found ${reviewElements.length} potential review elements`);
        }

        // Remove duplicates and filter out very similar texts
        const uniqueReviews = [];
        const seenTexts = new Set();
        
        reviewElements.forEach(element => {
            const text = element.textContent.trim();
            const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').substring(0, 100);
            
            if (!seenTexts.has(normalizedText) && text.length > 20) {
                seenTexts.add(normalizedText);
                uniqueReviews.push({
                    text: text,
                    element: element
                });
            }
        });

        console.log(`After deduplication: ${uniqueReviews.length} unique reviews`);

        // Take up to 10 reviews and randomly select 5
        const maxReviews = Math.min(uniqueReviews.length, 10);
        const selectedIndices = this.getRandomIndices(maxReviews, 5);
        
        selectedIndices.forEach(index => {
            const review = uniqueReviews[index];
            if (review) {
                reviews.push(review);
            }
        });

        console.log(`Final reviews to analyze: ${reviews.length}`);
        return reviews;
    }

    getRandomIndices(max, count) {
        const indices = [];
        const available = Array.from({length: max}, (_, i) => i);
        
        for (let i = 0; i < count && available.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * available.length);
            indices.push(available.splice(randomIndex, 1)[0]);
        }
        
        return indices;
    }

    async performSentimentAnalysis(text) {
        // Enhanced sentiment analysis using keyword matching with weights
        const positiveWords = {
            'excellent': 3, 'amazing': 3, 'fantastic': 3, 'outstanding': 3, 'perfect': 3,
            'brilliant': 3, 'superb': 3, 'incredible': 3, 'wonderful': 2, 'delicious': 2,
            'tasty': 2, 'yummy': 2, 'love': 2, 'enjoy': 2, 'satisfied': 2, 'recommend': 2,
            'best': 2, 'awesome': 2, 'great': 1, 'good': 1, 'nice': 1, 'pleasant': 1,
            'fresh': 1, 'hot': 1, 'crispy': 1, 'juicy': 1, 'flavorful': 2, 'aromatic': 1,
            'authentic': 1, 'traditional': 1, 'homemade': 1, 'generous': 1, 'reasonable': 1,
            'affordable': 1, 'worth': 1, 'value': 1, 'quality': 1, 'premium': 1
        };
        
        const negativeWords = {
            'terrible': 3, 'awful': 3, 'horrible': 3, 'disgusting': 3, 'worst': 3,
            'hate': 3, 'disappointed': 2, 'poor': 2, 'mediocre': 2, 'bland': 2,
            'cold': 1, 'overcooked': 2, 'undercooked': 2, 'expensive': 1, 'waste': 2,
            'avoid': 2, 'never': 2, 'bad': 1, 'dry': 1, 'soggy': 1, 'burnt': 2,
            'tasteless': 2, 'flavorless': 2, 'greasy': 1, 'oily': 1, 'salty': 1,
            'spicy': 0, 'hot': 0, 'slow': 1, 'rude': 2, 'unfriendly': 2, 'dirty': 2,
            'noisy': 1, 'crowded': 0, 'small': 0, 'expensive': 1, 'overpriced': 2
        };

        // Clean and normalize text
        const cleanText = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        const words = cleanText.split(/\s+/);
        let positiveScore = 0;
        let negativeScore = 0;
        let totalWeight = 0;

        // Calculate weighted scores
        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (positiveWords.hasOwnProperty(cleanWord)) {
                positiveScore += positiveWords[cleanWord];
                totalWeight += positiveWords[cleanWord];
            }
            if (negativeWords.hasOwnProperty(cleanWord)) {
                negativeScore += negativeWords[cleanWord];
                totalWeight += negativeWords[cleanWord];
            }
        });

        // Count individual words for statistics
        let positiveCount = 0;
        let negativeCount = 0;
        words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (positiveWords.hasOwnProperty(cleanWord)) positiveCount++;
            if (negativeWords.hasOwnProperty(cleanWord)) negativeCount++;
        });

        // Calculate final sentiment score
        let sentimentScore = 0;
        if (totalWeight > 0) {
            sentimentScore = (positiveScore - negativeScore) / totalWeight;
        } else if (words.length > 0) {
            // Fallback to simple ratio if no weighted words found
            sentimentScore = (positiveCount - negativeCount) / words.length;
        }

        // Clamp score to -1 to 1 range
        sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

        // Determine sentiment label with adjusted thresholds
        let sentiment = 'neutral';
        if (sentimentScore > 0.05) sentiment = 'positive';
        else if (sentimentScore < -0.05) sentiment = 'negative';

        console.log(`Sentiment analysis for: "${text.substring(0, 50)}..."`);
        console.log(`Positive words: ${positiveCount}, Negative words: ${negativeCount}`);
        console.log(`Positive score: ${positiveScore}, Negative score: ${negativeScore}`);
        console.log(`Final sentiment score: ${sentimentScore}, Sentiment: ${sentiment}`);

        return {
            score: sentimentScore,
            sentiment: sentiment,
            positiveWords: positiveCount,
            negativeWords: negativeCount,
            totalWords: words.length
        };
    }

    async analyzeReviews() {
        try {
            console.log('Starting review analysis...');
            
            // Scrape reviews
            const reviews = await this.scrapeReviews();
            
            if (reviews.length === 0) {
                console.log('No reviews found');
                return {
                    success: false,
                    error: 'No reviews found on this page'
                };
            }

            console.log(`Found ${reviews.length} reviews to analyze:`);
            reviews.forEach((review, index) => {
                console.log(`Review ${index + 1}: "${review.text.substring(0, 100)}..."`);
            });

            // Perform sentiment analysis on each review
            const analyzedReviews = [];
            for (let i = 0; i < reviews.length; i++) {
                const review = reviews[i];
                console.log(`\nAnalyzing review ${i + 1}:`);
                const analysis = await this.performSentimentAnalysis(review.text);
                analyzedReviews.push({
                    text: review.text.substring(0, 200) + (review.text.length > 200 ? '...' : ''),
                    analysis: analysis
                });
            }

            // Calculate average sentiment score
            const scores = analyzedReviews.map(r => r.analysis.score);
            const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

            console.log(`\nAll scores: ${scores.map(s => s.toFixed(3)).join(', ')}`);
            console.log(`Average score: ${averageScore.toFixed(3)}`);

            // Find most positive and least positive reviews
            const sortedReviews = [...analyzedReviews].sort((a, b) => b.analysis.score - a.analysis.score);
            const mostPositive = sortedReviews[0];
            const leastPositive = sortedReviews[sortedReviews.length - 1];

            console.log(`Most positive review score: ${mostPositive.analysis.score.toFixed(3)}`);
            console.log(`Least positive review score: ${leastPositive.analysis.score.toFixed(3)}`);

            const result = {
                success: true,
                reviews: analyzedReviews,
                averageScore: averageScore,
                averageSentiment: this.getSentimentLabel(averageScore),
                mostPositive: mostPositive,
                leastPositive: leastPositive,
                totalReviews: analyzedReviews.length
            };

            console.log('Analysis complete:', result);
            return result;

        } catch (error) {
            console.error('Error in analyzeReviews:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getSentimentLabel(score) {
        if (score > 0.1) return 'positive';
        if (score < -0.1) return 'negative';
        return 'neutral';
    }

    async analyzeReviewsAndDisplay() {
        console.log('=== ZOMATO SENTIMENT ANALYZER DEBUG ===');
        console.log('Current URL:', window.location.href);
        console.log('Is restaurant page:', window.location.href.includes('/restaurants/'));
        
        const results = await this.analyzeReviews();
        if (results.success) {
            console.log('Analysis successful, displaying results');
            this.displayResultsOnPage(results);
        } else {
            console.log('Analysis failed:', results.error);
            this.showErrorOnPage(results.error);
        }
    }

    displayResultsOnPage(data) {
        // Remove existing overlay if any
        this.removeExistingOverlay();

        // Create overlay background
        const overlay = document.createElement('div');
        overlay.className = 'sentiment-overlay-background';
        overlay.addEventListener('click', () => this.removeExistingOverlay());

        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'sentiment-results-overlay';
        resultsContainer.addEventListener('click', (e) => e.stopPropagation());

        // Create header
        const header = document.createElement('div');
        header.className = 'sentiment-results-header';
        header.innerHTML = `
            <h2 class="sentiment-results-title">🍽️ Sentiment Analysis Results</h2>
            <button class="sentiment-close-btn" onclick="this.closest('.sentiment-overlay-background').remove()">×</button>
        `;

        // Create summary
        const summary = document.createElement('div');
        summary.className = 'sentiment-summary';
        summary.innerHTML = `
            <h3>📊 Analysis Summary</h3>
            <div class="sentiment-stats">
                <div class="sentiment-stat">
                    <span class="sentiment-stat-label">Average Sentiment:</span>
                    <span class="sentiment-stat-value">${this.capitalizeFirst(data.averageSentiment)}</span>
                </div>
                <div class="sentiment-stat">
                    <span class="sentiment-stat-label">Average Score:</span>
                    <span class="sentiment-stat-value">${data.averageScore.toFixed(3)}</span>
                </div>
                <div class="sentiment-stat">
                    <span class="sentiment-stat-label">Reviews Analyzed:</span>
                    <span class="sentiment-stat-value">${data.totalReviews}</span>
                </div>
            </div>
        `;

        // Create highlights
        const highlights = document.createElement('div');
        highlights.className = 'sentiment-highlights';
        highlights.innerHTML = `
            <div class="sentiment-highlight positive">
                <h4>😊 Most Positive Review</h4>
                <div class="sentiment-review-text">${data.mostPositive.text}</div>
                <div class="sentiment-score">Score: ${data.mostPositive.analysis.score.toFixed(3)}</div>
            </div>
            <div class="sentiment-highlight negative">
                <h4>😞 Least Positive Review</h4>
                <div class="sentiment-review-text">${data.leastPositive.text}</div>
                <div class="sentiment-score">Score: ${data.leastPositive.analysis.score.toFixed(3)}</div>
            </div>
        `;

        // Create all reviews list
        const allReviews = document.createElement('div');
        allReviews.innerHTML = `
            <h3>📝 All Analyzed Reviews</h3>
            <div class="sentiment-reviews-list">
                ${data.reviews.map((review, index) => `
                    <div class="sentiment-review-item ${review.analysis.sentiment}">
                        <div class="sentiment-review-header">
                            <span class="sentiment-review-number">Review ${index + 1}</span>
                            <span class="sentiment-badge ${review.analysis.sentiment}">
                                ${this.getSentimentEmoji(review.analysis.sentiment)} ${this.capitalizeFirst(review.analysis.sentiment)}
                            </span>
                        </div>
                        <div class="sentiment-review-content">${review.text}</div>
                        <div class="sentiment-review-stats">
                            <span>Score: ${review.analysis.score.toFixed(3)}</span>
                            <span>Positive words: ${review.analysis.positiveWords}</span>
                            <span>Negative words: ${review.analysis.negativeWords}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Assemble the overlay
        resultsContainer.appendChild(header);
        resultsContainer.appendChild(summary);
        resultsContainer.appendChild(highlights);
        resultsContainer.appendChild(allReviews);
        overlay.appendChild(resultsContainer);

        // Add to page
        document.body.appendChild(overlay);
    }

    showErrorOnPage(error) {
        this.removeExistingOverlay();

        const overlay = document.createElement('div');
        overlay.className = 'sentiment-overlay-background';
        overlay.addEventListener('click', () => this.removeExistingOverlay());

        const errorContainer = document.createElement('div');
        errorContainer.className = 'sentiment-results-overlay';
        errorContainer.innerHTML = `
            <div class="sentiment-results-header">
                <h2 class="sentiment-results-title">❌ Error</h2>
                <button class="sentiment-close-btn" onclick="this.closest('.sentiment-overlay-background').remove()">×</button>
            </div>
            <div style="padding: 20px; text-align: center;">
                <p style="color: #dc3545; font-size: 14px;">${error}</p>
            </div>
        `;

        overlay.appendChild(errorContainer);
        document.body.appendChild(overlay);
    }

    removeExistingOverlay() {
        const existingOverlay = document.querySelector('.sentiment-overlay-background');
        if (existingOverlay) {
            existingOverlay.remove();
        }
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
}

// Initialize the analyzer
new ZomatoReviewAnalyzer(); 