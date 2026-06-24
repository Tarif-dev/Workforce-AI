import { z } from 'zod';

export const LeaveExtractionSchema =
  z.object({
    leaveType:
      z.string()
        .nullable()
        .optional(),

    startDate:
      z.string()
        .nullable()
        .optional(),

    endDate:
      z.string()
        .nullable()
        .optional(),

    reason:
      z.string()
        .nullable()
        .optional(),
  });

export type LeaveExtraction =
  z.infer<
    typeof LeaveExtractionSchema
  >;