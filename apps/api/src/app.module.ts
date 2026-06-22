import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { AgentsModule } from './agents/agents.module';
import { ToolsModule } from './tools/tools.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    WebhooksModule, AiModule, AgentsModule, ToolsModule, RagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
