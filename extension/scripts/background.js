/**
 * @typedef {{active: boolean, style: string, url: string}} website
 */
const storage = chrome.runtime.getURL('scripts/lib/storage.js');
const fetchJs = chrome.runtime.getURL('scripts/lib/fetch.js');
/**
 * @param {website} website
 * @returns {Promise<website>}
 */
let addWebsite = async (website) => {
  const storageModule = await import(storage);
  let websites = await storageModule.getStorage('websites');
  if (!websites) {
    websites = [];
    await storageModule.setStorage('websites', websites);
  }
  if (!websites.includes(website)) {
    websites = await storageModule.getStorage('websites');
    websites.push({
      active: true,
      style: null,
      url: website,
    });
    await storageModule.setStorage('websites', websites);
  }
  return websites.find((w) => w.url === website);
};

/**
 *
 * @param {string} website
 * @returns {Promise<website>}
 */
let getWebsite = async (website) => {
  const storageModule = await import(storage);
  let websites = await storageModule.getStorage('websites');
  if (!websites) {
    websites = [];
    await storageModule.setStorage('websites', websites);
  }
  return websites.find((w) => w.url === website);
};

let currentWebsite = async () => {
  const { getStyles } = await import(fetchJs);
  const websiteOrigin = new URL(window.location.href).origin;
  let website = await getWebsite(websiteOrigin);
  if (!website) {
    website = await addWebsite({
      active: true,
      style: null,
      url: websiteOrigin,
    });
  }
  if (!website.style) {
    let fetchedStyles = await getStyles();
    website.style = fetchedStyles[0].styleName;
  }
  return website;
};

setInterval(async () => {
  // check if reciving end
  // if so, send message to background.js
  const website = await currentWebsite();
  conole.log(website);

  chrome.runtime.sendMessage(
    { type: 'active', website: new URL(window.location.href).origin },
    (response) => {
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
    },
  );
}, 1000);
