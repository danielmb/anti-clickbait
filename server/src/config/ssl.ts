import { z } from 'zod';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

export const { PRIVATE_KEY_PATH, CERTIFICATE_PATH } = z
  .object({
    PRIVATE_KEY_PATH: z.string(),
    CERTIFICATE_PATH: z.string(),
  })
  .parse(process.env);
// const privateKey = fs.readFileSync(PRIVATE_KEY_PATH);
// const certificate = fs.readFileSync(CERTIFICATE_PATH);
export const { privateKey, certificate } = z
  .object({
    privateKey: z.string(),
    certificate: z.string(),
  })
  .parse({
    privateKey: fs.readFileSync(PRIVATE_KEY_PATH),
    certificate: fs.readFileSync(CERTIFICATE_PATH),
  });
