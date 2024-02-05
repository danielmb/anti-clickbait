import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { Receipts, PrismaClient } from '@repo/prisma/prisma-client';
const Prisma = new PrismaClient();

export async function GET(req: Request, res: Response, next: NextFunction) {
  try {
    let receipts = await Prisma.receipts.findMany({
      include: {
        article: true,
      },
    });
    return res.status(200).json({
      receipts: receipts,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  get: GET,
};
