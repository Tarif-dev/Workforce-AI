import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreateLeaveRequestTool {

    constructor(
        private readonly prisma:
            PrismaService,
    ) { }

    async execute(
        userId: string,
        data: any,
    ) {

        const startDate =
            new Date(
                data.startDate,
            );

        const endDate =
            data.endDate
                ? new Date(
                    data.endDate,
                )
                : startDate;

        if (
            isNaN(
                startDate.getTime(),
            )
        ) {
            throw new Error(
                'Invalid start date',
            );
        }

        if (
            isNaN(
                endDate.getTime(),
            )
        ) {
            throw new Error(
                'Invalid end date',
            );
        }

        const leave =
            await this.prisma.leaveRequest.create({
                data: {
                    userId,

                    leaveType:
                        data.leaveType,

                    startDate,

                    endDate,

                    reason:
                        data.reason,
                },
            });

        return {
            success: true,
            leave,
        };
    }
}