import fs from 'fs';
import path from 'path';
import { Article, Scrape, ScrapeFile } from './types/scraper.types';
import { PrismaClient } from '@prisma/client';
import { titleGenerator } from './lib/title';
const scrapersPath = path.join(__dirname, 'scrapers');

const scrapers = fs.readdirSync(scrapersPath);
const Prisma = new PrismaClient();
const main = async () => {
  for (const scraper of scrapers) {
    const {
      default: scrape,
      config,
      enabled,
    }: ScrapeFile = await import(`./scrapers/${scraper}`);
    if (typeof scrape !== 'function') {
      // throw new Error(
      //   `Scraper ${scraper} does not export a function, found ${typeof scrape}`,
      // );
      return;
    }
    if (!config) {
      throw new Error(`Scraper ${scraper} does not export a config`);
    }
    if (!enabled) {
      return;
    }
    let queue = await Prisma.scraperQueue.findMany({
      where: { website: config.name.toLowerCase() },
    });
    Prisma.scraperQueue.deleteMany({
      where: { website: config.name.toLowerCase() },
    });
    console.log(queue);
    const data = await scrape(queue);
    // create if not exists and update if exists

    // throw '';
    for (const article of data) {
      const { id, ...rest } = article;
      let foundArticle = await Prisma.article.findFirst({
        where: { articleId: id },
      });
      let title = rest.title;
      if (foundArticle && foundArticle.title === title) continue;
      const newTitle = await titleGenerator(
        // title,
        // rest.content,
        // config.language,
        {
          articleTitle: title,
          articleContent: rest.content,
          language: config.language,
          articleUnderTitle: rest.underTitle,
        },
      );

      if (foundArticle) {
        await Prisma.article.update({
          where: { id: foundArticle.id },
          data: {
            title: rest.title,
            aiGeneratedTitle: newTitle,
          },
        });
      } else {
        await Prisma.article.create({
          data: {
            title: rest.title,
            url: rest.url,
            articleId: id,
            aiGeneratedTitle: newTitle,
            website: config.name.toLowerCase(),
          },
        });
      }
      await Prisma.scraperQueue.deleteMany({
        where: { url: rest.url },
      });
    }
  }
  // delete all queue items
};

main();

// every minute
// setInterval(main, 1000 * 60);
