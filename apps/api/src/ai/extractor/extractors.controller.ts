import {
    Body,
    Controller,
    Post,
} from '@nestjs/common';

import { TimesheetExtractorService } from './timesheet-extractor.service';
import { LeaveExtractorService } from './leave-extractor.service';

@Controller('extractors')
export class ExtractorsController {

    constructor(
        private readonly timesheetExtractor: TimesheetExtractorService,
        private readonly leaveExtractor:LeaveExtractorService
    ) { }

    @Post('timesheet')
    async timesheet(
        @Body()
        body: {
            message: string;
        },
    ) {

        return this.timesheetExtractor.extract(
            body.message,
        );
    }

    @Post('leave')
    async leave(
        @Body()
        body: {
            message: string;
        },
    ) {

        return this.leaveExtractor.extract(
            body.message,
        );
    }
}