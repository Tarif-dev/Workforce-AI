import { Injectable } from '@nestjs/common';

import { OllamaProvider } from '../providers/ollama.provider';

import { IntentResponseSchema }
  from './intent.schema';

import { INTENT_SYSTEM_PROMPT }
  from './intent.prompts';

@Injectable()
export class IntentService {

  constructor(
    private readonly ollama: OllamaProvider,
  ) {}

  async classify(
    message: string,
  ) {

    const result =
      await this.ollama.generateJson(
        message,
        INTENT_SYSTEM_PROMPT,
      );

    return IntentResponseSchema.parse(
      result,
    );
  }
}