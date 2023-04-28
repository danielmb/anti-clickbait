const links = document.getElementsByTagName('a');

(async () => {
  const fetch = chrome.runtime.getURL('scripts/lib/fetch.js');
  const { hentTittel } = await import(fetch);

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
            let article = hentTittel(l, kids[j]).catch((err) => {
              console.log('err', err);
              return;
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
})();
