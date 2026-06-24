import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendanceExtractionDto, AttendanceAction } from '../../ai/extractor/attendance.dto';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

@Injectable()
export class LogAttendanceTool {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, data: AttendanceExtractionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orgTimezone = user.organization?.timezone || 'Asia/Kolkata';

    // Current time in UTC
    const nowUtc = new Date();

    // Determine the current "Date" in the organization's timezone
    // e.g. If it is 03:45 UTC, it is 09:15 IST on 2026-06-24.
    const nowZoned = toZonedTime(nowUtc, orgTimezone);
    
    // Create a date object representing midnight in the local timezone, 
    // then convert back to UTC to use as our unique 'date' key in the database
    const localMidnight = new Date(
      nowZoned.getFullYear(),
      nowZoned.getMonth(),
      nowZoned.getDate(),
      0, 0, 0, 0
    );
    // Note: JS Date constructor assumes system local timezone. 
    // It's safer to format the string and parse it as UTC for the key.
    
    const dateString = `${nowZoned.getFullYear()}-${String(nowZoned.getMonth() + 1).padStart(2, '0')}-${String(nowZoned.getDate()).padStart(2, '0')}T00:00:00Z`;
    const attendanceDate = new Date(dateString);

    let record = await this.prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date: attendanceDate,
        },
      },
    });

    if (!record) {
      record = await this.prisma.attendanceRecord.create({
        data: {
          userId,
          date: attendanceDate,
          status: data.action === AttendanceAction.WFH ? 'WFH' : 'PRESENT',
        },
      });
    }

    if (data.action === AttendanceAction.WFH) {
      await this.prisma.attendanceRecord.update({
        where: { id: record.id },
        data: { status: 'WFH' },
      });
      return { success: true, message: 'Status updated to Work From Home for today.' };
    }

    const punchType = data.action === AttendanceAction.CLOCK_IN ? 'IN' : 'OUT';

    // Verify rules before punching
    const punches = await this.prisma.attendancePunch.findMany({
      where: { recordId: record.id },
      orderBy: { timestamp: 'desc' },
    });

    const lastPunch = punches[0];

    if (punchType === 'IN' && lastPunch?.type === 'IN') {
      return { success: false, requiresInput: true, question: 'You are already clocked in. Did you mean to clock out?' };
    }

    if (punchType === 'OUT' && (!lastPunch || lastPunch.type === 'OUT')) {
      return { success: false, requiresInput: true, question: 'You are not currently clocked in. Did you mean to clock in?' };
    }

    // Insert Punch (stored as UTC implicitly via default(now()))
    const punch = await this.prisma.attendancePunch.create({
      data: {
        recordId: record.id,
        type: punchType,
      },
    });

    return {
      success: true,
      message: `Successfully clocked ${punchType.toLowerCase()} at ${toZonedTime(punch.timestamp, orgTimezone).toLocaleTimeString('en-US', { timeZone: orgTimezone })}.`,
    };
  }
}
