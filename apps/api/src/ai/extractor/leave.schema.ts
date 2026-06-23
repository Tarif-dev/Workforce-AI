import { z } from 'zod';

export const LeaveExtractionSchema = z.object({
  leaveType: z.string(),

  startDate: z.string(),

  endDate: z.string().optional(),

  reason: z.string().optional(),
});

export type LeaveExtraction =
  z.infer<typeof LeaveExtractionSchema>;