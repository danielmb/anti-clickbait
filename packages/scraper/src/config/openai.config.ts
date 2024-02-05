import { z } from 'zod';
const openaiConfig = z
  .object({
    OPENAI_API_KEY: z.string(),
  })
  .parse(process.env);

export default openaiConfig;
