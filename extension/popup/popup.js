// save the style to local storage
const fetchJs = chrome.runtime.getURL('scripts/lib/fetch.js');
const storage = chrome.runtime.getURL('scripts/lib/storage.js');
const errorDiv = document.getElementById('error');
const styleSelector = document.getElementById('style');
const promptTextArea = document.getElementById('prompt');
/**
 * @type {{[key: string]: {active: boolean, lastActive: number, url: string, tab: chrome.tabs.Tab}}}
 */
let tabs = {};
let cachedStyle = null;
// document.getElementById('apply').addEventListener('click', async () => {
//   const style = document.getElementById('style').value;
//   const url = document.getElementById('url').value;
//   const storageModule = await import(storage);
//   await storageModule.setStorage('style', style);
//   if (url) {
//     try {
//       new URL(url);
//       await storageModule.setStorage('url', url);
//     } catch (err) {
//       errorDiv.innerHTML = 'Invalid url';
//     }
//   }
//   cachedStyle = style;
//   // reload page.
//   // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   //   console.log(tabs);
//   //   chrome.tabs.reload(tabs[0].id);
//   // });
//   for (const tabId in tabs) {
//     // sendMessage to tab
//     chrome.tabs.sendMessage(Number(tabId), { type: 'reload' });
//   }
// });

// const refreshTabs = () => {
//   for (const tabId in tabs) {
//     chrome.tabs.sendMessage(Number(tabId), { type: 'reload' });
//   }
// };
document.getElementById('style').addEventListener('change', async () => {
  await saveStyle();
});
const saveStyle = async () => {
  const style = document.getElementById('style').value;
  const storageModule = await import(storage);
  await storageModule.setStorage('style', style);
  cachedStyle = style;
};

document.addEventListener('DOMContentLoaded', async () => {
  let storageModule = await import(storage);
  const style = await storageModule.getStorage('style');
  const url = await storageModule.getStorage('url');
  document.getElementById('style').value = style;
  document.getElementById('url').value = url;
});

// get styles from server

(async () => {
  const { getStyles } = await import(fetchJs);
  const { getStorage } = await import(storage);
  const selectedStyle = await getStorage('style');
  /**
   * @type {import('../../server/src/controllers/style.controller').GetStylesResponse["styles"]}
   */
  const res = await getStyles();

  let selectedPrompt = res.find((style) => style.styleName === selectedStyle);
  if (selectedPrompt) {
    promptTextArea.value = selectedPrompt.prompt;
  }
  cachedStyle = selectedPrompt.styleName;
  res.forEach((style) => {
    const option = document.createElement('option');
    option.value = style.styleName;
    option.innerHTML = style.styleName;
    if (style.styleName === selectedStyle) {
      option.selected = true;
      selectedPrompt = style;
    }
    styleSelector.appendChild(option);
  });
})();

// const reload = document.getElementById('reload');
// reload.addEventListener('click', () => {
//   chrome.runtime.reload();
// });

styleSelector.addEventListener('change', async (e) => {
  const { getStyles } = await import(fetchJs);
  const styles = await getStyles();
  const selectedStyle = styles.find(
    (style) => style.styleName === e.target.value,
  );
  if (selectedStyle) {
    promptTextArea.value = selectedStyle.prompt;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'active') {
    tabs[sender.tab.id] = {
      active: true,
      lastActive: Date.now(),
      url: sender.tab.url,
      tab: sender.tab,
    };
    sendResponse({ active: true, style: cachedStyle });
  }
});

let activeTabsDiv = document.getElementById('active-tabs');
setInterval(() => {
  for (const tab in tabs) {
    if (Object.hasOwnProperty.call(tabs, tab)) {
      const element = tabs[tab];
      if (Date.now() - element.lastActive > 1000) {
        delete tabs[tab];
        const div = document.getElementById(tab);
        if (div) {
          div.remove();
        }
        continue;
      }
      if (
        document.getElementById(tab) &&
        document.getElementById(tab).innerHTML === element.url
      ) {
        continue;
      }
      const div = document.createElement('div');
      div.innerHTML = element.url;
      div.id = tab;
      activeTabsDiv.appendChild(div);
    }
  }
}, 1000);

let advancedSettings = document.getElementById('advanced-settings');
let advancedSettingsButton = document.getElementById(
  'advanced-settings-button',
);
advancedSettingsButton.addEventListener('click', () => {
  if (advancedSettings.classList.contains('hidden')) {
    advancedSettings.classList.remove('hidden');
    return;
  }
  advancedSettings.classList.add('hidden');
});
