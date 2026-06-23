import { Injectable } from '@nestjs/common';
import { OllamaProvider } from '../providers/ollama.provider';
import { TimesheetExtractionSchema } from './timesheet.schema';
import { TIMESHEET_EXTRACTION_PROMPT } from './timesheet.prompt';

@Injectable()
export class TimesheetExtractorService {

    constructor(private readonly ollama: OllamaProvider,) { }

    async extract(
        message: string,
    ) {

        const result = await this.ollama.generateJson(
            message,
            TIMESHEET_EXTRACTION_PROMPT,
        );

        return TimesheetExtractionSchema.parse(
            result,
        );
    }
}