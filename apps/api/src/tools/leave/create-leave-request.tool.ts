import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { LeaveExtractionDto } from '../../ai/extractor/leave.dto';
import { LeaveType } from '@prisma/client';

@Injectable()
export class CreateLeaveRequestTool {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, data: LeaveExtractionDto) {
    const startDate = new Date(data.startDate!);

    const endDate = data.endDate ? new Date(data.endDate!) : startDate;

    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid start date');
    }

    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid end date');
    }

    const leave = await this.prisma.leaveRequest.create({
      data: {
        userId,

        leaveType: data.leaveType as LeaveType,

        startDate,

        endDate,

        reason: data.reason,
      },
    });

    return {
      success: true,
      leave,
    };
  }
}
