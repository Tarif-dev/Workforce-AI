
import { Injectable } from '@nestjs/common';
import { IntentService } from '../intent/intent.service';
import { IntentType } from '../intent/intent.types';
import { TimesheetExtractorService } from '../extractor/timesheet-extractor.service';
import { LeaveExtractorService } from '../extractor/leave-extractor.service';
import { SubmitTimesheetTool } from 'src/tools/timesheet/submit-timesheet.tool';
import { CreateLeaveRequestTool } from 'src/tools/leave/create-leave-request.tool';
import { LeaveValidatorService } from '../validators/leave-validator.service';
import { TimesheetValidatorService } from '../validators/timesheet-validator.service';
import { ProjectValidationService } from '../validators/project-validation.service';

@Injectable()
export class IntentRouterService {

  constructor(
    private readonly intentService:
      IntentService,

    private readonly timesheetExtractor:
      TimesheetExtractorService,

    private readonly leaveExtractor:
      LeaveExtractorService,

    private readonly submitTimesheet:
      SubmitTimesheetTool,

    private readonly createLeaveRequest:
      CreateLeaveRequestTool,

    private readonly leaveValidator:
      LeaveValidatorService,

    private readonly timesheetValidator:
      TimesheetValidatorService,

    private readonly projectValidator:
      ProjectValidationService,
  ) { }

  async process(
    userId: string,
    message: string,
  ) {

    const intentResult =
      await this.intentService.classify(
        message,
      );

    switch (
    intentResult.intent
    ) {

      case IntentType.TIMESHEET_ENTRY: {

        const extracted =
          await this.timesheetExtractor.extract(
            message,
          );

        const validation =
          await this.timesheetValidator.validate(
            extracted,
          );

        if (
          validation.needsClarification
        ) {
          return {
            success: false,

            requiresInput: true,

            question:
              validation.question,
          };
        }

        const projectValidation =
          await this.projectValidator.validate(
            userId,
            validation.data.entries,
          );

        if (
          projectValidation.needsClarification
        ) {
          return {
            success: false,

            requiresInput: true,

            question:
              projectValidation.question,
          };
        }

        return this.submitTimesheet.execute(
          userId,
          projectValidation.data,
        );
      }

      case IntentType.LEAVE_REQUEST: {

        const extracted =
          await this.leaveExtractor.extract(
            message,
          );

        console.log(
          'LEAVE EXTRACTED',
          extracted,
        );

        const validation =
          await this.leaveValidator.validate(
            extracted,
          );

        if (
          validation.needsClarification
        ) {
          return {
            success: false,

            requiresInput: true,

            question:
              validation.question,
          };
        }

        return this.createLeaveRequest.execute(
          userId,
          validation.data,
        );
      }

      default:

        return {
          success: false,

          intent:
            intentResult.intent,

          confidence:
            intentResult.confidence,

          message:
            'Unsupported intent',
        };
    }
  }
}
