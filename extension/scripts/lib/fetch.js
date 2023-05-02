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
    await setStorage(
      'url',
      'https://cors-anywhere.herokuapp.com/http://therack.ddns.net:30000/',
    );
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
  const style = await getStorage('style');
  if (!style || style === '') {
    throw new Error('No style selected');
  }
  newUrl.searchParams.append('url', url);
  newUrl.searchParams.append('styleName', style);

  // let response = await fetch('localhost:3000/?url=' + encodeURIComponent(url));

  let response = await fetch(newUrl).catch((err) => {
    console.error('err', err);
    throw err;
  });
  if (response.status === 200) {
    // import the type
    /**
     * @type {import('../../../server/src/index').rootGetResponse}
     */
    let data = await response.json();
    if (data != '') {
      return data.article;
    }
  }
  if (response.status === 403) {
    alert('Forbidden');
    window.open('https://cors-anywhere.herokuapp.com/corsdemo');
    throw new Error('Forbidden');
  }
  if (response.status === 429) {
    alert('Too many requests');
    throw new Error('Too many requests');
  }
}

export async function getStyles() {
  const savedUrl = await getUrl();
  const newUrl = new URL(savedUrl);
  newUrl.pathname = '/styles';
  let response = await fetch(newUrl).catch((err) => {
    console.error('err', err);
    throw err;
  });
  if (response.status === 200) {
    /**
     * @type {import('../../../server/src/index').GetStylesResponse}
     */
    let res = await response.json();
    return res.styles;
  }
  throw new Error('Error getting styles from server ' + response.status);
}
