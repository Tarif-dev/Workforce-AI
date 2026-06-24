import { Injectable } from '@nestjs/common';

import { ValidationResult } from './validation-result.interface';
import { TimesheetExtractionDto } from '../extractor/timesheet.dto';

@Injectable()
export class TimesheetValidatorService {
  async validate(
    data: Partial<TimesheetExtractionDto>,
  ): Promise<ValidationResult<TimesheetExtractionDto>> {
    // Rule 1: Entries must exist and be non-empty
    if (
      !data.entries ||
      !Array.isArray(data.entries) ||
      data.entries.length === 0
    ) {
      return {
        valid: false,

        needsClarification: true,

        question: 'Please provide your work entries.',
      };
    }

    // Validate each entry individually
    for (const entry of data.entries) {
      // Rule 2: Project must be present
      if (!entry.project || entry.project.trim() === '') {
        return {
          valid: false,

          needsClarification: true,

          question: 'Which project did you work on?',
        };
      }

      // Rule 3: Hours must be present
      if (entry.hours === null || entry.hours === undefined) {
        return {
          valid: false,

          needsClarification: true,

          question: `How many hours did you spend on ${entry.project}?`,
        };
      }

      // Rule 4: Hours must be greater than zero
      if (entry.hours <= 0) {
        return {
          valid: false,

          needsClarification: true,

          question: 'Hours must be greater than zero.',
        };
      }

      // Rule 5: Single entry hours <= 24
      if (entry.hours > 24) {
        return {
          valid: false,

          needsClarification: true,

          question: 'A single entry cannot exceed 24 hours.',
        };
      }
    }

    // Rule 7: Round hours to max 2 decimal places
    const roundedEntries = data.entries.map((entry: any) => ({
      ...entry,

      hours: Math.round(entry.hours * 100) / 100,
    }));

    // Rule 6: Total daily hours <= 24
    const totalHours = roundedEntries.reduce(
      (sum: number, entry: any) => sum + entry.hours,
      0,
    );

    if (totalHours > 24) {
      return {
        valid: false,

        needsClarification: true,

        question: `Total daily hours cannot exceed 24. Current total: ${totalHours}.`,
      };
    }

    return {
      valid: true,

      needsClarification: false,

      data: {
        entries: roundedEntries,
      },
    };
  }
}
