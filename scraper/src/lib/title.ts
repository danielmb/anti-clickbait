import openai from './openai';
import config from '../config/openai.config';
interface TitleGeneratorProps {
  articleTitle: string;
  articleUnderTitle?: string;
  articleContent: string;
  language: string;
}
export const titleGenerator = async (
  // articleTitle: string,
  // articleUnderTitle?: string,
  // articleContent: string,
  // language: string,
  {
    articleTitle,
    articleUnderTitle,
    articleContent,
    language,
  }: TitleGeneratorProps,
) => {
  let chat = new openai.Chat({
    apiKey: config.OPENAI_API_KEY,
  });
  chat.addMessage({
    content: `You are tasked with creating a less clickbaity title an article.
The article title should easily convey the content of the article.
The new title have to be in ${language}.
Your should only reply with the new title. Do not inclue any comments or other text.
`,
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
  console.log(chat.messages[1]);
  let generatedMessage = await chat.createChatCompletion();
  if (!generatedMessage.data.choices[0].message) return articleTitle;
  return generatedMessage.data.choices[0].message?.content;
};
