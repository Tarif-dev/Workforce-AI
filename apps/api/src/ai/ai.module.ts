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
// import { AiTesterService } from './testing/ai-tester.service';
// import { AiTestingController } from './testing/ai-testing.controller';
import { ToolsModule } from 'src/tools/tools.module';
import { LeaveValidatorService } from './validators/leave-validator.service';
import { TimesheetValidatorService } from './validators/timesheet-validator.service';
import { ProjectValidationService } from './validators/project-validation.service';

@Module({
  imports: [
    ToolsModule,
  ],

  providers: [
    AiService,
    OllamaProvider,
    IntentService,
    TimesheetExtractorService,
    LeaveExtractorService,
    IntentRouterService,
    LeaveValidatorService,
    TimesheetValidatorService,
    ProjectValidationService,
    // AiTesterService
  ],

  exports: [
    AiService,
    OllamaProvider,
  ],

  controllers: [AiController,IntentController,ExtractorsController,RouterController,
    ],
})
export class AiModule {}