import openai from './openai';
import config from '../config/openai.config';
interface TitleGeneratorProps {
  articleTitle: string;
  articleUnderTitle?: string;
  articleContent: string;
  language: string;
  promptTemplate: string;
}
/**
 *
 * @param template Template to be converted
 * @param data
 * @returns  Converted template
 * @example
 * templateConverter("Hello {{name}}", {name: "world"}) // "Hello world"
 * templateConverter("Hello {{name}}", {name: undefined}) // "Hello "
 * templateConverter("Hello {{name}}", {}) // Error "Not all variables are replaced"
 */
export const templateConverter = async (
  template: string,
  data: {
    [key: string]: string | undefined;
  },
) => {
  let result = template;
  for (const key in data) {
    result = result.replace(`{{${key}}}`, data[key] || '');
  }
  if (result.match(/{{.*}}/)) {
    throw new Error('Not all variables are replaced');
  }
  return result;
};
export const titleGenerator = async ({
  articleTitle,
  articleUnderTitle,
  articleContent,
  language,
  promptTemplate,
}: TitleGeneratorProps) => {
  let convertedPrompt = await templateConverter(promptTemplate, {
    articleTitle,
    articleUnderTitle,
    articleContent,
    language,
  }).catch((e) => {
    throw new Error('Invalid template');
  });
  let chat = new openai.Chat({
    apiKey: config.OPENAI_API_KEY,
  });
  chat.addMessage({
    content: convertedPrompt,
    role: 'system',
  });

  let prompt = `Article title: ${articleTitle}\n`;
  if (articleUnderTitle)
    prompt += `Article under title: ${articleUnderTitle}\n`;
  prompt += `Article content: ${articleContent}\n`;
  chat.addMessage({
    content: prompt,
    role: 'user',
  });
  console.log(chat.messages);
  let generatedMessage = await chat.createChatCompletion();
  if (!generatedMessage.data.choices[0].message) return articleTitle;
  console.log(generatedMessage.data.choices[0].message.content);
  return generatedMessage.data.choices[0].message?.content;
};
