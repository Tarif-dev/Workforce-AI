import { Body, Controller, Post } from '@nestjs/common';

import { IntentService } from './intent.service';

@Controller('intent')
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  @Post()
  async classify(
    @Body()
    body: {
      message: string;
    },
  ) {
    return this.intentService.classify(body.message);
  }
}
