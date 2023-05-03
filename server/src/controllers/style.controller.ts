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

export default {
  get,
};
