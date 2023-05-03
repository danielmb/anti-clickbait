import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AiStyles, Article, PrismaClient } from '@prisma/client';
const Prisma = new PrismaClient();

export type GetStylesResponse = {
  styles: AiStyles[];
};

export async function get(req: Request, res: Response, next: NextFunction) {
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
}

export const postStylesSchema = z.object({
  styleName: z.string(),
  prompt: z.string(),
});

export async function post(req: Request, res: Response, next: NextFunction) {
  try {
    const { styleName, prompt } = postStylesSchema.parse(req.body);
    // example of how to create a style
    //      await Prisma.aiStyles.create({
    //       data: {
    //         styleName: 'clickbait-remover',
    //         active: true,
    //         prompt: `You are tasked with creating a less clickbaity title an article.
    // The article title should easily convey the content of the article.
    // The new title have to be in {{language}}.
    // Your should only reply with the new title. Do not inclue any comments or other text.`,
    //       },
    //     });

    let styles = await Prisma.aiStyles.findFirst({
      where: { styleName: styleName },
    });
    if (styles) {
      return res.status(400).json({
        message: 'Style already exists',
        code: 'already_exists',
      });
    }
    styles = await Prisma.aiStyles.create({
      data: {
        styleName: styleName,
        active: true,
        prompt: prompt,
      },
    });

    return res.status(200).json({
      styles: styles,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  get,
};
