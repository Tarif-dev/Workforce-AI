import { Injectable } from '@nestjs/common';
import { OllamaProvider } from '../providers/ollama.provider';
import { LeaveExtractionSchema } from './leave.schema';
import { LEAVE_EXTRACTION_PROMPT } from './leave.prompt';

@Injectable()
export class LeaveExtractorService {

  constructor(
    private readonly ollama:
      OllamaProvider,
  ) { }

  async extract(
    message: string,
  ) {

    const result =
      await this.ollama.generateJson(
        message,
        LEAVE_EXTRACTION_PROMPT,
      );

    console.log(
      'RAW LEAVE EXTRACTION',
      result,
    );

    return LeaveExtractionSchema.parse(
      result,
    );
  }
}