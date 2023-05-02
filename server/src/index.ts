import express from 'express';
import { z } from 'zod';
import { AiStyles, Article, PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const app = express();
const Prisma = new PrismaClient();

const rootGetSchema = z.object({
  url: z.string(),
  styleName: z.string(),
});
export type rootGetResponse = {
  article: Article;
};
const { PRIVATE_KEY_PATH, CERTIFICATE_PATH } = z
  .object({
    PRIVATE_KEY_PATH: z.string(),
    CERTIFICATE_PATH: z.string(),
  })
  .parse(process.env);

const privateKey = fs.readFileSync(PRIVATE_KEY_PATH);
const certificate = fs.readFileSync(CERTIFICATE_PATH);

app.get('/', async (req, res, next) => {
  // get ip address from request

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({
      message: 'Invalid request',
      code: 'invalid_request_error',
    });
  }
  try {
    const { url, styleName } = await rootGetSchema.parseAsync(req.query);
    let website = new URL(url).hostname.split('.')[1];
    let style = await Prisma.aiStyles.findFirst({
      where: {
        styleName: styleName,
        active: true,
      },
    });
    if (!style) {
      return res.status(400).json({
        message: 'Invalid style',
        code: 'invalid_request_error',
      });
    }
    let found = await Prisma.article.findFirst({
      where: {
        url: url,
        styleId: style.id,
      },
    });
    console.log(found);
    if (!found) {
      let queue = await Prisma.scraperQueue.findFirst({
        where: {
          url: url,
        },
      });
      if (!queue) {
        await Prisma.scraperQueue.create({
          data: {
            url: url,
            website: website.toLowerCase(),
            ip: ip,
            styleId: style.id,
          },
        });
        return res.status(202).json({
          message: 'Article not found, added to queue',
          code: 'article_not_found',
        });
      }
      return res.status(202).json({
        message: 'Article not found, in queue',
        code: 'article_not_found',
      });
    }
    console.log(found);
    return res.status(200).send({
      article: found,
    });
  } catch (err) {
    next(err);
  }
});

export type GetStylesResponse = {
  styles: AiStyles[];
};

app.get('/styles', async (req, res, next) => {
  try {
    let styles = await Prisma.aiStyles.findMany({
      where: { active: true },
    });
    if (styles.length === 0) {
      console.log('No styles found');
      return res.status(404).json({
        message: 'No styles found',
        code: 'not_found',
      });
    }
    return res.status(200).json({
      styles: styles,
    });
  } catch (err) {
    next(err);
  }
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: err.message,
        code: 'invalid_request_error',
        details: err.issues,
      });
    } else {
      res.status(500).json({
        message: err.message,
        code: 'internal_server_error',
      });
    }
  },
);

// app.listen(process.env.PORT || 3000, () => {
//   console.log(`Server listening on port ${process.env.PORT || 3000}`);
// });

const httpsServer = https
  .createServer(
    {
      key: privateKey,
      cert: certificate,
    },
    app,
  )
  .listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
  });

// const httpServer = http
//   .createServer((req, res) => {
//     res.writeHead(301, {
//       Location: `https://${req.headers.host}${req.url}`,
//     });
//     res.end();
//   })
//   .listen(80, () => {
//     console.log(`Server listening on port 80`);
//   });
