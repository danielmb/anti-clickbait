/**
 *
 * @param {*} key
 * @returns {Promise<string>}
 */
const getStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
};
/**
 *
 * @param {*} key
 * @param {*} value
 * @returns {Promise<void>}
 */
const setStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};
/**
 *
 * @returns {Promise<string>}
 */
export const getUrl = async () => {
  const savedUrl = await getStorage('url');
  if (!savedUrl) {
    await setStorage('url', 'https://therack.ddns.net:30000/');
  }
  return savedUrl;
};
export async function hentTittel(url) {
  const id = new URL(url).pathname.split('/')[3];
  // const newUrl = new URL('http://localhost:3000/');
  // const newUrl = new URL('http://therack.ddns.net:30000/');
  // to bypass ssl cors error
  const savedUrl = await getUrl();
  const newUrl = new URL(savedUrl);
  newUrl.pathname = '/title';
  const style = await getStorage('style');
  if (!style || style === '') {
    throw new Error('No style selected');
  }
  newUrl.searchParams.append('url', url);
  newUrl.searchParams.append('styleName', style);

  // let response = await fetch('localhost:3000/?url=' + encodeURIComponent(url));

  let response = await fetch(newUrl, {
    method: 'GET',
  }).catch((err) => {
    console.error('err', err);
    throw err;
  });
  if (response.status === 200) {
    // import the type
    /**
     * @type {import('../../../server/src/controllers/title.controller').titleGetResponse}
     */
    let data = await response.json();
    if (data != '') {
      return data.article;
    }
  }
}

export async function getStyles() {
  const savedUrl = await getUrl();
  const newUrl = new URL(savedUrl);
  newUrl.pathname = '/style';
  let response = await fetch(newUrl).catch((err) => {
    console.error('err', err);
    throw err;
  });
  if (response.status === 200) {
    /**
     * @type {import('../../../server/src/controllers/style.controller').GetStylesResponse}
     */
    let res = await response.json();
    return res.styles;
  }
  throw new Error('Error getting styles from server ' + response.status);
}
