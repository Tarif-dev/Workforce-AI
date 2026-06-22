import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
    async healthCheck() {
        return {
            status: 'healthy',
            service: 'ai',
        };
    }
}
