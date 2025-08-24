# 🚀 Productivity Time Tracker - Chrome Extension

A powerful Chrome extension that tracks time spent on different websites and provides comprehensive productivity analytics to help you optimize your online time usage.

## ✨ Features

### 🕒 **Automatic Time Tracking**
- Tracks time spent on every website automatically
- Monitors tab switches and page navigation
- Real-time tracking with millisecond precision
- Background tracking that works even when popup is closed

### 🎯 **Smart Website Classification**
- **Productive Sites**: Coding platforms, learning resources, documentation
- **Unproductive Sites**: Social media, entertainment, gaming
- **Neutral Sites**: General browsing, news, shopping
- Customizable classification system

### 📊 **Comprehensive Analytics Dashboard**
- **Overview Cards**: Total time, productive time, productivity score, sites visited
- **Trend Charts**: Daily productivity trends and time distribution
- **Category Breakdown**: Visual representation of time allocation
- **Top Sites Analysis**: Most visited websites with time breakdown
- **Weekly Summaries**: Progress tracking and improvement metrics
- **Productivity Insights**: AI-powered recommendations and insights

### 🎨 **Beautiful User Interface**
- Modern, responsive design
- Interactive charts and visualizations
- Real-time updates and animations
- Mobile-friendly responsive layout

### ⚙️ **Customizable Settings**
- Adjustable daily productivity goals
- Enable/disable notifications
- Break reminder settings
- Auto-tracking preferences

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download/Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top right
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Method 2: Chrome Web Store (Coming Soon)

- Extension will be available on Chrome Web Store for easy installation

## 📱 Usage

### 🎯 **Getting Started**
1. **Install the extension** using one of the methods above
2. **Click the extension icon** in your toolbar to open the popup
3. **Start browsing** - the extension automatically tracks your activity
4. **View real-time stats** in the popup or open the full dashboard

### 📊 **Understanding Your Data**

#### **Productivity Score Calculation**
```
Productivity Score = (Productive Time - Unproductive Time × 0.5) / Total Time × 100
```

#### **Website Categories**
- **Productive**: GitHub, Stack Overflow, Udemy, Coursera, etc.
- **Unproductive**: Facebook, YouTube, Instagram, Netflix, etc.
- **Neutral**: General websites, news sites, shopping, etc.

### 🎨 **Dashboard Features**

#### **Overview Section**
- **Total Time**: Combined time across all websites
- **Productive Time**: Time spent on productive websites
- **Productivity Score**: Overall productivity percentage
- **Sites Visited**: Number of unique websites visited

#### **Analytics Section**
- **Top Sites**: Most visited websites with time breakdown
- **Category Breakdown**: Pie chart showing time distribution
- **Weekly Summary**: Progress tracking over time
- **Productivity Insights**: Personalized recommendations

#### **Charts & Visualizations**
- **Productivity Trend**: Line chart showing daily progress
- **Hourly Distribution**: Bar chart of activity throughout the day
- **Category Breakdown**: Doughnut chart of time allocation

## 🔧 Configuration

### **Settings Panel**
Access settings through the dashboard to customize:
- **Auto-tracking**: Enable/disable automatic time tracking
- **Notifications**: Control productivity reminders
- **Daily Goals**: Set your target productivity hours
- **Break Reminders**: Get notified to take breaks

### **Data Export**
- Export your productivity data as JSON
- Use for personal analysis or backup
- Compatible with external analytics tools

## 🛠️ Technical Details

### **Architecture**
- **Manifest V3**: Latest Chrome extension standard
- **Service Worker**: Background processing and data management
- **Content Scripts**: Page-level tracking and interaction monitoring
- **Local Storage**: Secure data storage using Chrome's storage API

### **Data Privacy**
- **Local Storage Only**: All data stays on your device
- **No External Servers**: Complete privacy and data control
- **Automatic Cleanup**: Old data automatically removed after 30 days

### **Performance**
- **Lightweight**: Minimal impact on browser performance
- **Efficient Tracking**: Optimized algorithms for smooth operation
- **Memory Management**: Automatic cleanup prevents storage bloat

## 📈 Productivity Tips

### **Maximize Your Score**
1. **Set Realistic Goals**: Start with achievable daily targets
2. **Monitor Patterns**: Identify your most productive times
3. **Reduce Distractions**: Limit time on unproductive sites
4. **Take Breaks**: Use break reminders to maintain focus
5. **Review Weekly**: Analyze trends and adjust habits

### **Understanding Your Data**
- **High Productivity Score**: Great! Keep up the good work
- **Low Productivity Score**: Identify time-wasting patterns
- **Time Distribution**: Balance productive and leisure activities
- **Weekly Trends**: Track improvement over time

## 🐛 Troubleshooting

### **Common Issues**

#### **Extension Not Tracking**
- Check if extension is enabled in `chrome://extensions/`
- Ensure you have the necessary permissions
- Try refreshing the page or restarting Chrome

#### **Data Not Showing**
- Wait a few minutes for initial data collection
- Check if you're browsing HTTP/HTTPS sites
- Verify storage permissions are granted

#### **Charts Not Loading**
- Ensure internet connection for Chart.js CDN
- Check browser console for JavaScript errors
- Try refreshing the dashboard

### **Reset Extension**
If you encounter persistent issues:
1. Go to `chrome://extensions/`
2. Find the extension and click "Remove"
3. Reinstall using the load unpacked method
4. Note: This will clear all your data

## 🔮 Future Features

### **Planned Enhancements**
- **Cloud Sync**: Backup data to your Google account
- **Team Analytics**: Share productivity insights with teams
- **Advanced Insights**: Machine learning-powered recommendations
- **Mobile App**: Companion app for comprehensive tracking
- **API Integration**: Connect with productivity tools
- **Custom Categories**: User-defined website classifications

### **Feature Requests**
We welcome feature suggestions! Please open an issue on GitHub with your ideas.

## 🤝 Contributing

### **Development Setup**
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Make your changes** and test thoroughly
4. **Submit a pull request** with detailed description

### **Code Style**
- Follow existing code patterns
- Add comments for complex logic
- Ensure responsive design compatibility
- Test across different Chrome versions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Chrome Extensions API** for the development platform
- **Chart.js** for beautiful data visualizations
- **Community contributors** for feedback and suggestions

## 📞 Support

### **Getting Help**
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check this README for common solutions
- **Community**: Join discussions in GitHub discussions

### **Reporting Bugs**
When reporting issues, please include:
- Chrome version
- Extension version
- Steps to reproduce
- Console error messages (if any)
- Screenshots (if applicable)

---

**Made with ❤️ for productivity enthusiasts everywhere**

*Track your time, boost your productivity, achieve your goals!*
