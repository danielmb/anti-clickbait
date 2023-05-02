export async function hentTittel(url) {
  const id = new URL(url).pathname.split('/')[3];
  // const newUrl = new URL('http://localhost:3000/');
  const newUrl = new URL('http://therack.ddns.net:30000/');
  newUrl.searchParams.append('url', url);
  newUrl.searchParams.append('styleName', 'clickbait-remover');
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
}
