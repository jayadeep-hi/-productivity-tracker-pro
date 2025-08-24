// Dashboard functionality for Productivity Time Tracker
class DashboardManager {
    constructor() {
        this.charts = {};
        this.currentDateRange = 30;
        this.data = null;
        this.initialize();
    }

    async initialize() {
        await this.loadData();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
    }

    async loadData() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getStats' });
            this.data = response;
            console.log('Data loaded:', this.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupEventListeners() {
        // Date range selector
        document.getElementById('dateRange').addEventListener('change', (e) => {
            this.currentDateRange = parseInt(e.target.value);
            this.updateDashboard();
        });

        // Refresh button
        document.getElementById('refreshData').addEventListener('click', async () => {
            await this.loadData();
            this.updateDashboard();
        });

        // Export button
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        // Chart type controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateProductivityChart(e.target.dataset.chart);
            });
        });

        // Settings save button
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Load settings
        this.loadSettings();
    }

    initializeCharts() {
        this.initializeProductivityChart();
        this.initializeCategoryChart();
        this.initializeHourlyChart();
    }

    initializeProductivityChart() {
        const ctx = document.getElementById('productivityChart').getContext('2d');
        this.charts.productivity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Productivity Score',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    initializeCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Productive', 'Unproductive', 'Neutral'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initializeHourlyChart() {
        const ctx = document.getElementById('hourlyChart').getContext('2d');
        this.charts.hourly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Activity',
                    data: Array(24).fill(0),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Math.round(value / (1000 * 60)) + 'm';
                            }
                        }
                    }
                }
            }
        });
    }

    updateDashboard() {
        if (!this.data) return;

        this.updateOverviewCards();
        this.updateProductivityChart('productivity');
        this.updateCategoryChart();
        this.updateTopSites();
        this.updateWeeklySummary();
        this.updateInsights();
        this.updateHourlyChart();
        this.updateGoals();
    }

    updateOverviewCards() {
        const dateRange = this.getDateRangeData();
        const previousRange = this.getPreviousRangeData();

        // Calculate totals
        const totalTime = this.calculateTotalTime(dateRange);
        const productiveTime = this.calculateProductiveTime(dateRange);
        const productivityScore = this.calculateProductivityScore(dateRange);
        const sitesVisited = this.calculateSitesVisited(dateRange);

        // Calculate changes
        const totalTimeChange = this.calculatePercentageChange(
            this.calculateTotalTime(previousRange),
            totalTime
        );
        const productiveTimeChange = this.calculatePercentageChange(
            this.calculateProductiveTime(previousRange),
            productiveTime
        );
        const productivityScoreChange = this.calculatePercentageChange(
            this.calculateProductivityScore(previousRange),
            productivityScore
        );
        const sitesVisitedChange = this.calculatePercentageChange(
            this.calculateSitesVisited(previousRange),
            sitesVisited
        );

        // Update DOM
        document.getElementById('totalTime').textContent = this.formatTime(totalTime);
        document.getElementById('productiveTime').textContent = this.formatTime(productiveTime);
        document.getElementById('productivityScore').textContent = `${productivityScore}%`;
        document.getElementById('sitesVisited').textContent = sitesVisited;

        // Update changes
        this.updateChangeElement('totalTimeChange', totalTimeChange);
        this.updateChangeElement('productiveTimeChange', productiveTimeChange);
        this.updateChangeElement('productivityScoreChange', productivityScoreChange);
        this.updateChangeElement('sitesVisitedChange', sitesVisitedChange);
    }

    updateProductivityChart(chartType) {
        const dateRange = this.getDateRangeData();
        const labels = [];
        const data = [];

        dateRange.forEach(day => {
            labels.push(this.formatDate(day.date));
            if (chartType === 'productivity') {
                data.push(this.calculateProductivityScore([day]));
            } else {
                data.push(day.totalTime / (1000 * 60 * 60)); // Convert to hours
            }
        });

        this.charts.productivity.data.labels = labels;
        this.charts.productivity.data.datasets[0].data = data;
        this.charts.productivity.data.datasets[0].label = chartType === 'productivity' ? 'Productivity Score' : 'Time Spent (hours)';
        this.charts.productivity.update();
    }

    updateCategoryChart() {
        const dateRange = this.getDateRangeData();
        const productiveTime = this.calculateProductiveTime(dateRange);
        const unproductiveTime = this.calculateUnproductiveTime(dateRange);
        const neutralTime = this.calculateNeutralTime(dateRange);

        this.charts.category.data.datasets[0].data = [productiveTime, unproductiveTime, neutralTime];
        this.charts.category.update();
    }

    updateTopSites() {
        const dateRange = this.getDateRangeData();
        const siteStats = this.aggregateSiteStats(dateRange);
        const topSites = Object.entries(siteStats)
            .sort(([,a], [,b]) => b.time - a.time)
            .slice(0, 10);

        const topSitesList = document.getElementById('topSitesList');
        topSitesList.innerHTML = '';

        topSites.forEach(([domain, stats]) => {
            const siteItem = document.createElement('div');
            siteItem.className = 'site-item';
            siteItem.innerHTML = `
                <div class="site-info">
                    <div class="site-name">${domain}</div>
                    <span class="site-category ${stats.category}">${stats.category}</span>
                </div>
                <div class="site-time">${this.formatTime(stats.time)}</div>
            `;
            topSitesList.appendChild(siteItem);
        });
    }

    updateWeeklySummary() {
        const weeklyData = this.getWeeklyData();
        const weeklySummary = document.getElementById('weeklySummary');
        weeklySummary.innerHTML = '';

        weeklyData.forEach(week => {
            const weekItem = document.createElement('div');
            weekItem.className = 'week-item';
            weekItem.innerHTML = `
                <div class="week-date">${week.weekStart}</div>
                <div class="week-stats">
                    <div class="week-stat">
                        <div class="week-stat-value">${this.formatTime(week.totalTime)}</div>
                        <div class="week-stat-label">Total</div>
                    </div>
                    <div class="week-stat">
                        <div class="week-stat-value">${week.productivityScore}%</div>
                        <div class="week-stat-label">Score</div>
                    </div>
                </div>
            `;
            weeklySummary.appendChild(weekItem);
        });
    }

    updateInsights() {
        const insights = this.generateInsights();
        const insightsList = document.getElementById('insightsList');
        insightsList.innerHTML = '';

        insights.forEach(insight => {
            const insightItem = document.createElement('div');
            insightItem.className = 'insight-item';
            insightItem.innerHTML = `
                <div class="insight-text">${insight.text}</div>
                <div class="insight-metric">${insight.metric}</div>
            `;
            insightsList.appendChild(insightItem);
        });
    }

    updateHourlyChart() {
        const dateRange = this.getDateRangeData();
        const hourlyData = this.aggregateHourlyData(dateRange);

        this.charts.hourly.data.datasets[0].data = hourlyData;
        this.charts.hourly.update();
    }

    updateGoals() {
        const today = new Date().toISOString().split('T')[0];
        const todayData = this.data.dailyStats[today] || { totalTime: 0 };
        const dailyGoal = 6 * 60 * 60 * 1000; // 6 hours
        const progress = Math.min((todayData.totalTime / dailyGoal) * 100, 100);

        document.getElementById('dailyGoalProgress').style.width = `${progress}%`;
        document.getElementById('dailyGoalText').textContent = `${Math.round(progress)}% Complete`;
        document.getElementById('dailyGoalTime').textContent = 
            `${this.formatTime(todayData.totalTime)} / ${this.formatTime(dailyGoal)}`;

        // Weekly improvement
        const weeklyImprovement = this.calculateWeeklyImprovement();
        this.updateImprovementElement('weeklyProductivityChange', weeklyImprovement.productivity);
        this.updateImprovementElement('weeklyFocusChange', weeklyImprovement.focus);
    }

    // Helper methods
    getDateRangeData() {
        if (!this.data || !this.data.dailyStats) return [];
        
        const dates = Object.keys(this.data.dailyStats).sort();
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - this.currentDateRange);
        
        return dates
            .filter(date => {
                const dateObj = new Date(date);
                return dateObj >= startDate && dateObj <= endDate;
            })
            .map(date => this.data.dailyStats[date]);
    }

    getPreviousRangeData() {
        if (!this.data || !this.data.dailyStats) return [];
        
        const dates = Object.keys(this.data.dailyStats).sort();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - this.currentDateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (this.currentDateRange * 2));
        
        return dates
            .filter(date => {
                const dateObj = new Date(date);
                return dateObj >= startDate && dateObj < endDate;
            })
            .map(date => this.data.dailyStats[date]);
    }

    calculateTotalTime(data) {
        return data.reduce((total, day) => total + (day.totalTime || 0), 0);
    }

    calculateProductiveTime(data) {
        return data.reduce((total, day) => total + (day.productiveTime || 0), 0);
    }

    calculateUnproductiveTime(data) {
        return data.reduce((total, day) => total + (day.unproductiveTime || 0), 0);
    }

    calculateNeutralTime(data) {
        return data.reduce((total, day) => total + (day.neutralTime || 0), 0);
    }

    calculateProductivityScore(data) {
        const totalTime = this.calculateTotalTime(data);
        if (totalTime === 0) return 0;
        
        const productiveTime = this.calculateProductiveTime(data);
        const unproductiveTime = this.calculateUnproductiveTime(data);
        
        const score = Math.round(((productiveTime - unproductiveTime * 0.5) / totalTime) * 100);
        return Math.max(0, Math.min(100, score));
    }

    calculateSitesVisited(data) {
        const sites = new Set();
        data.forEach(day => {
            if (day.sites) {
                Object.keys(day.sites).forEach(site => sites.add(site));
            }
        });
        return sites.size;
    }

    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) return newValue > 0 ? 100 : 0;
        return Math.round(((newValue - oldValue) / oldValue) * 100);
    }

    updateChangeElement(elementId, change) {
        const element = document.getElementById(elementId);
        const isPositive = change >= 0;
        element.textContent = `${isPositive ? '+' : ''}${change}% vs previous period`;
        element.className = `card-change ${isPositive ? '' : 'negative'}`;
    }

    updateImprovementElement(elementId, change) {
        const element = document.getElementById(elementId);
        const isPositive = change >= 0;
        element.textContent = `${isPositive ? '+' : ''}${change}%`;
        element.className = `improvement-value ${isPositive ? '' : 'negative'}`;
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    aggregateSiteStats(data) {
        const siteStats = {};
        
        data.forEach(day => {
            if (day.sites) {
                Object.entries(day.sites).forEach(([domain, stats]) => {
                    if (!siteStats[domain]) {
                        siteStats[domain] = { time: 0, visits: 0, category: stats.category };
                    }
                    siteStats[domain].time += stats.time;
                    siteStats[domain].visits += stats.visits;
                });
            }
        });
        
        return siteStats;
    }

    getWeeklyData() {
        const dateRange = this.getDateRangeData();
        const weeklyData = [];
        
        // Group data by week
        const weekGroups = {};
        dateRange.forEach(day => {
            const date = new Date(day.date);
            const weekStart = this.getWeekStart(date);
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weekGroups[weekKey]) {
                weekGroups[weekKey] = [];
            }
            weekGroups[weekKey].push(day);
        });
        
        // Calculate weekly stats
        Object.entries(weekGroups).forEach(([weekStart, days]) => {
            const totalTime = this.calculateTotalTime(days);
            const productivityScore = this.calculateProductivityScore(days);
            
            weeklyData.push({
                weekStart: this.formatDate(weekStart),
                totalTime,
                productivityScore
            });
        });
        
        return weeklyData.sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    generateInsights() {
        const insights = [];
        const dateRange = this.getDateRangeData();
        
        if (dateRange.length === 0) {
            insights.push({
                text: "No data available yet. Start browsing to see your productivity insights!",
                metric: "Begin tracking to unlock insights"
            });
            return insights;
        }
        
        const totalTime = this.calculateTotalTime(dateRange);
        const productiveTime = this.calculateProductiveTime(dateRange);
        const productivityScore = this.calculateProductivityScore(dateRange);
        
        // Most productive day
        const mostProductiveDay = dateRange.reduce((max, day) => {
            const score = this.calculateProductivityScore([day]);
            return score > max.score ? { date: day.date, score } : max;
        }, { date: '', score: 0 });
        
        if (mostProductiveDay.score > 0) {
            insights.push({
                text: `Your most productive day was ${this.formatDate(mostProductiveDay.date)}`,
                metric: `Productivity Score: ${mostProductiveDay.score}%`
            });
        }
        
        // Time distribution insight
        const productivePercentage = Math.round((productiveTime / totalTime) * 100);
        if (productivePercentage > 70) {
            insights.push({
                text: "Excellent! You're spending most of your time on productive activities",
                metric: `${productivePercentage}% productive time`
            });
        } else if (productivePercentage < 30) {
            insights.push({
                text: "Consider reducing time on unproductive sites to improve your productivity",
                metric: `${productivePercentage}% productive time`
            });
        }
        
        // Daily goal progress
        const dailyGoal = 6 * 60 * 60 * 1000; // 6 hours
        const averageDailyTime = totalTime / dateRange.length;
        if (averageDailyTime >= dailyGoal) {
            insights.push({
                text: "You're consistently meeting your daily productivity goals!",
                metric: `Average: ${this.formatTime(averageDailyTime)} per day`
            });
        }
        
        return insights;
    }

    aggregateHourlyData(data) {
        const hourlyData = Array(24).fill(0);
        
        data.forEach(day => {
            // For now, distribute time evenly across hours
            // In a real implementation, you'd track actual hourly data
            const dailyTime = day.totalTime || 0;
            const hourlyDistribution = dailyTime / 24;
            
            for (let i = 0; i < 24; i++) {
                hourlyData[i] += hourlyDistribution;
            }
        });
        
        return hourlyData;
    }

    calculateWeeklyImprovement() {
        const currentWeek = this.getDateRangeData().slice(-7);
        const previousWeek = this.getPreviousRangeData().slice(-7);
        
        const currentProductivity = this.calculateProductivityScore(currentWeek);
        const previousProductivity = this.calculateProductivityScore(previousWeek);
        const currentFocus = this.calculateProductiveTime(currentWeek);
        const previousFocus = this.calculateProductiveTime(previousWeek);
        
        return {
            productivity: this.calculatePercentageChange(previousProductivity, currentProductivity),
            focus: this.calculatePercentageChange(previousFocus, currentFocus)
        };
    }

    async loadSettings() {
        try {
            const storage = await chrome.storage.local.get(['settings']);
            const settings = storage.settings || {};
            
            document.getElementById('autoTracking').checked = settings.autoTracking !== false;
            document.getElementById('notifications').checked = settings.notifications !== false;
            document.getElementById('productivityGoal').value = (settings.productivityGoal || 6 * 60 * 60 * 1000) / (1000 * 60 * 60);
            document.getElementById('breakReminders').checked = settings.breakReminders !== false;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            const settings = {
                autoTracking: document.getElementById('autoTracking').checked,
                notifications: document.getElementById('notifications').checked,
                productivityGoal: parseInt(document.getElementById('productivityGoal').value) * 60 * 60 * 1000,
                breakReminders: document.getElementById('breakReminders').checked
            };
            
            await chrome.storage.local.set({ settings });
            
            // Show success message
            const saveButton = document.getElementById('saveSettings');
            const originalText = saveButton.textContent;
            saveButton.textContent = '✅ Saved!';
            saveButton.disabled = true;
            
            setTimeout(() => {
                saveButton.textContent = originalText;
                saveButton.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    exportData() {
        if (!this.data) return;
        
        const exportData = {
            exportDate: new Date().toISOString(),
            dateRange: this.currentDateRange,
            dailyStats: this.data.dailyStats,
            timeData: this.data.timeData
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `productivity-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardManager();
});
