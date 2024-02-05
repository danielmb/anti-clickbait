import fs from 'fs';
import path from 'path';
import { Scrape, ScrapeFile } from './types/scraper.types';
import { AiStyles, Article, PrismaClient } from '@repo/prisma/prisma-client';

import { titleGenerator } from './lib/title';
const scrapersPath = path.join(__dirname, 'scrapers');

const scrapers = fs.readdirSync(scrapersPath).filter((file) => {
  return file.endsWith('.ts') || file.endsWith('.js');
});
const Prisma = new PrismaClient();

export const main = async (apiKey: string) => {
  let styles = await Prisma.aiStyles.findMany({
    where: { active: true },
  });
  if (styles.length === 0) {
    console.log('No styles found');
    // create default style
    let defaultStyle = await Prisma.aiStyles.create({
      data: {
        styleName: 'clickbait-remover',
        active: true,
        prompt: `You are tasked with creating a less clickbaity title an article.
The article title should easily convey the content of the article.
The new title have to be in {{language}}.
Your should only reply with the new title. Do not inclue any comments or other text.`,
      },
    });
    styles.push(defaultStyle);
  }

  for (const scraper of scrapers) {
    console.log(scraper);
    const {
      default: scrape,
      config,
      enabled,
    }: ScrapeFile = await import(`./scrapers/${scraper}`);

    if (typeof scrape !== 'function') {
      // throw new Error(
      //   `Scraper ${scraper} does not export a function, found ${typeof scrape}`,
      // );
      continue;
    }
    if (!config) {
      throw new Error(`Scraper ${scraper} does not export a config`);
    }
    if (!enabled) {
      continue;
    }
    let queue = await Prisma.scraperQueue.findMany({
      where: { website: config.name.toLowerCase() },
    });
    Prisma.scraperQueue.deleteMany({
      where: { website: config.name.toLowerCase() },
    });
    const data = await scrape(queue);
    console.log(queue.length, data.length);
    // create if not exists and update if exists

    // throw '';

    for (const article of data) {
      const { ...rest } = article;
      for (const style of styles) {
        let foundArticle = await Prisma.article.findFirst({
          where: {
            url: rest.url,
            styleId: style.id,
          },
        });
        let title = rest.title;
        if (foundArticle && foundArticle.title === title) continue;
        if (title.length > 100) continue;
        if (rest.content.length > 10000) continue;
        if (rest.underTitle && rest.underTitle?.length > 5000) continue;
        // make sure we dont have any duplicates
        const { newTitle, price } = await titleGenerator(
          // title,
          // rest.content,
          // config.language,
          {
            articleTitle: title,
            articleContent: rest.content,
            language: config.language,
            articleUnderTitle: rest.underTitle,
            promptTemplate: style.prompt,
            chatSettings: {
              model: style.model ?? undefined,
            },
            apiKey,
          },
        );
        let createdArticle: Article;
        if (foundArticle) {
          createdArticle = await Prisma.article.update({
            where: { id: foundArticle.id },
            data: {
              title: rest.title,
              aiGeneratedTitle: newTitle,
              tokensUsed: foundArticle.tokensUsed + price,
            },
          });
        } else {
          createdArticle = await Prisma.article.create({
            data: {
              title: rest.title,
              url: rest.url,
              aiGeneratedTitle: newTitle,
              website: config.name.toLowerCase(),
              style: {
                connect: {
                  id: style.id,
                },
              },
              tokensUsed: price,
            },
          });
        }
        await Prisma.receipts.create({
          data: {
            article: {
              connect: {
                id: createdArticle.id,
              },
            },
            amount: price,
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

// main();

// every minute
// setInterval(main, 1000 * 60);

export default main;
