console.log('content.js loaded');

async function hentTittel(url) {
  const id = new URL(url).pathname.split('/')[3];
  const newUrl = new URL('http://localhost:3000/');
  newUrl.searchParams.append('url', url);
  // let response = await fetch('localhost:3000/?url=' + encodeURIComponent(url));

  let response = await fetch(newUrl).catch((err) => {
    console.log('err', err);
    throw err;
  });
  if (response.status === 200) {
    console.log('response', response);

    // import the type
    /**
     * @type {import('../../server/src/index').rootGetResponse}
     */
    let data = await response.json();
    if (data != '') {
      return data.article;
    }
  }
}

// async function hentTittel(url, header) {

//       header.innerHTML = `<h3 class="headline" title="${oldTitle}">${aiTitle} (KI)</h3>`;

// }

// get current url
const url = window.location.href;
// if website is www.dagbladet.no
if (url.match(/dagbladet\.no/)) {
  const links = document.getElementsByTagName('a');

  for (let i = 0, max = links.length; i < max; i++) {
    let l = links[i].href;
    if (
      l.match(
        /\/(nyheter|sport|kjendis|tema|video|reise|meninger|studio|bok|fritid|bolig|motor)\//,
      )
    ) {
      let kids = links[i].children;
      for (let j = 0, kidsmax = kids.length; j < kidsmax; j++) {
        if (kids[j].tagName == 'HEADER') {
          if (kids[j].children[0].tagName == 'H1') {
            continue;
          } else {
            let header = kids[j];
            hentTittel(l, kids[j]).catch((err) => {
              console.log('err', err);
              return;
            });
          }
        }
      }
    }
  }
}
// if website is www.an.no
if (url.match(/an\.no/)) {
  console.log('Matched an.no');
  (async () => {
    const articles = document.querySelectorAll('article');
    for (let i = 0, max = articles.length; i < max; i++) {
      let article = articles[i];
      let header = article.querySelector('span[itemprop="headline"]');
      let a = article.querySelector('a');
      console.log('header', header);
      console.log('a', a);
      if (!header) continue;
      if (!a) continue;
      console.log('xD');
      const l = a.href;
      let aiTitle = await hentTittel(l);
      if (aiTitle) {
        let oldTitle = header.innerHTML;
        header.innerHTML = `<span itemprop="headline" title="${oldTitle}">${aiTitle} (KI)</span>`;
      }
    }
  })();
}
