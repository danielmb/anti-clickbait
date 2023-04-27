import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
const app = express();

const rootGetSchema = z.object({
  website: z.string(),
  id: z.string(),
  url: z.string(),
});
const Prisma = new PrismaClient();

app.get('/', async (req, res) => {
  console.log('GET /');
  const { website, id, url } = rootGetSchema.parse(req.query);
  if (!url.toLowerCase().includes(website.toLowerCase())) {
    return res.status(400).json({
      message: 'Invalid URL',
      code: 'invalid_url',
    });
  }
  console.log(website, id);
  let found = await Prisma.article.findFirst({
    where: {
      website: website.toLowerCase(),
      articleId: id,
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
          articleId: id,
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
  console.log(found.aiGeneratedTitle);
  return res.status(200).send(found.aiGeneratedTitle);
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
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
