// background.js
let featureEnabled = false;
let previousTabId = null;
let youtubeTabIds = new Set();

// Load state from storage
chrome.storage.sync.get("featureEnabled", (data) => {
    featureEnabled = data.featureEnabled || false;
});

// Listen for enable/disable messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enable") {
        featureEnabled = true;
        chrome.storage.sync.set({ featureEnabled: true });
    } else if (message.action === "disable") {
        featureEnabled = false;
        chrome.storage.sync.set({ featureEnabled: false });
    }
});

// Track YouTube tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("youtube.com")) {
        youtubeTabIds.add(tabId);
    }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
    youtubeTabIds.delete(tabId);
    if (previousTabId === tabId) {
        previousTabId = null;
    }
});

// Handle tab switching
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (!featureEnabled) return; 

    const currentTabId = activeInfo.tabId;
    
    try {
        const currentTab = await chrome.tabs.get(currentTabId);
        const isCurrentYouTube = currentTab.url && currentTab.url.includes("youtube.com");
        
        if (previousTabId !== null && youtubeTabIds.has(previousTabId)) {
            await pauseVideoOnTab(previousTabId);
        }
        
        if (isCurrentYouTube) {
            await playVideoOnTab(currentTabId);
        }
        
        previousTabId = currentTabId;
    } catch (error) {
        console.error("Error handling tab switch:", error);
    }
});

// Function to pause video (only on YouTube tabs)
async function pauseVideoOnTab(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (tab && tab.url && tab.url.includes("youtube.com")) {
            await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    const video = document.querySelector("video");
                    if (video && !video.paused) video.pause();
                }
            });
        }
    } catch (error) {
        console.error(`Error pausing video on tab ${tabId}:`, error);
        // Tab might have been closed, remove it from our tracking
        youtubeTabIds.delete(tabId);
    }
}

// Function to play video (only on YouTube tabs)
async function playVideoOnTab(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        if (tab && tab.url && tab.url.includes("youtube.com")) {
            await chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    const video = document.querySelector("video");
                    if (video && video.paused) video.play();
                }
            });
        }
    } catch (error) {
        console.error(`Error playing video on tab ${tabId}:`, error);
        youtubeTabIds.delete(tabId);
    }
}