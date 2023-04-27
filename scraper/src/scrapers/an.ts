import {
  Article,
  Scrape,
  ScrapeConfig,
  ScrapeFile,
} from '../types/scraper.types';
import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import fs from 'fs';
import simplify from '../util/simplify';
const newsScrape = async ($: CheerioAPI, url: string) => {
  const id = new URL(url).pathname.split('/')[3];
  const title = simplify($('h1[itemprop="headline"]').text());
  const underTitle = simplify($('p[data-content="lead-text"]').text());
  const content = simplify($('div.body-text').text());

  const date = new Date($('time.time-published').attr('datetime')!);
  return {
    title,
    content,
    date,
    underTitle,
    id,
  };
};

let filter = (url: string) => {
  if (!url.startsWith('https://www.an.no/')) return false;
  if (url.startsWith('https://www.an.no/vis/')) return false;
  if (url.startsWith('https://www.an.no/ans-nyhetsstudio/')) return false;
  if (url.startsWith('https://www.an.no/sport/')) return false;
  if (url.startsWith('https://www.an.no/sportsstudio/')) return false;
  if (url.startsWith('https://www.an.no/anpluss/')) return false;
  if (url.startsWith('https://www.an.no/kulturstudio/')) return false;
  // let newsType = url.split('/')[3];
  // if (!allowed.includes(newsType)) return false;
  return true;
};
let config: ScrapeConfig = {
  url: 'https://www.an.no/',
  name: 'an',
  language: 'Norwegian',
};

let scrapeArticle = async (url: string): Promise<Article | null> => {
  // const url = articleUrls[0];
  const res = await axios.get(url).catch((err) => {
    console.log(err);
    return null;
  });
  if (!res) return null;
  let $ = load(res.data);
  // remove all style and script tags
  $('style').remove();
  $('script').remove();
  console.log('scraping article');
  console.log(url);
  let article = await newsScrape($, url);
  if (article) {
    return {
      ...article,
      url,
    };
  }
  return null;
};

let scrape: Scrape = async (queue) => {
  const { data } = await axios.get('https://www.an.no/');
  let $ = load(data);
  console.log('scraping');
  console.log($('article').length);
  let articleUrls: string[] = $('article')
    .map((i, el) => {
      let url = $(el).find('a').attr('href'); // if the href is a path, it will be relative to the current url
      // regex to check if the url is a url
      if (url) {
        if (url?.match(/^(http|https):\/\//)) {
          return url;
        }
        return new URL(url, config.url).href;
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
    console.log('scraping article' + url);
    // TODO: Move this out so you can access it from other places. Possibly add a new function to the scraper type
    const article = await scrapeArticle(url);
    if (article) articles.push(article);
  }
  return articles;
};

export default scrape;

export { config };

export let enabled = true;
