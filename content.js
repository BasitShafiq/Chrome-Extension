chrome.runtime.onMessage.addListener((message) => {
    const video = document.querySelector('video');
    if (!video) return;
  
    if (message.action === "pause" && !video.paused) {
      console.log("Pausing the video.");
      video.pause();
    } else if (message.action === "play" && video.paused) {
      console.log("Playing the video.");
      video.play();
    }
  });
  