import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';

import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';

import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly configService: ConfigService,
    private readonly webhooksService: WebhooksService,
  ) {}

  @Post('clerk')
  async clerkWebhook(
    @Req() req: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const secret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

    if (!secret) {
      throw new Error('CLERK_WEBHOOK_SECRET is missing');
    }

    const wh = new Webhook(secret);

    let evt: any;

    try {
      evt = wh.verify(req.rawBody.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const eventType = evt.type;

    switch (eventType) {
      case 'user.created':
        await this.webhooksService.handleUserCreated(evt.data);
        break;

      case 'user.updated':
        await this.webhooksService.handleUserUpdated(evt.data);
        break;

      case 'user.deleted':
        await this.webhooksService.handleUserDeleted(evt.data);
        break;
    }

    return {
      success: true,
    };
  }
}
