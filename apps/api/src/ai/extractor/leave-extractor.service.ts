import { Injectable, Logger } from '@nestjs/common';
import { OllamaProvider } from '../providers/ollama.provider';
import { LEAVE_EXTRACTION_PROMPT } from './leave.prompt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LeaveExtractionDto } from './leave.dto';

@Injectable()
export class LeaveExtractorService {
  private readonly logger = new Logger(LeaveExtractorService.name);

  constructor(private readonly ollama: OllamaProvider) {}

  async extract(message: string): Promise<LeaveExtractionDto> {
    const result = await this.ollama.generateJson(
      message,
      LEAVE_EXTRACTION_PROMPT,
    );

    const dto = plainToInstance(LeaveExtractionDto, result);
    const errors = await validate(dto);
    if (errors.length > 0) {
      this.logger.error(`Validation failed for extracted leave data`, errors);
    }

    return dto;
  }
}
