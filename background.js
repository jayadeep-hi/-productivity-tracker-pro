// Background service worker for time tracking
let currentTab = null;
let startTime = null;
let isTracking = false;

// Website classification for productivity
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

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Productivity Time Tracker installed');
  initializeStorage();
});

// Handle tab updates
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (isTracking) {
    await stopTracking();
  }
  await startTracking(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && isTracking) {
    await stopTracking();
    await startTracking(tabId);
  }
});

// Start tracking time for a tab
async function startTracking(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url && tab.url.startsWith('http')) {
      currentTab = tab;
      startTime = Date.now();
      isTracking = true;
      console.log(`Started tracking: ${tab.url}`);
    }
  } catch (error) {
    console.error('Error starting tracking:', error);
  }
}

// Stop tracking and save data
async function stopTracking() {
  if (!isTracking || !currentTab || !startTime) return;

  const endTime = Date.now();
  const duration = endTime - startTime;
  const url = new URL(currentTab.url);
  const domain = url.hostname;
  
  // Classify website
  const category = classifyWebsite(domain);
  
  // Save time data
  await saveTimeData({
    url: currentTab.url,
    domain: domain,
    title: currentTab.title,
    category: category,
    duration: duration,
    startTime: startTime,
    endTime: endTime,
    date: new Date().toISOString().split('T')[0]
  });

  console.log(`Stopped tracking: ${currentTab.url} (${duration}ms)`);
  
  // Reset tracking
  currentTab = null;
  startTime = null;
  isTracking = false;
}

// Classify website as productive or unproductive
function classifyWebsite(domain) {
  if (productiveSites.some(site => domain.includes(site))) {
    return 'productive';
  } else if (unproductiveSites.some(site => domain.includes(site))) {
    return 'unproductive';
  } else {
    return 'neutral';
  }
}

// Save time tracking data
async function saveTimeData(data) {
  try {
    const storage = await chrome.storage.local.get(['timeData']);
    const timeData = storage.timeData || [];
    
    // Add new entry
    timeData.push(data);
    
    // Keep only last 1000 entries to prevent storage bloat
    if (timeData.length > 1000) {
      timeData.splice(0, timeData.length - 1000);
    }
    
    await chrome.storage.local.set({ timeData: timeData });
    
    // Update daily summary
    await updateDailySummary(data);
    
  } catch (error) {
    console.error('Error saving time data:', error);
  }
}

// Update daily summary statistics
async function updateDailySummary(data) {
  try {
    const storage = await chrome.storage.local.get(['dailyStats']);
    const dailyStats = storage.dailyStats || {};
    const date = data.date;
    
    if (!dailyStats[date]) {
      dailyStats[date] = {
        totalTime: 0,
        productiveTime: 0,
        unproductiveTime: 0,
        neutralTime: 0,
        sites: {}
      };
    }
    
    // Update total time
    dailyStats[date].totalTime += data.duration;
    
    // Update category time
    if (data.category === 'productive') {
      dailyStats[date].productiveTime += data.duration;
    } else if (data.category === 'unproductive') {
      dailyStats[date].unproductiveTime += data.duration;
    } else {
      dailyStats[date].neutralTime += data.duration;
    }
    
    // Update site-specific data
    if (!dailyStats[date].sites[data.domain]) {
      dailyStats[date].sites[data.domain] = {
        time: 0,
        visits: 0,
        category: data.category
      };
    }
    dailyStats[date].sites[data.domain].time += data.duration;
    dailyStats[date].sites[data.domain].visits += 1;
    
    await chrome.storage.local.set({ dailyStats: dailyStats });
    
  } catch (error) {
    console.error('Error updating daily summary:', error);
  }
}

// Initialize storage with default values
async function initializeStorage() {
  try {
    const storage = await chrome.storage.local.get(['timeData', 'dailyStats', 'settings']);
    
    if (!storage.timeData) {
      await chrome.storage.local.set({ timeData: [] });
    }
    
    if (!storage.dailyStats) {
      await chrome.storage.local.set({ dailyStats: {} });
    }
    
    if (!storage.settings) {
      await chrome.storage.local.set({
        settings: {
          autoTracking: true,
          notifications: true,
          productivityGoal: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
          breakReminders: true
        }
      });
    }
    
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentStatus') {
    sendResponse({
      isTracking,
      currentTab: currentTab ? {
        url: currentTab.url,
        title: currentTab.title,
        startTime: startTime
      } : null
    });
  } else if (request.action === 'getStats') {
    chrome.storage.local.get(['dailyStats', 'timeData']).then(data => {
      sendResponse(data);
    });
    return true; // Keep message channel open for async response
  } else if (request.action === 'openDashboard') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    sendResponse({ success: true });
  }
});

// Set up periodic cleanup (every 24 hours)
chrome.alarms.create('dailyCleanup', { periodInMinutes: 24 * 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyCleanup') {
    cleanupOldData();
  }
});

// Clean up old data (keep only last 30 days)
async function cleanupOldData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const storage = await chrome.storage.local.get(['timeData', 'dailyStats']);
    const timeData = storage.timeData || [];
    const dailyStats = storage.dailyStats || {};
    
    // Filter out old time data
    const filteredTimeData = timeData.filter(entry => 
      new Date(entry.date) >= thirtyDaysAgo
    );
    
    // Filter out old daily stats
    const filteredDailyStats = {};
    Object.keys(dailyStats).forEach(date => {
      if (new Date(date) >= thirtyDaysAgo) {
        filteredDailyStats[date] = dailyStats[date];
      }
    });
    
    await chrome.storage.local.set({
      timeData: filteredTimeData,
      dailyStats: filteredDailyStats
    });
    
    console.log('Daily cleanup completed');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}
