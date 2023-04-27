import {
  Article,
  Scrape,
  ScrapeConfig,
  ScrapeFile,
} from '../types/scraper.types';
import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import fs from 'fs';
// let allowed = ['nyheter', 'tema', 'kjenids', 'sport', 'studio'];
let allowed = ['video'];
let filter = (url: string) => {
  if (
    !url.startsWith('https://www.dagbladet.no/') ||
    !url.startsWith('https://dinside.dagbladet.no/')
  )
    return false;
  let newsType = url.split('/')[3];
  if (!allowed.includes(newsType)) return false;
  return true;
};
let config: ScrapeConfig = {
  url: 'https://www.dagbladet.no/',
  name: 'dagbladet',
  language: 'Norwegian',
};

let newsScrape = async ($: CheerioAPI, url: string) => {
  const id = new URL(url).pathname.split('/')[3];

  const title = $('h1.headline').text();
  const underTitle = $('h3.subtitle').text();
  // itemProp="articleBody"
  const content = $('div[itemprop="articleBody"]')
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/<[^>]*>?/gm, '');
  if (content.length === 0 && !underTitle && underTitle.length === 0)
    return null;
  const date = new Date($('article .article-body').attr('data-published')!);
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
  const id = new URL(url).searchParams.get('post')!;
  const title = $('h1[class^="Title__Heading"]').first().text();
  const content = $('div[class^="Bodytext__Paragraph"]').first().text();
  const date = new Date();
  return {
    title,
    content,
    date,
    id,
  };
};
let videoScrape = async ($: CheerioAPI, url: string) => {
  const id = new URL(url).pathname.split('/')[3];
  const titleDiv = $('h1').first();
  const title = titleDiv.text();
  const content = titleDiv
    .parent()
    .parent()
    .parent()
    .children()
    .last()
    .children()
    .first()
    .text();
  const date = new Date();
  return {
    title,
    content,
    date,
    id,
  };
};

let scrapeArticle = async (url: string): Promise<Article | null> => {
  // const url = articleUrls[0];
  const { data } = await axios.get(url);
  let $ = load(data);
  // remove all style and script tags
  $('style').remove();
  $('script').remove();
  switch (url.split('/')[3]) {
    case 'video': {
      const video = await videoScrape($, url);
      if (!video) return null;
      return {
        ...video,
        url,
      };
    }
    case 'studio': {
      const studio = await studioScrape($, url);
      if (!studio) return null;
      return {
        ...studio,
        url,
      };
    }
    default: {
      const news = await newsScrape($, url);
      if (!news) return null;
      return {
        ...news,
        url,
      };
    }
  }
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
    const article = await scrapeArticle(url);
    if (article) articles.push(article);
  }
  return articles;
};

export default scrape;

export { config };

export let enabled = false;
