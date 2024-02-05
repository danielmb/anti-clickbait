import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AiStyles, Article, PrismaClient } from '@repo/prisma/prisma-client';
const Prisma = new PrismaClient();

const titleGetSchema = z.object({
  url: z.string(),
  styleName: z.string(),
});
export type titleGetResponse = {
  article: Article;
};
export async function get(req: Request, res: Response, next: NextFunction) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({
      message: 'Invalid request',
      code: 'invalid_request_error',
    });
  }
  try {
    const { url, styleName } = await titleGetSchema.parseAsync(req.query);
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
        if (!website) {
          return res.status(400).json({
            message: 'Invalid url',
            code: 'invalid_request_error',
          });
        }
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
}

export default {
  get,
};
