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
    ) { }

    @Post()
    async process(
        @Body()
        body: {
            message: string;
        },
    ) {

        const userId =
            '3e998967-a947-451c-880f-d17663bef69b';

        return this.router.process(
            userId,
            body.message,
        );
    }
}