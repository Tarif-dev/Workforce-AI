import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { ValidationResult } from './validation-result.interface';
import { TimesheetEntryDto } from '../extractor/timesheet.dto';

@Injectable()
export class ProjectValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    userId: string,
    entries: TimesheetEntryDto[],
  ): Promise<
    ValidationResult<{ entries: (TimesheetEntryDto & { projectId: string })[] }>
  > {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return {
        valid: false,

        needsClarification: true,

        question: 'User not found.',
      };
    }

    const resolvedEntries: (TimesheetEntryDto & { projectId: string })[] = [];

    for (const entry of entries) {
      const project = await this.prisma.project.findFirst({
        where: {
          organizationId: user.organizationId ?? undefined,

          OR: [
            {
              code: {
                equals: entry.project || undefined,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: entry.project || undefined,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      if (!project) {
        const availableProjects = await this.prisma.project.findMany({
          where: {
            organizationId: user.organizationId ?? undefined,

            status: 'ACTIVE',
          },

          select: {
            name: true,
          },
        });

        const projectNames = availableProjects.map((p) => p.name).join(', ');

        const hint = projectNames
          ? ` Please choose one of: ${projectNames}.`
          : '';

        return {
          valid: false,

          needsClarification: true,

          question: `I couldn't find project '${entry.project}'.${hint}`,
        };
      }

      resolvedEntries.push({
        ...entry,

        projectId: project.id,
      });
    }

    return {
      valid: true,

      needsClarification: false,

      data: {
        entries: resolvedEntries,
      },
    };
  }
}
