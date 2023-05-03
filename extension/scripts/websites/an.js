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
    for (let i = 0, max = articles.length; i < max; i++) {
      let article = articles[i];
      let header = article.querySelector('span[itemprop="headline"]');
      let a = article.querySelector('a');
      if (!header) continue;
      if (!a) continue;
      const l = a.href;
      /**
       * @type {import('../../../server/src/controllers/title.controller').titleGetResponse["article"]}
       */
      let data = await hentTittel(l);
      if (data) {
        header.innerHTML = `<span itemprop="headline" title="${data.title}">${data.aiGeneratedTitle}</span>`;
      }
    }
  }
};

main();
