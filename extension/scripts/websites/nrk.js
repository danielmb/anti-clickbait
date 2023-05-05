const main = async () => {
  const fetchJs = chrome.runtime.getURL('scripts/lib/fetch.js');
  const { hentTittel } = await import(fetchJs);
  const storageJs = chrome.runtime.getURL('scripts/lib/storage.js');
  const { getStorage, setStorage } = await import(storageJs);
  const enabled = await getStorage('enabled').catch((err) => {
    setStorage('enabled', true);
  });
  if (!enabled) return;
  const articles = document.querySelectorAll('.kur-room');
  if (!articles.length) return setTimeout(main, 1000);
  for (let i = 0, max = articles.length; i < max; i++) {
    const article = articles[i];
    const header = article.querySelector('.kur-room__title > span');
    const a = article.querySelector('a');

    if (!header) continue;
    if (!a) continue;
    const l = a.href;
    /**
     * @type {import('../../../server/src/controllers/title.controller').titleGetResponse["article"]}
     * */
    const data = await hentTittel(l);
    if (data) {
      header.innerHTML = `<span role="text" title="${data.title}">${data.aiGeneratedTitle}</span>`;
    }
  }
};

window.dispatchEvent(new CustomEvent('reloadTitles'));

main();
window.addEventListener('reloadTitles', async () => {
  main();
});
// on message from background.js
