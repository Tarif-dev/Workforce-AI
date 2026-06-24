import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationResult } from './validation-result.interface';
import { AttendanceExtractionDto } from '../extractor/attendance.dto';

@Injectable()
export class AttendanceValidatorService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    userId: string,
    data: Partial<AttendanceExtractionDto>,
  ): Promise<ValidationResult<AttendanceExtractionDto>> {
    if (!data.action) {
      return {
        valid: false,
        needsClarification: true,
        question: 'What attendance action would you like to perform? (Clock In, Clock Out, Work From Home)',
      };
    }

    return {
      valid: true,
      needsClarification: false,
      data: data as AttendanceExtractionDto,
    };
  }
}
