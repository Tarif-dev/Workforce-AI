import { Injectable } from '@nestjs/common';
import { OllamaProvider } from './providers/ollama.provider';

@Injectable()
export class AiService {
  constructor(private readonly ollama: OllamaProvider) {}

  async healthCheck() {
    return {
      status: 'healthy',
      service: 'ai',
    };
  }

  async ask(prompt: string) {
    return this.ollama.generate(prompt);
  }
}
