import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';

export interface ChatParams {
  model?: string;
  messages?: ChatCompletionRequestMessage[];
  apiKey: string;
}
export class Chat {
  model: string = 'gpt-3.5-turbo';
  messages: ChatCompletionRequestMessage[];
  openai: OpenAIApi;
  constructor({ model, messages, apiKey }: ChatParams) {
    this.model = model || this.model;
    this.messages = messages || [];
    this.openai = new OpenAIApi(new Configuration({ apiKey }));
  }
  async createChatCompletion(
    dontAddMessageToMessages?: boolean,
    additonalMessages?: ChatCompletionRequestMessage[],
    addAdditionalMessageToMessages?: boolean,
  ) {
    let generatedMessage = await this.openai.createChatCompletion({
      model: this.model ?? 'gpt-3.5-turbo',
      messages: this.messages.concat(additonalMessages || []),
    });
    if (!dontAddMessageToMessages) {
      if (generatedMessage.data.choices[0].message) {
        this.addMessage(generatedMessage.data.choices[0].message);
      }
    }
    if (addAdditionalMessageToMessages) {
      if (generatedMessage.data.choices[0].message) {
        this.addMessage(generatedMessage.data.choices[0].message);
      }
    }

    return generatedMessage;
  }
  addMessage(message: ChatCompletionRequestMessage) {
    this.messages.push(message);
  }
}

export interface DalleParams {
  apiKey?: string;
  openai?: OpenAIApi;
}
export class Dalle {
  openai: OpenAIApi;
  constructor({ apiKey, openai }: DalleParams) {
    if (openai) this.openai = openai;
    else if (apiKey) this.openai = new OpenAIApi(new Configuration({ apiKey }));
    else
      throw new Error(
        'You need to provide either an openai instance or an api key',
      );
  }

  async createDalleCompletion(prompt: string) {
    let generateImage = await this.openai.createImage({
      prompt: prompt,
      n: 1,
      size: '512x512',
    });
    return generateImage;
  }
}

export default {
  Chat,
  Dalle,
};
