import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OllamaProvider } from './providers/ollama.provider';
import { AiController } from './ai.controller';
import { IntentService } from './intent/intent.service';
import { IntentController } from './intent/intent.controller';
import { TimesheetExtractorService } from './extractor/timesheet-extractor.service';
import { ExtractorsController } from './extractor/extractors.controller';
import { LeaveExtractorService } from './extractor/leave-extractor.service';
import { IntentRouterService } from './router/intent-router.service';
import { RouterController } from './router/router.controller';

@Module({
  providers: [
    AiService,
    OllamaProvider,
    IntentService,
    TimesheetExtractorService,
    LeaveExtractorService,
    IntentRouterService
  ],

  exports: [
    AiService,
    OllamaProvider,
  ],

  controllers: [AiController,IntentController,ExtractorsController,RouterController],
})
export class AiModule {}