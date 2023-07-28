import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';
import config from 'config';
import { createReadStream } from 'fs';

class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  };

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    const response = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });
    return response.data.choices[0].message;
  }

  async transcription(filepath) {
    const response = await this.openai.createTranscription(
      createReadStream(filepath),
      'whisper-1'
    );
    return response.data.text;
  }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'));
