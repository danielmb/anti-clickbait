console.log('Loaded an.js');

// wait for the page to load
// get current url
let url = window.location.href;
// if website is www.an.no
let main = async () => {
  const fetch = chrome.runtime.getURL('scripts/lib/fetch.js');

  const { hentTittel } = await import(fetch);
  if (url.match(/an\.no/)) {
    const articles = document.querySelectorAll('article.teaser_container');
    if (!articles.length) return setTimeout(main, 1000);
    console.log('articles', articles.length);
    for (let i = 0, max = articles.length; i < max; i++) {
      let article = articles[i];
      console.log(article);
      let header = article.querySelector('span[itemprop="headline"]');
      let a = article.querySelector('a');
      console.log('header', header);
      console.log('a', a);
      if (!header) continue;
      if (!a) continue;
      const l = a.href;
      /**
       * @type {import('../../../server/src/index').rootGetResponse["article"]}
       */
      let data = await hentTittel(l);
      console.log('info', data);
      if (data) {
        console.log('info', data);
        header.innerHTML = `<span itemprop="headline" title="${data.title}">${data.aiGeneratedTitle}</span>`;
      }
    }
  }
};

main();
