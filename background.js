let previousTabId = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const currentTabId = activeInfo.tabId;

  // Pause video on the previous tab if it's a YouTube tab
  if (previousTabId) {
    await pauseVideoOnTab(previousTabId);
  }

  // Play video on the current tab if it's a YouTube tab
  await playVideoOnTab(currentTabId);

  // Update the previous tab ID
  previousTabId = currentTabId;
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Handle updates for the currently active tab
  if (tabId === previousTabId && changeInfo.url && tab.url.includes("youtube.com")) {
    await playVideoOnTab(tabId);
  }
});

async function pauseVideoOnTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const video = document.querySelector("video");
        if (video && !video.paused) {
          video.pause();
        }
      },
    });
  } catch (error) {
    console.error(`Error pausing video on tab ${tabId}:`, error);
  }
}

async function playVideoOnTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const video = document.querySelector("video");
        if (video && video.paused) {
          video.play();
        }
      },
    });
  } catch (error) {
    console.error(`Error playing video on tab ${tabId}:`, error);
  }
}
