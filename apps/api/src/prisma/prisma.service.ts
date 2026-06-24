import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      console.log(
        'DATABASE_URL:',
        process.env.DATABASE_URL ? 'FOUND' : 'MISSING',
      );

      await this.$connect();

      console.log('Prisma connected successfully');
    } catch (error) {
      console.error('Prisma connection failed', error);
    }
  }
}
