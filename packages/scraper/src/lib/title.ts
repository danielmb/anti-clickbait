import openai, { ChatParams } from './openai';
import { GetCost } from './token';
interface TitleGeneratorProps {
  articleTitle: string;
  articleUnderTitle?: string;
  articleContent: string;
  language: string;
  promptTemplate: string;
  apiKey: string;
  chatSettings?: Partial<ChatParams>;
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
  chatSettings,
  apiKey,
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
    apiKey: apiKey,
    ...chatSettings,
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
  let price = chat.messages.reduce((acc, curr) => {
    return acc + GetCost(curr.content ?? '');
  }, 0);
  console.log(chat.messages);
  console.log(price);
  let generatedMessage = await chat.createChatCompletion();
  if (!generatedMessage.choices[0]?.message)
    return {
      newTitle: articleTitle,
      price,
    };
  console.log(generatedMessage.choices[0].message.content);
  return {
    newTitle: generatedMessage.choices[0].message.content ?? '',
    price,
  };
};
