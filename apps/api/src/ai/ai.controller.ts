import { Body, Controller, Post } from '@nestjs/common';

import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('process')
  async processMessage(@Body() body: { userId: string; message: string }) {
    const response = await this.aiService.ask(body.message);

    return {
      response,
    };
  }
}
