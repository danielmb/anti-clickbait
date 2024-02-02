// wait for the page to load
// get current url
let url = window.location.href;
// if website is www.an.no
let main = async () => {
  const fetch = chrome.runtime.getURL('scripts/lib/fetch.js');
  const storageJs = chrome.runtime.getURL('scripts/lib/storage.js');
  const { getStorage, setStorage } = await import(storageJs);
  let enabled = await getStorage('enabled').catch((err) => {
    setStorage('enabled', true);
    return true;
  });
  if (typeof enabled === 'undefined') {
    setStorage('enabled', true);
    enabled = true;
  }
  const style = await getStorage('style').catch((err) => {
    '_';
  });
  if (!enabled) return;
  const { hentTittel } = await import(fetch);
  if (url.match(/an\.no/)) {
    // select all that has no attribute anti-clickbait-processed
    const articles = document.querySelectorAll(
      // 'article.teaser_container[anti-clickbait-processed!="
      // `article[anti-clickbait-processed!="${style}"]`,
      `article.teaser_container:not([anti-clickbait-processed="${style}"])`,
    );
    // if (!articles.length) return setTimeout(main, 1000);
    for (let i = 0, max = articles.length; i < max; i++) {
      let article = articles[i];
      if (
        article.getAttribute('anti-clickbait-processed') === style ||
        article.getAttribute('anti-clickbait-proccessing') === style
      )
        continue;
      article.setAttribute('anti-clickbait-proccessing', style);
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
      article.removeAttribute('anti-clickbait-proccessing');
      article.setAttribute('anti-clickbait-processed', style);
      // article.setAttribute('anti-clickbait-style',
    }
  }
};

main();
// setInterval(main, 5000);
const mainLoop = async () => {
  await main().catch((err) => {
    console.error(err);
  });
  setTimeout(mainLoop, 5000);
};
window.addEventListener('reloadTitles', async () => {
  main();
});
