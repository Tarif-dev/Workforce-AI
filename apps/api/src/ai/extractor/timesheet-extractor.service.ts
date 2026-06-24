import { Injectable, Logger } from '@nestjs/common';
import { OllamaProvider } from '../providers/ollama.provider';
import { TIMESHEET_EXTRACTION_PROMPT } from './timesheet.prompt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TimesheetExtractionDto } from './timesheet.dto';

@Injectable()
export class TimesheetExtractorService {
  private readonly logger = new Logger(TimesheetExtractorService.name);

  constructor(private readonly ollama: OllamaProvider) {}

  async extract(message: string): Promise<TimesheetExtractionDto> {
    const result = await this.ollama.generateJson(
      message,
      TIMESHEET_EXTRACTION_PROMPT,
    );

    const dto = plainToInstance(TimesheetExtractionDto, result);
    const errors = await validate(dto);
    if (errors.length > 0) {
      this.logger.error(
        `Validation failed for extracted timesheet data`,
        errors,
      );
      // In a real scenario we might want to throw or return a partial DTO.
      // Returning the dto anyway as the LLM output might be partially valid.
    }

    return dto;
  }
}
