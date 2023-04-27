async function hentTittel(url, header) {
  const id = new URL(url).pathname.split('/')[3];
  const website = 'dagbladet';
  const newUrl = new URL('http://localhost:3000/');
  newUrl.searchParams.append('id', id);
  newUrl.searchParams.append('website', website);
  newUrl.searchParams.append('url', url);
  // let response = await fetch('localhost:3000/?url=' + encodeURIComponent(url));
  let response = await fetch(newUrl).catch((err) => {
    console.log('err', err);
    throw err;
  });
  if (response.status === 200) {
    console.log('response', response);
    let data = await response.text();
    if (data != '') {
      header.innerHTML = '<h3 class="headline">' + data + ' (KI)</h3>';
    }
  }
}

var links = document.getElementsByTagName('a');
for (var i = 0, max = links.length; i < max; i++) {
  var l = links[i].href;
  if (
    l.match(
      /\/(nyheter|sport|kjendis|tema|video|reise|meninger|studio|bok|fritid|bolig)\//,
    )
  ) {
    var kids = links[i].children;
    for (var j = 0, kidsmax = kids.length; j < kidsmax; j++) {
      if (kids[j].tagName == 'HEADER') {
        if (kids[j].children[0].tagName == 'H1') {
          continue;
        } else {
          hentTittel(l, kids[j]).catch((err) => {
            console.log('err', err);
            return;
          });
        }
      }
    }
  }
}
