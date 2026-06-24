import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubmitTimesheetTool {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    userId: string,
    data: any,
  ) {

    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0,
    );

    const timesheet =
      await this.prisma.timesheet.upsert({
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
    const existingHours =
      timesheet.entries.reduce(
        (sum, entry) => sum + entry.hours,
        0,
      );

    // Calculate new hours being submitted
    const newHours =
      data.entries.reduce(
        (sum: number, entry: any) =>
          sum + entry.hours,
        0,
      );

    // Daily total guard: existing + new must not exceed 24
    if (existingHours + newHours > 24) {
      return {
        success: false,

        requiresInput: true,

        question:
          `You already have ${existingHours} hours logged today. Adding ${newHours} hours would make ${existingHours + newHours}. Total daily hours cannot exceed 24.`,
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
      const existingEntry =
        await this.prisma.timesheetEntry.findFirst({
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
            hours:
              existingEntry.hours + entry.hours,
          },
        });
      } else {
        // Create new entry
        await this.prisma.timesheetEntry.create({
          data: {
            timesheetId:
              timesheet.id,

            projectId:
              entry.projectId,

            description:
              entry.project,

            hours:
              entry.hours,
          },
        });
      }
    }

    // Recalculate totalHours from all entries (not increment — prevents drift)
    const allEntries =
      await this.prisma.timesheetEntry.findMany({
        where: {
          timesheetId: timesheet.id,
        },
      });

    const recalculatedTotal =
      allEntries.reduce(
        (sum, e) => sum + e.hours,
        0,
      );

    await this.prisma.timesheet.update({
      where: {
        id: timesheet.id,
      },

      data: {
        totalHours: recalculatedTotal,
      },
    });

    const savedTimesheet =
      await this.prisma.timesheet.findUnique({
        where: {
          id: timesheet.id,
        },

        include: {
          entries: true,
        },
      });

    return {
      success: true,

      message:
        'Timesheet submitted successfully',

      timesheet:
        savedTimesheet,
    };
  }
}