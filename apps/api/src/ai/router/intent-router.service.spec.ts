import { Test, TestingModule } from '@nestjs/testing';
import { IntentRouterService } from './intent-router.service';
import { IntentService } from '../intent/intent.service';
import { TimesheetExtractorService } from '../extractor/timesheet-extractor.service';
import { LeaveExtractorService } from '../extractor/leave-extractor.service';
import { SubmitTimesheetTool } from '../../tools/timesheet/submit-timesheet.tool';
import { CreateLeaveRequestTool } from '../../tools/leave/create-leave-request.tool';
import { LeaveValidatorService } from '../validators/leave-validator.service';
import { TimesheetValidatorService } from '../validators/timesheet-validator.service';
import { ProjectValidationService } from '../validators/project-validation.service';
import { ConversationContextService } from '../context/conversation-context.service';
import { AuditService } from '../../audit/audit.service';
import { IntentType } from '../intent/intent.types';

describe('IntentRouterService - Audit Logging', () => {
  let routerService: IntentRouterService;
  let auditService: jest.Mocked<AuditService>;
  let intentService: jest.Mocked<IntentService>;
  let contextService: jest.Mocked<ConversationContextService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntentRouterService,
        {
          provide: IntentService,
          useValue: { classify: jest.fn() },
        },
        {
          provide: TimesheetExtractorService,
          useValue: { extract: jest.fn() },
        },
        {
          provide: LeaveExtractorService,
          useValue: { extract: jest.fn() },
        },
        {
          provide: SubmitTimesheetTool,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CreateLeaveRequestTool,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LeaveValidatorService,
          useValue: { validate: jest.fn() },
        },
        {
          provide: TimesheetValidatorService,
          useValue: { validate: jest.fn() },
        },
        {
          provide: ProjectValidationService,
          useValue: { validate: jest.fn() },
        },
        {
          provide: ConversationContextService,
          useValue: {
            getContext: jest.fn(),
            saveContext: jest.fn(),
            clearContext: jest.fn(),
            mergeData: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: { logInteraction: jest.fn() },
        },
      ],
    }).compile();

    routerService = module.get<IntentRouterService>(IntentRouterService);
    auditService = module.get(AuditService);
    intentService = module.get(IntentService);
    contextService = module.get(ConversationContextService);
  });

  it('should log an unsupported intent', async () => {
    contextService.getContext.mockResolvedValue(null);
    intentService.classify.mockResolvedValue({ intent: IntentType.UNKNOWN, confidence: 0.9 } as any);

    const result = await routerService.process('user-1', 'hello');

    expect(result.success).toBe(false);
    expect(auditService.logInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        message: 'hello',
        intent: IntentType.UNKNOWN,
        success: false,
      }),
    );
  });
});
