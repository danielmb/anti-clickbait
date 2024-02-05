import { ScraperQueue } from '@repo/prisma/prisma-client';

export interface Article {
  title: string;
  url: string;
  id: string;
  content: string;
  date: Date;
  underTitle?: string;
}

export type Scrape = (queue?: ScraperQueue[]) => Promise<Article[]>;
/**
 * @param url The url to scrape
 * @param name The name of the scraper
 * @param language The language of the scraper, is directly filled to the ai. So it doesn't matter how you type it. But full names are preferred.
 */
export type ScrapeConfig = {
  url: string;
  name: Lowercase<string>;
  language: string;
};
export type ScrapeFile = {
  default: Scrape;
  config: ScrapeConfig;
  enabled?: boolean;
};
