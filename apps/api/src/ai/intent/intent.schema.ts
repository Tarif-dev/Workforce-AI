import { z } from 'zod';

export const TimesheetEntrySchema = z.object({
  project: z.string(),
  hours: z.number(),
});

export const IntentResponseSchema = z.object({
  intent: z.enum([
    'ATTENDANCE',
    'TIMESHEET_ENTRY',
    'LEAVE_REQUEST',
    'LEAVE_BALANCE_QUERY',
    'TIMESHEET_QUERY',
    'APPROVAL_QUERY',
    'GENERAL_QUERY',
    'HELP',
    'UNKNOWN',
  ]),

  confidence: z.number(),

  entries: z.array(TimesheetEntrySchema).optional(),

  extractedData: z.record(z.string(), z.unknown()).optional(),
});
