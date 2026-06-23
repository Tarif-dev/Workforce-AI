import { z } from 'zod';

export const TimesheetEntrySchema = z.object({
  project: z.string(),

  hours: z.number(),
});

export const TimesheetExtractionSchema =
  z.object({
    entries: z.array(
      TimesheetEntrySchema,
    ),
  });

export type TimesheetExtraction =
  z.infer<
    typeof TimesheetExtractionSchema
  >;