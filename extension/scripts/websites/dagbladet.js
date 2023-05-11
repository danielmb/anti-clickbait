const links = document.getElementsByTagName('a');

const main = async () => {
  const fetch = chrome.runtime.getURL('scripts/lib/fetch.js');
  const { hentTittel } = await import(fetch);
  const storageJs = chrome.runtime.getURL('scripts/lib/storage.js');
  const { getStorage, setStorage } = await import(storageJs);
  const enabled = await getStorage('enabled').catch((err) => {
    setStorage('enabled', true);
  });
  if (!enabled) return;

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
            let article = await hentTittel(l, kids[j]).catch((err) => {
              return null;
            });
            if (article) {
              let oldTitle = article.title;
              let aiTitle = article.aiGeneratedTitle;
              header.innerHTML = `<h3 class="headline" title="${oldTitle}">${aiTitle} (KI)</h3>`;
            }
          }
        }
      }
    }
  }
};

main();
window.addEventListener('reloadTitles', async () => {
  main();
});
