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

export async function hentTittel(url) {
  const id = new URL(url).pathname.split('/')[3];
  // const newUrl = new URL('http://localhost:3000/');
  // const newUrl = new URL('http://therack.ddns.net:30000/');
  // to bypass ssl cors error
  const newUrl = new URL(
    'https://cors-anywhere.herokuapp.com/http://therack.ddns.net:30000/',
  );
  newUrl.searchParams.append('url', url);
  newUrl.searchParams.append('styleName', await getStorage('style'));
  console.log('newUrl', newUrl.toString());
  // let response = await fetch('localhost:3000/?url=' + encodeURIComponent(url));

  let response = await fetch(newUrl).catch((err) => {
    console.log('err', err);
    throw err;
  });
  if (response.status === 200) {
    console.log('response', response);

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
