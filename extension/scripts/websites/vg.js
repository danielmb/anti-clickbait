console.log('Loaded vg.js');

// wait for the page to load
// get current url
let url = window.location.href;
// if website is www.an.no
let main = async () => {
  const fetch = chrome.runtime.getURL('scripts/lib/fetch.js');
  const storageJs = chrome.runtime.getURL('scripts/lib/storage.js');
  const { hentTittel } = await import(fetch);
  const { getStorage, setStorage } = await import(storageJs);
  const enabled = await getStorage('enabled').catch((err) => {
    setStorage('enabled', true);
  });
  if (!enabled) return;
  const articles = document.querySelectorAll('article.article');
  if (!articles.length) return setTimeout(main, 1000);
  for (let i = 0, max = articles.length; i < max; i++) {
    let article = articles[i];
    let header = article.querySelector('h2.headline');
    let a = article.querySelector('a');
    if (!header) continue;
    if (!a) continue;
    let link = new URL(a.href);
    let l = link.origin + link.pathname;
    /**
     * @type {import('../../../server/src/controllers/title.controller').titleGetResponse["article"]}
     */
    let data = await hentTittel(l);
    if (data) {
      header.innerHTML = `<span itemprop="headline" title="${data.title}">${data.aiGeneratedTitle}</span>`;
    }
  }
};

main();
window.addEventListener('reloadTitles', async () => {
  main();
});
