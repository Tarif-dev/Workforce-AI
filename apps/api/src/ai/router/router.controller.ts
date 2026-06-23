import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { IntentRouterService } from './intent-router.service';

@Controller('router')
export class RouterController {

  constructor(
    private readonly router:
      IntentRouterService,
  ) {}

  @Post()
  async process(
    @Body()
    body: {
      message: string;
    },
  ) {

    return this.router.process(
      body.message,
    );
  }
}