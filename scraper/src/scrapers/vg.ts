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
  'nyheter',
  'rampelys',
  'sport',
  'dinepenger',
  'forbruker',
  'tag',
  'spill',
  'spesial',
];
let news = [
  'nyheter',
  'rampelys',
  'sport',
  'dinepenger',
  'forbruker',
  'tag',
  'spill',
  'spesial',
];
let filter = (url: string) => {
  if (!url.startsWith('https://www.vg.no/')) return false;

  let newsType = url.split('/')[3];
  if (!allowed.includes(newsType)) return false;
  return true;
};
let config: ScrapeConfig = {
  url: 'https://www.vg.no/',
  name: 'vg',
  language: 'Norwegian',
};

let newsScrape = ($: CheerioAPI, url: string) => {
  const id = new URL(url).pathname.split('/')[3];
  const title = $('h1[data-test-tag="headline"]').text();
  const underTitle = $('p[data-test-tag="lead-text"]').text();
  // content is every p with a class that starts with hyperion-css
  const content = $('article > p[class^="hyperion-css"]')
    .get()
    .map((p) => $(p).text())
    .join('\n');
  const date = new Date($('time').attr('datetime')!);
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
  let urlClass = new URL(url);
  let urlWithoutParams = urlClass.origin + urlClass.pathname;
  const { data } = await axios.get(url);
  const $ = load(data);
  let newsType = url.split('/')[3];
  if (news.includes(newsType)) {
    return {
      ...newsScrape($, url),
      url: urlWithoutParams,
    };
  }
  return null;
};

let scrape: Scrape = async (queue) => {
  const { data } = await axios.get('https://www.vg.no/');
  const $ = load(data);
  let articlesDoms = $('article.article');
  let articleUrls: string[] = articlesDoms
    .map((i, el) => {
      const url = $(el).find('a').attr('href');
      if (url) return url;
    })
    .get();
  articleUrls = articleUrls.filter(filter);
  let articles: Article[] = [];
  for (let url of articleUrls) {
    let article = await scrapeArticle(url);
    if (article) articles.push(article);
  }
  return articles;
};

export default scrape;

export { config };

export let enabled = false;
