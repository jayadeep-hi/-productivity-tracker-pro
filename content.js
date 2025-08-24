// Content script that runs on every webpage
console.log('Productivity Time Tracker: Content script loaded');

// Send page load event to background script
chrome.runtime.sendMessage({
  action: 'pageLoaded',
  url: window.location.href,
  title: document.title,
  timestamp: Date.now()
});

// Track user interactions for better productivity analysis
let lastActivity = Date.now();
let isActive = true;

// Track mouse movements and clicks
document.addEventListener('mousemove', () => {
  lastActivity = Date.now();
  if (!isActive) {
    isActive = true;
    chrome.runtime.sendMessage({
      action: 'userActive',
      timestamp: lastActivity
    });
  }
});

document.addEventListener('click', () => {
  lastActivity = Date.now();
});

document.addEventListener('keypress', () => {
  lastActivity = Date.now();
});

// Track scroll activity
document.addEventListener('scroll', () => {
  lastActivity = Date.now();
});

// Check for user inactivity every 30 seconds
setInterval(() => {
  const now = Date.now();
  const inactiveTime = now - lastActivity;
  
  // Consider user inactive after 5 minutes of no activity
  if (inactiveTime > 5 * 60 * 1000 && isActive) {
    isActive = false;
    chrome.runtime.sendMessage({
      action: 'userInactive',
      timestamp: now,
      inactiveTime: inactiveTime
    });
  }
}, 30000);

// Track form submissions and important interactions
document.addEventListener('submit', (event) => {
  chrome.runtime.sendMessage({
    action: 'formSubmitted',
    formAction: event.target.action || 'unknown',
    timestamp: Date.now()
  });
});

// Track focus events on input fields
document.addEventListener('focusin', (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    chrome.runtime.sendMessage({
      action: 'inputFocused',
      inputType: event.target.type || 'text',
      timestamp: Date.now()
    });
  }
});

// Track video/audio playback for media sites
const mediaElements = document.querySelectorAll('video, audio');
mediaElements.forEach(element => {
  element.addEventListener('play', () => {
    chrome.runtime.sendMessage({
      action: 'mediaStarted',
      mediaType: element.tagName.toLowerCase(),
      timestamp: Date.now()
    });
  });
  
  element.addEventListener('pause', () => {
    chrome.runtime.sendMessage({
      action: 'mediaPaused',
      mediaType: element.tagName.toLowerCase(),
      timestamp: Date.now()
    });
  });
});

// Track page visibility changes
document.addEventListener('visibilitychange', () => {
  chrome.runtime.sendMessage({
    action: 'visibilityChanged',
    isVisible: !document.hidden,
    timestamp: Date.now()
  });
});

// Inject productivity reminder if on unproductive site
function injectProductivityReminder() {
  const url = window.location.href;
  const domain = new URL(url).hostname;
  
  // Check if this is an unproductive site
  const unproductiveSites = [
    'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com',
    'youtube.com', 'netflix.com', 'reddit.com', 'pinterest.com'
  ];
  
  if (unproductiveSites.some(site => domain.includes(site))) {
    // Wait for page to load completely
    setTimeout(() => {
      const reminder = document.createElement('div');
      reminder.id = 'productivity-reminder';
      reminder.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff6b6b;
          color: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: Arial, sans-serif;
          max-width: 300px;
          animation: slideIn 0.3s ease-out;
        ">
          <div style="font-weight: bold; margin-bottom: 8px;">⏰ Productivity Reminder</div>
          <div style="font-size: 14px; margin-bottom: 12px;">
            You've been on this site for a while. Consider switching to something more productive!
          </div>
          <button id="dismiss-reminder" style="
            background: white;
            color: #ff6b6b;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          ">Dismiss</button>
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;
      
      document.body.appendChild(reminder);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (reminder.parentNode) {
          reminder.remove();
        }
      }, 10000);
      
      // Handle dismiss button
      document.getElementById('dismiss-reminder').addEventListener('click', () => {
        reminder.remove();
      });
    }, 3000); // Show after 3 seconds
  }
}

// Run reminder injection when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectProductivityReminder);
} else {
  injectProductivityReminder();
}

// Track time spent on page before leaving
window.addEventListener('beforeunload', () => {
  chrome.runtime.sendMessage({
    action: 'pageUnload',
    url: window.location.href,
    timeSpent: Date.now() - performance.timing.navigationStart,
    timestamp: Date.now()
  });
});
