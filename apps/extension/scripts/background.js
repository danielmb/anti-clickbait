const storage = chrome.runtime.getURL('scripts/lib/storage.js');
let style = null;
setInterval(async () => {
  // check if reciving end
  // if so, send message to background.js
  chrome.runtime.sendMessage({ type: 'active' }, (response) => {
    if (chrome.runtime.lastError) {
      return;
    }
    if (response && response.style) {
      if (style && response.style !== style) {
        // window.location.reload();
        window.dispatchEvent(new CustomEvent('reloadTitles'));
      }
      style = response.style;
    }
  });
}, 1000);
