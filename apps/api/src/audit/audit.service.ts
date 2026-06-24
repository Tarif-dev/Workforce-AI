import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditInteraction {
  userId: string;
  message: string;
  intent?: string;
  contextUsed?: boolean;
  extractedData?: any;
  validationData?: any;
  toolName?: string;
  toolResult?: any;
  success: boolean;
  error?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logInteraction(data: AuditInteraction): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          message: data.message,
          intent: data.intent || null,
          contextUsed: data.contextUsed ?? false,
          extractedData: data.extractedData ? data.extractedData : undefined,
          validationData: data.validationData ? data.validationData : undefined,
          toolName: data.toolName || undefined,
          toolResult: data.toolResult ? data.toolResult : undefined,
          success: data.success,
          error: data.error || undefined,
        },
      });
    } catch (e) {
      this.logger.error(`Failed to write audit log: ${e.message}`, e.stack);
    }
  }
}
