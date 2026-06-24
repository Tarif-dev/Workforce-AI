import { Injectable } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly baseUrl =
    process.env.OLLAMA_URL ?? 'http://192.168.19.21:11434';

  private readonly model = process.env.OLLAMA_MODEL ?? 'qwen2.5-coder:32b';

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        model: this.model,

        stream: false,

        messages: [
          {
            role: 'system',
            content: systemPrompt ?? 'You are a helpful AI assistant.',
          },

          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    return data.message.content;
  }

  async generateJson(prompt: string, originalPrompt: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `
Current date: ${today}

${originalPrompt}
`;

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        model: this.model,

        stream: false,

        format: 'json',

        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    return JSON.parse(data.message.content);
  }
}
