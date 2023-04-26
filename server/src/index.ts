import fs from 'fs';
import path from 'path';
import { Article, Scrape, ScrapeFile } from './types/scraper.types';
const scrapersPath = path.join(__dirname, 'scrapers');

const scrapers = fs.readdirSync(scrapersPath);

const main = async () => {
  for (const scraper of scrapers) {
    const { default: scrape }: ScrapeFile = await import(
      `./scrapers/${scraper}`
    );
    if (typeof scrape !== 'function') {
      throw new Error(
        `Scraper ${scraper} does not export a function, found ${typeof scrape}`,
      );
    }

    const data = await scrape();
    console.log(data);
  }
};

main();
