import { Injectable } from '@nestjs/common';
import { IntentService } from '../intent/intent.service';
import { IntentType } from '../intent/intent.types';
import { TimesheetExtractorService } from '../extractor/timesheet-extractor.service';
import { LeaveExtractorService } from '../extractor/leave-extractor.service';

@Injectable()
export class IntentRouterService {

    constructor(
        private readonly intentService:
            IntentService,

        private readonly timesheetExtractor:
            TimesheetExtractorService,

        private readonly leaveExtractor:
            LeaveExtractorService,
    ) { }

    async process(
        message: string,
    ) {

        const intentResult =
            await this.intentService.classify(
                message,
            );

        switch (
        intentResult.intent
        ) {

            case IntentType.TIMESHEET_ENTRY:

                return {
                    intent:
                        intentResult.intent,

                    confidence:
                        intentResult.confidence,

                    data:
                        await this.timesheetExtractor.extract(
                            message,
                        ),
                };

            case IntentType.LEAVE_REQUEST:

                return {
                    intent:
                        intentResult.intent,

                    confidence:
                        intentResult.confidence,

                    data:
                        await this.leaveExtractor.extract(
                            message,
                        ),
                };

            default:

                return {
                    intent:
                        intentResult.intent,

                    confidence:
                        intentResult.confidence,

                    data: null,
                };
        }
    }
}