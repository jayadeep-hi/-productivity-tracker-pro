// Popup functionality for Productivity Time Tracker
class PopupManager {
    constructor() {
        this.currentTab = null;
        this.startTime = null;
        this.isTracking = false;
        this.updateInterval = null;
        this.initialize();
    }

    async initialize() {
        await this.loadCurrentStatus();
        await this.loadTodayStats();
        this.setupEventListeners();
        this.startUpdateTimer();
    }

    async loadCurrentStatus() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getCurrentStatus' });
            this.isTracking = response.isTracking;
            this.currentTab = response.currentTab;
            
            this.updateStatusDisplay();
            this.updateCurrentSiteDisplay();
        } catch (error) {
            console.error('Error loading current status:', error);
        }
    }

    async loadTodayStats() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getStats' });
            this.updateTodayStats(response.dailyStats);
        } catch (error) {
            console.error('Error loading today stats:', error);
        }
    }

    updateStatusDisplay() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');

        if (this.isTracking) {
            statusDot.style.background = '#4ade80';
            statusText.textContent = 'Tracking...';
        } else {
            statusDot.style.background = '#f59e0b';
            statusText.textContent = 'Paused';
        }
    }

    updateCurrentSiteDisplay() {
        const siteTitle = document.getElementById('siteTitle');
        const siteUrl = document.getElementById('siteUrl');
        const categoryBadge = document.getElementById('categoryBadge');

        if (this.currentTab) {
            siteTitle.textContent = this.currentTab.title || 'Unknown Site';
            siteUrl.textContent = this.currentTab.url || 'Unknown URL';
            
            // Determine category based on URL
            const domain = new URL(this.currentTab.url).hostname;
            const category = this.classifyWebsite(domain);
            
            categoryBadge.textContent = category;
            categoryBadge.className = `category-badge ${category}`;
            
            // Calculate time spent
            if (this.startTime) {
                this.startTime = this.currentTab.startTime;
            }
        } else {
            siteTitle.textContent = 'No active tab';
            siteUrl.textContent = 'Please navigate to a website';
            categoryBadge.textContent = 'Unknown';
            categoryBadge.className = 'category-badge neutral';
        }
    }

    classifyWebsite(domain) {
        const productiveSites = [
            'github.com', 'stackoverflow.com', 'developer.mozilla.org', 'w3schools.com',
            'leetcode.com', 'hackerrank.com', 'codewars.com', 'freecodecamp.org',
            'udemy.com', 'coursera.org', 'edx.org', 'khanacademy.org',
            'google.com', 'bing.com', 'wikipedia.org', 'medium.com',
            'dev.to', 'hashnode.dev', 'css-tricks.com', 'smashingmagazine.com'
        ];

        const unproductiveSites = [
            'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com',
            'youtube.com', 'netflix.com', 'reddit.com', 'pinterest.com',
            'snapchat.com', 'discord.com', 'twitch.tv', 'spotify.com'
        ];

        if (productiveSites.some(site => domain.includes(site))) {
            return 'productive';
        } else if (unproductiveSites.some(site => domain.includes(site))) {
            return 'unproductive';
        } else {
            return 'neutral';
        }
    }

    updateTodayStats(dailyStats) {
        const today = new Date().toISOString().split('T')[0];
        const todayData = dailyStats[today] || {
            totalTime: 0,
            productiveTime: 0,
            unproductiveTime: 0,
            neutralTime: 0
        };

        // Update quick stats
        document.getElementById('todayTotal').textContent = this.formatTime(todayData.totalTime);
        document.getElementById('todayProductive').textContent = this.formatTime(todayData.productiveTime);
        document.getElementById('todayUnproductive').textContent = this.formatTime(todayData.unproductiveTime);

        // Calculate and update productivity score
        const productivityScore = this.calculateProductivityScore(todayData);
        document.getElementById('productivityScore').textContent = `${productivityScore}%`;

        // Update progress circle
        this.updateProgressCircle(productivityScore);

        // Update goal progress
        this.updateGoalProgress(todayData.totalTime);
    }

    calculateProductivityScore(dailyData) {
        if (dailyData.totalTime === 0) return 0;
        
        const productiveRatio = dailyData.productiveTime / dailyData.totalTime;
        const unproductiveRatio = dailyData.unproductiveTime / dailyData.totalTime;
        
        // Score formula: productive time gets full points, unproductive time gets negative points
        const score = Math.round((productiveRatio - unproductiveRatio * 0.5) * 100);
        return Math.max(0, Math.min(100, score));
    }

    updateProgressCircle(score) {
        const scoreCircle = document.querySelector('.score-circle');
        const degrees = (score / 100) * 360;
        
        scoreCircle.style.background = `conic-gradient(#10b981 0deg, #10b981 ${degrees}deg, #e5e7eb ${degrees}deg, #e5e7eb 360deg)`;
    }

    updateGoalProgress(totalTime) {
        const dailyGoal = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
        const progress = Math.min((totalTime / dailyGoal) * 100, 100);
        
        document.getElementById('goalProgress').style.width = `${progress}%`;
        document.getElementById('goalText').textContent = `${Math.round(progress)}% of daily goal`;
    }

    formatTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    formatTimeDetailed(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    startUpdateTimer() {
        // Update time display every second
        this.updateInterval = setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
    }

    updateTimeDisplay() {
        if (this.isTracking && this.startTime) {
            const currentTime = Date.now();
            const timeSpent = currentTime - this.startTime;
            document.getElementById('timeSpent').textContent = this.formatTimeDetailed(timeSpent);
        }
    }

    setupEventListeners() {
        // Open Dashboard button
        document.getElementById('openDashboard').addEventListener('click', async () => {
            try {
                await chrome.runtime.sendMessage({ action: 'openDashboard' });
                window.close();
            } catch (error) {
                console.error('Error opening dashboard:', error);
            }
        });

        // Pause/Resume Tracking button
        document.getElementById('pauseTracking').addEventListener('click', () => {
            this.toggleTracking();
        });
    }

    async toggleTracking() {
        this.isTracking = !this.isTracking;
        
        if (this.isTracking) {
            this.startTime = Date.now();
            document.getElementById('pauseTracking').textContent = '⏸️ Pause Tracking';
        } else {
            document.getElementById('pauseTracking').textContent = '▶️ Resume Tracking';
        }
        
        this.updateStatusDisplay();
    }

    // Cleanup when popup closes
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const popupManager = new PopupManager();
    
    // Cleanup when popup closes
    window.addEventListener('beforeunload', () => {
        popupManager.cleanup();
    });
});

// Handle popup visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Popup is being hidden, cleanup
        const popupManager = window.popupManager;
        if (popupManager) {
            popupManager.cleanup();
        }
    }
});
