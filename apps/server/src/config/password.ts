import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

export const { PASSWORD } = z
  .object({
    PASSWORD: z.string(),
  })
  .parse(process.env);
