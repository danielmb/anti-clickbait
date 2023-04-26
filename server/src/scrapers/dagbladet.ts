import { Article, Scrape } from '../types/scraper.types';
import axios from 'axios';
import { load } from 'cheerio';
let scrape: Scrape = async () => {
  const { data } = await axios.get('https://www.dagbladet.no/');
  let $ = load(data);

  let articleUrls: string[] = $('article')
    .map((i, el) => {
      const url = $(el).find('a').attr('href');
      if (url) {
        return url;
      }
    })
    .get()
    .filter((url) => {
      console.log(url.startsWith('https://www.dagbladet.no/'));
      if (!url.startsWith('https://www.dagbladet.no/')) return false;
      if (url.startsWith('https://www.dagbladet.no/studio/')) return false;
      return true;
    });
  console.log(articleUrls);
  let articles: Article[] = [];
  // for (const url of articleUrls)
  {
    const url = articleUrls[0];
    const { data } = await axios.get(url);
    let $ = load(data);
    const title = $('h1.headline').text();
    // itemProp="articleBody"
    const content = $('div[itemprop="articleBody"]')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/(\r\n|\n|\r)/gm, '');
    const date = new Date($('article .article-body').attr('data-published')!);
    articles.push({ title, url, content, date });
  }
  return articles;
};

export default scrape;
