import { Injectable, Logger } from '@nestjs/common';
import { OllamaProvider } from '../providers/ollama.provider';
import { ATTENDANCE_EXTRACTION_PROMPT } from './attendance.prompt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AttendanceExtractionDto } from './attendance.dto';

@Injectable()
export class AttendanceExtractorService {
  private readonly logger = new Logger(AttendanceExtractorService.name);

  constructor(private readonly ollama: OllamaProvider) {}

  async extract(message: string): Promise<AttendanceExtractionDto> {
    const result = await this.ollama.generateJson(
      message,
      ATTENDANCE_EXTRACTION_PROMPT,
    );

    const dto = plainToInstance(AttendanceExtractionDto, result);
    const errors = await validate(dto);
    if (errors.length > 0) {
      this.logger.error(`Validation failed for extracted attendance data`, errors);
    }

    return dto;
  }
}
