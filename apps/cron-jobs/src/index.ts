import { CronJob } from 'cron';
import winston from 'winston';
import scrape from '@repo/scraper';

// create a prisma transport

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'cron-jobs' },
  transports: [new winston.transports.Console()],
});

const job = new CronJob(
  '*/60 * * * * *',
  () => {
    if (process.env.OPENAI_API_KEY === undefined) {
      logger.error('OPENAI_API_KEY is not defined');
      job.stop();
      return;
    }
    scrape(process.env.OPENAI_API_KEY).catch((e) => {
      logger.error(e);
    });
  },
  null,
  true,
  // timezone oslo
  'Europe/Oslo',
);

job.start();
