// save the style to local storage
const fetchJs = chrome.runtime.getURL('scripts/lib/fetch.js');
const storage = chrome.runtime.getURL('scripts/lib/storage.js');
document.getElementById('apply').addEventListener('click', async () => {
  const style = document.getElementById('style').value;
  const url = document.getElementById('url').value;
  const storageModule = await import(storage);
  await storageModule.setStorage('style', style);
  if (url) {
    try {
      new URL(url);
      await storageModule.setStorage('url', url);
    } catch (err) {
      errorDiv.innerHTML = 'Invalid url';
    }
  }
});
document.addEventListener('DOMContentLoaded', async () => {
  let storageModule = await import(storage);
  const style = await storageModule.getStorage('style');
  const url = await storageModule.getStorage('url');
  document.getElementById('style').value = style;
  document.getElementById('url').value = url;
});

// get styles from server
const errorDiv = document.getElementById('error');
(async () => {
  const styleSelector = document.getElementById('style');

  const { getStyles } = await import(fetchJs);
  /**
   * @type {import('../../server/src/index').GetStylesResponse}
   */
  const res = await getStyles();

  res.forEach((style) => {
    const option = document.createElement('option');
    option.value = style.styleName;
    option.innerHTML = style.styleName;
    styleSelector.appendChild(option);
  });
})();

const reload = document.getElementById('reload');
reload.addEventListener('click', () => {
  chrome.runtime.reload();
});
