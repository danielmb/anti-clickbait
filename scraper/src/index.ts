import fs from 'fs';
import path from 'path';
import { Scrape, ScrapeFile } from './types/scraper.types';
import { AiStyles, Article, PrismaClient } from '@prisma/client';
import { titleGenerator } from './lib/title';
const scrapersPath = path.join(__dirname, 'scrapers');

const scrapers = fs.readdirSync(scrapersPath).filter((file) => {
  return file.endsWith('.ts') || file.endsWith('.js');
});
const Prisma = new PrismaClient();
const main = async () => {
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
      const { id, ...rest } = article;
      let foundArticle = await Prisma.article.findFirst({
        where: { articleId: id },
      });
      let title = rest.title;
      if (foundArticle && foundArticle.title === title) continue;
      if (title.length > 100) continue;
      if (rest.content.length > 10000) continue;
      if (rest.underTitle && rest.underTitle?.length > 5000) continue;
      for (const style of styles) {
        // make sure we dont have any duplicates
        const newTitle = await titleGenerator(
          // title,
          // rest.content,
          // config.language,
          {
            articleTitle: title,
            articleContent: rest.content,
            language: config.language,
            articleUnderTitle: rest.underTitle,
            promptTemplate: style.prompt,
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
              style: {
                connect: {
                  id: style.id,
                },
              },
            },
          });
        }
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
