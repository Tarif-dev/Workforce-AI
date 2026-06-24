import { Injectable } from '@nestjs/common';

import { ValidationResult } from './validation-result.interface';
import { LeaveExtractionDto } from '../extractor/leave.dto';

@Injectable()
export class LeaveValidatorService {
  async validate(
    data: Partial<LeaveExtractionDto>,
  ): Promise<ValidationResult<LeaveExtractionDto>> {
    const leaveType = data.leaveType?.toUpperCase();

    const validLeaveTypes = ['SICK', 'CASUAL', 'EARNED', 'UNPAID'];

    if (!leaveType || !validLeaveTypes.includes(leaveType)) {
      return {
        valid: false,

        needsClarification: true,

        question:
          'What type of leave would you like? Sick, Casual, Earned or Unpaid?',
      };
    }

    if (!data.startDate) {
      return {
        valid: false,

        needsClarification: true,

        question: 'What date would you like to take leave on?',
      };
    }

    const startDate = new Date(data.startDate);

    const endDate = data.endDate ? new Date(data.endDate) : startDate;

    if (isNaN(startDate.getTime())) {
      return {
        valid: false,

        needsClarification: true,

        question: 'Please provide a valid start date.',
      };
    }

    if (isNaN(endDate.getTime())) {
      return {
        valid: false,

        needsClarification: true,

        question: 'Please provide a valid end date.',
      };
    }

    if (endDate < startDate) {
      return {
        valid: false,

        needsClarification: true,

        question: 'End date cannot be before start date.',
      };
    }

    return {
      valid: true,

      needsClarification: false,

      data: {
        ...data,

        leaveType,

        endDate: data.endDate ?? data.startDate,
      },
    };
  }
}
