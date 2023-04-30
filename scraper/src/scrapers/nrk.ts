import {
  Article,
  Scrape,
  ScrapeConfig,
  ScrapeFile,
} from '../types/scraper.types';
import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import simplify from '../util/simplify';
// import fs from 'fs';
let allowed = [
  'osloogviken',
  'nyheter',
  'urix',
  'sport',
  'norge',
  'tromsogfinnmark',
  'sapmi',
  'ytring',
  'rogaland',
  'trondelag',
  'anmeldelser',
  'kultur',
  'innlandet',
  'vestland',
  'spesial',
  'sorlandet',
  'nordland',
];
let news = [
  'osloogviken',
  'nyheter',
  'urix',
  'sport',
  'norge',
  'tromsogfinnmark',
  'sapmi',
  'ytring',
  'rogaland',
  'trondelag',
  'anmeldelser',
  'kultur',
  'innlandet',
  'vestland',
  'spesial',
  'sorlandet',
  'nordland',
];

let filter = (url: string) => {
  if (
    !url.startsWith('https://www.nrk.no/') ||
    url.startsWith('https:/www.nrk.no/video') ||
    url === 'https://www.nrk.no/nyheter'
  )
    return false;
  let newsType = url.split('/')[3];
  if (!allowed.includes(newsType)) return false;
  // if (!allowed.includes(newsType)) return false;
  return true;
};
let config: ScrapeConfig = {
  url: 'https://www.nrk.no/',
  name: 'nrk',
  language: 'Norwegian',
};

let newsScrape = ($: CheerioAPI, url: string) => {
  const id = new URL(url).pathname.split('/')[3];
  const title = simplify($('h1.title').text());
  const underTitle = simplify($('div.text-body p').first().text());
  const content = simplify($('div.article-body').first().text());
  const date = new Date(
    $('div.article-dateline').find('time').attr('datetime')!,
  );
  return {
    title,
    content,
    date,
    underTitle,
    id,
  };
};

let studioScrape = async ($: CheerioAPI, url: string) => {
  // id is the parameter in the url called post
};
let videoScrape = async ($: CheerioAPI, url: string) => {
  const id = new URL(url).pathname.split('/')[3];
};

let scrapeArticle = async (url: string): Promise<Article | null> => {
  // const url = articleUrls[0];
  console.log('Scraping article: ' + url);
  const { data } = await axios.get(url);
  const $ = load(data);
  let newsType = url.split('/')[3];
  if (news.includes(newsType))
    return {
      ...newsScrape($, url),
      url,
    };
  return null;
};

let scrape: Scrape = async (queue) => {
  console.log('Scraping dagbladet!');
  const { data } = await axios.get('https://www.nrk.no/');
  let $ = load(data);
  let sections = $('section.kur-floor');
  console.log(sections.length);
  let articleUrls = sections
    .map((i, el) => {
      const url = $(el).find('a').attr('href');
      if (url) return url;
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
    const article = await scrapeArticle(url);
    if (article) articles.push(article);
  }
  console.log('Scraped ' + articles.length + ' articles!');
  return articles;
};

export default scrape;

export { config };

export let enabled = true;
