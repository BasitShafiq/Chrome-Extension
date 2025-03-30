document.addEventListener("DOMContentLoaded", () => {
  const toggleFeature = document.getElementById("toggleFeature");
  const statusText = document.getElementById("status");

  // Load feature state from Chrome storage
  chrome.storage.sync.get("featureEnabled", (data) => {
      const isEnabled = data.featureEnabled || false;
      toggleFeature.checked = isEnabled;
      statusText.innerText = isEnabled ? "ON" : "OFF";
  });

  // Toggle switch event
  toggleFeature.addEventListener("change", () => {
      const isEnabled = toggleFeature.checked;
      chrome.storage.sync.set({ featureEnabled: isEnabled });
      statusText.innerText = isEnabled ? "ON" : "OFF";

      // Send message to background script
      chrome.runtime.sendMessage({ action: isEnabled ? "enable" : "disable" });
  });
});
