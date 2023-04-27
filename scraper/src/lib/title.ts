import openai from './openai';
import config from '../config/openai.config';
export const titleGenerator = async (
  articleTitle: string,
  articleContent: string,
  language: string,
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
  chat.addMessage({
    content: `Article title: ${articleTitle}
Article content: ${articleContent}`,
    role: 'user',
  });
  console.log(chat.messages[1]);
  let generatedMessage = await chat.createChatCompletion();
  if (!generatedMessage.data.choices[0].message) return articleTitle;
  return generatedMessage.data.choices[0].message?.content;
};
