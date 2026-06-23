import { z } from 'zod';

export const TimesheetEntrySchema =
  z.object({
    project: z.string(),
    hours: z.number(),
  });

export const IntentResponseSchema =
  z.object({
    intent: z.string(),

    confidence: z.number(),

    entries: z
      .array(TimesheetEntrySchema)
      .optional(),

    extractedData: z
      .record(
        z.string(),
        z.unknown(),
      )
      .optional(),
  });