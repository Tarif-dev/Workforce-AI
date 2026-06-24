import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { TimesheetEntryDto } from '../../ai/extractor/timesheet.dto';

@Injectable()
export class SubmitTimesheetTool {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    data: { entries: (TimesheetEntryDto & { projectId: string })[] },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orgTimezone = user.organization?.timezone || 'Asia/Kolkata';
    const nowUtc = new Date();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { toZonedTime } = require('date-fns-tz');
    const nowZoned = toZonedTime(nowUtc, orgTimezone);

    const dateString = `${nowZoned.getFullYear()}-${String(nowZoned.getMonth() + 1).padStart(2, '0')}-${String(nowZoned.getDate()).padStart(2, '0')}T00:00:00Z`;
    const today = new Date(dateString);

    const timesheet = await this.prisma.timesheet.upsert({
      where: {
        userId_workDate: {
          userId,
          workDate: today,
        },
      },

      update: {},

      create: {
        userId,
        workDate: today,
      },

      include: {
        entries: true,
      },
    });

    // Calculate all existing hours logged today
    const existingHours = timesheet.entries.reduce(
      (sum, entry) => sum + entry.hours,
      0,
    );

    // Calculate new hours being submitted
    const newHours = data.entries.reduce(
      (sum: number, entry: TimesheetEntryDto) => sum + entry.hours!,
      0,
    );

    // Attendance Duration Cross-Check
    const attendanceRecord = await this.prisma.attendanceRecord.findUnique({
      where: { userId_date: { userId, date: today } },
      include: { punches: { orderBy: { timestamp: 'asc' } } }
    });

    let maxAllowedHours = 0;

    if (attendanceRecord) {
      if (attendanceRecord.status === 'WFH') {
        maxAllowedHours = 24; 
      } else {
        let totalMs = 0;
        let lastIn: Date | null = null;

        for (const p of attendanceRecord.punches) {
          if (p.type === 'IN') {
            lastIn = p.timestamp;
          } else if (p.type === 'OUT' && lastIn) {
            totalMs += p.timestamp.getTime() - lastIn.getTime();
            lastIn = null;
          }
        }

        if (lastIn) {
          totalMs += nowUtc.getTime() - lastIn.getTime();
        }

        maxAllowedHours = totalMs / (1000 * 60 * 60);
      }
    }

    const requestedTotalHours = existingHours + newHours;

    if (requestedTotalHours > maxAllowedHours) {
      const roundedMax = Math.round(maxAllowedHours * 10) / 10;
      return {
        success: false,
        requiresInput: true,
        question: `You have only been clocked in for ${roundedMax} hours today. You cannot log ${requestedTotalHours} hours of work. Please adjust your timesheet or check your attendance.`,
      };
    }

    for (const entry of data.entries) {
      // Defensive check: validator must have resolved projectId
      if (!entry.projectId) {
        throw new Error(
          `Project mapping failed for '${entry.project}'. This should have been caught by validation.`,
        );
      }

      // Find existing entry for this project on this timesheet
      const existingEntry = await this.prisma.timesheetEntry.findFirst({
        where: {
          timesheetId: timesheet.id,

          projectId: entry.projectId,
        },
      });

      if (existingEntry) {
        // Add hours to existing entry
        await this.prisma.timesheetEntry.update({
          where: {
            id: existingEntry.id,
          },

          data: {
            hours: existingEntry.hours + entry.hours!,
          },
        });
      } else {
        // Create new entry
        await this.prisma.timesheetEntry.create({
          data: {
            timesheetId: timesheet.id,

            projectId: entry.projectId,

            description: entry.project,

            hours: entry.hours!,
          },
        });
      }
    }

    // Recalculate totalHours from all entries (not increment — prevents drift)
    const allEntries = await this.prisma.timesheetEntry.findMany({
      where: {
        timesheetId: timesheet.id,
      },
    });

    const recalculatedTotal = allEntries.reduce((sum, e) => sum + e.hours, 0);

    await this.prisma.timesheet.update({
      where: {
        id: timesheet.id,
      },

      data: {
        totalHours: recalculatedTotal,
      },
    });

    const savedTimesheet = await this.prisma.timesheet.findUnique({
      where: {
        id: timesheet.id,
      },

      include: {
        entries: true,
      },
    });

    return {
      success: true,

      message: 'Timesheet submitted successfully',

      timesheet: savedTimesheet,
    };
  }
}
