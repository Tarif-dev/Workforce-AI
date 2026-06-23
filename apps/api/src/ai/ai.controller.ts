import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post('chat')
  async chat(
    @Body()
    body: {
      prompt: string;
    },
  ) {
    const response =
      await this.aiService.ask(
        body.prompt,
      );

    return {
      response,
    };
  }
}