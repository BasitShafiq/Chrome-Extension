let featureEnabled = false;
let previousTabId = null; // ✅ Declare previousTabId

// Load state from storage
chrome.storage.sync.get("featureEnabled", (data) => {
    featureEnabled = data.featureEnabled || false;
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "enable") {
        featureEnabled = true;
        chrome.storage.sync.set({ featureEnabled: true });
    } else if (message.action === "disable") {
        featureEnabled = false;
        chrome.storage.sync.set({ featureEnabled: false });
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (!featureEnabled) return; // Exit if feature is disabled

    const currentTabId = activeInfo.tabId;
    
    if (previousTabId !== null) { // ✅ Check if previousTabId exists
        await pauseVideoOnTab(previousTabId);
    }
    
    await playVideoOnTab(currentTabId);
    previousTabId = currentTabId; // ✅ Update previousTabId
});


// Function to pause video
async function pauseVideoOnTab(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const video = document.querySelector("video");
                if (video) video.pause();
            }
        });
    } catch (error) {
        console.error(`Error pausing video on tab ${tabId}:`, error);
    }
}

// Function to play video
async function playVideoOnTab(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const video = document.querySelector("video");
                if (video) video.play();
            }
        });
    } catch (error) {
        console.error(`Error playing video on tab ${tabId}:`, error);
    }
}
