import {
  Article,
  Scrape,
  ScrapeConfig,
  ScrapeFile,
} from '../types/scraper.types';
import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs';
let allowed = ['nyheter', 'tema', 'kjenids', 'sport'];
let filter = (url: string) => {
  if (!url.startsWith('https://www.dagbladet.no/')) return false;
  let newsType = url.split('/')[3];
  if (!allowed.includes(newsType)) return false;
  return true;
};
let config: ScrapeConfig = {
  url: 'https://www.dagbladet.no/',
  name: 'dagbladet',
  language: 'Norwegian',
};
let scrape: Scrape = async (queue) => {
  const { data } = await axios.get('https://www.dagbladet.no/');
  let $ = load(data);

  let articleUrls: string[] = $('article')
    .map((i, el) => {
      const url = $(el).find('a').attr('href');
      if (url) {
        return url;
      }
    })
    .get();

  if (queue) {
    // push all urls to queue
    for (const queueItem of queue) {
      articleUrls.push(queueItem.url);
    }
  }

  articleUrls = articleUrls.filter((url) => filter(url));
  let articles: Article[] = [];

  for (const url of articleUrls) {
    // TODO: Move this out so you can access it from other places. Possibly add a new function to the scraper type
    const id = new URL(url).pathname.split('/')[3];
    // const url = articleUrls[0];
    const { data } = await axios.get(url);
    let $ = load(data);
    // remove all style and script tags
    $('style').remove();
    $('script').remove();
    const title = $('h1.headline').text();
    // itemProp="articleBody"
    const content = $('div[itemprop="articleBody"]')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(/<[^>]*>?/gm, '');
    console.log(content);
    if (content.length === 0) continue;
    const date = new Date($('article .article-body').attr('data-published')!);
    articles.push({ title, url, content, date, id });
  }
  return articles;
};

export default scrape;

export { config };
