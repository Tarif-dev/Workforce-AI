import { Injectable, Logger } from '@nestjs/common';
import { IntentService } from '../intent/intent.service';
import { IntentType } from '../intent/intent.types';
import { TimesheetExtractorService } from '../extractor/timesheet-extractor.service';
import { LeaveExtractorService } from '../extractor/leave-extractor.service';
import { SubmitTimesheetTool } from '../../tools/timesheet/submit-timesheet.tool';
import { CreateLeaveRequestTool } from '../../tools/leave/create-leave-request.tool';
import { LeaveValidatorService } from '../validators/leave-validator.service';
import { TimesheetValidatorService } from '../validators/timesheet-validator.service';
import { ProjectValidationService } from '../validators/project-validation.service';
import { ConversationContextService } from '../context/conversation-context.service';
import { AuditService, AuditInteraction } from '../../audit/audit.service';
import { AttendanceExtractorService } from '../extractor/attendance-extractor.service';
import { AttendanceValidatorService } from '../validators/attendance-validator.service';
import { LogAttendanceTool } from '../../tools/attendance/log-attendance.tool';

export interface RouterResponse {
  success: boolean;
  requiresInput?: boolean;
  question?: string;
  intent?: string;
  confidence?: number;
  message?: string;
  [key: string]: unknown;
}

@Injectable()
export class IntentRouterService {
  private readonly logger = new Logger(IntentRouterService.name);

  constructor(
    private readonly intentService: IntentService,
    private readonly timesheetExtractor: TimesheetExtractorService,
    private readonly leaveExtractor: LeaveExtractorService,
    private readonly submitTimesheet: SubmitTimesheetTool,
    private readonly createLeaveRequest: CreateLeaveRequestTool,
    private readonly leaveValidator: LeaveValidatorService,
    private readonly timesheetValidator: TimesheetValidatorService,
    private readonly projectValidator: ProjectValidationService,
    private readonly contextService: ConversationContextService,
    private readonly auditService: AuditService,
    private readonly attendanceExtractor: AttendanceExtractorService,
    private readonly attendanceValidator: AttendanceValidatorService,
    private readonly logAttendanceTool: LogAttendanceTool,
  ) {}

  async process(userId: string, message: string): Promise<RouterResponse> {
    let response: RouterResponse | null = null;
    const auditData: AuditInteraction = {
      userId,
      message,
      contextUsed: false,
      success: false,
    };

    try {
      const context = await this.contextService.getContext(userId);
      let currentIntent: string;

      const intentResult = await this.intentService.classify(message);

      if (context) {
        auditData.contextUsed = true;
        const switchableIntents = [
          IntentType.TIMESHEET_ENTRY,
          IntentType.LEAVE_REQUEST,
          IntentType.ATTENDANCE,
        ];

        if (
          switchableIntents.includes(intentResult.intent as IntentType) &&
          intentResult.intent !== context.intent &&
          intentResult.confidence > 0.8
        ) {
          // User switched intent explicitly to a different actionable flow
          await this.contextService.clearContext(userId);
          currentIntent = intentResult.intent;
          auditData.contextUsed = false; // They switched out of context
        } else {
          // User is answering a question or continuing flow
          currentIntent = context.intent;
        }
      } else {
        currentIntent = intentResult.intent;
      }

      auditData.intent = currentIntent;

      switch (currentIntent) {
        case IntentType.TIMESHEET_ENTRY: {
          const extracted = await this.timesheetExtractor.extract(message);

          const dataToValidate =
            context && context.intent === IntentType.TIMESHEET_ENTRY
              ? this.contextService.mergeData(context.extractedData, extracted)
              : extracted;

          auditData.extractedData = dataToValidate;

          const validation =
            await this.timesheetValidator.validate(dataToValidate);

          if (validation.needsClarification) {
            await this.contextService.saveContext(
              userId,
              IntentType.TIMESHEET_ENTRY,
              dataToValidate,
              validation.question,
            );
            auditData.validationData = { question: validation.question };
            response = {
              success: false,
              requiresInput: true,
              question: validation.question,
            };
            break;
          }

          const projectValidation = await this.projectValidator.validate(
            userId,
            validation.data!.entries!,
          );

          if (projectValidation.needsClarification) {
            await this.contextService.saveContext(
              userId,
              IntentType.TIMESHEET_ENTRY,
              dataToValidate,
              projectValidation.question,
            );
            auditData.validationData = { question: projectValidation.question };
            response = {
              success: false,
              requiresInput: true,
              question: projectValidation.question,
            };
            break;
          }

          auditData.toolName = 'SubmitTimesheetTool';
          const result = await this.submitTimesheet.execute(
            userId,
            projectValidation.data!,
          );

          auditData.toolResult = result;
          await this.contextService.clearContext(userId);
          response = result;
          break;
        }

        case IntentType.LEAVE_REQUEST: {
          const extracted = await this.leaveExtractor.extract(message);

          const dataToValidate =
            context && context.intent === IntentType.LEAVE_REQUEST
              ? this.contextService.mergeData(context.extractedData, extracted)
              : extracted;

          auditData.extractedData = dataToValidate;

          const validation = await this.leaveValidator.validate(dataToValidate);

          if (validation.needsClarification) {
            await this.contextService.saveContext(
              userId,
              IntentType.LEAVE_REQUEST,
              dataToValidate,
              validation.question,
            );
            auditData.validationData = { question: validation.question };
            response = {
              success: false,
              requiresInput: true,
              question: validation.question,
            };
            break;
          }

          auditData.toolName = 'CreateLeaveRequestTool';
          const result = await this.createLeaveRequest.execute(
            userId,
            validation.data!,
          );

          auditData.toolResult = result;
          await this.contextService.clearContext(userId);
          response = result;
          break;
        }

        case IntentType.ATTENDANCE: {
          const extracted = await this.attendanceExtractor.extract(message);

          const dataToValidate =
            context && context.intent === IntentType.ATTENDANCE
              ? this.contextService.mergeData(context.extractedData, extracted)
              : extracted;

          auditData.extractedData = dataToValidate;

          const validation = await this.attendanceValidator.validate(
            userId,
            dataToValidate,
          );

          if (validation.needsClarification) {
            await this.contextService.saveContext(
              userId,
              IntentType.ATTENDANCE,
              dataToValidate,
              validation.question,
            );
            auditData.validationData = { question: validation.question };
            response = {
              success: false,
              requiresInput: true,
              question: validation.question,
            };
            break;
          }

          auditData.toolName = 'LogAttendanceTool';
          const result = await this.logAttendanceTool.execute(
            userId,
            validation.data!,
          );

          auditData.toolResult = result;
          await this.contextService.clearContext(userId);
          response = result;
          break;
        }

        default:
          response = {
            success: false,
            intent: intentResult.intent,
            confidence: intentResult.confidence,
            message: 'Unsupported intent',
          };
          break;
      }

      auditData.success = response.success === true;
    } catch (error) {
      this.logger.error(`Error in process: ${error.message}`, error.stack);
      auditData.error = error.message;
      auditData.success = false;
      response = { success: false, error: 'Internal server error' };
    } finally {
      await this.auditService.logInteraction(auditData);
    }

    return response;
  }
}
