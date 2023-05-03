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
export const putStylesSchema = z.object({
  styleId: z.number(),
  styleName: z.string().optional(),
  prompt: z.string().optional(),
  active: z.boolean().optional(),
});

export async function put(req: Request, res: Response, next: NextFunction) {
  try {
    const { styleId, styleName, prompt, active } = putStylesSchema.parse(
      req.body,
    );
    let styles = await Prisma.aiStyles.findFirst({
      where: { id: styleId },
    });
    if (!styles) {
      return res.status(404).json({
        message: 'Style not found',
        code: 'not_found',
      });
    }
    styles = await Prisma.aiStyles.update({
      where: { id: styleId },
      data: {
        styleName: styleName,
        prompt: prompt,
        active: active,
      },
    });

    return res.status(200).json({
      styles: styles,
    });
  } catch (err) {
    next(err);
  }
}

export const deleteStylesSchema = z.object({
  styleId: z.number(),
});

export async function deleteStyle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { styleId } = deleteStylesSchema.parse(req.body);
    let styles = await Prisma.aiStyles.findFirst({
      where: { id: styleId },
    });
    if (!styles) {
      return res.status(404).json({
        message: 'Style not found',
        code: 'not_found',
      });
    }
    styles = await Prisma.aiStyles.update({
      where: { id: styleId },
      data: {
        active: false,
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
  post,
};
