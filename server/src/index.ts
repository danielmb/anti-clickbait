import express from 'express';
import { z } from 'zod';
import { Article, PrismaClient } from '@prisma/client';
const app = express();

const rootGetSchema = z.object({
  url: z.string(),
});
const Prisma = new PrismaClient();
export type rootGetResponse = {
  article: Article;
};
app.get('/', async (req, res, next) => {
  console.log('GET /');
  try {
    const { url } = rootGetSchema.parse(req.query);
    let website = new URL(url).hostname.split('.')[1];
    let found = await Prisma.article.findFirst({
      where: {
        // website: website.toLowerCase(),
        // articleId: id,
        url: url,
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
            articleId: 'not implemented',
            website: website.toLowerCase(),
          },
        });
        return res.status(202).json({
          message: 'Article not found, added to queue',
          code: 'article_not_found',
        });
      }
      return res.status(404).json({
        message: 'Article not found',
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

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.log('ErroR!!!');
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
