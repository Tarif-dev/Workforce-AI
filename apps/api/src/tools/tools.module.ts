import { Module } from '@nestjs/common';
import { SubmitTimesheetTool } from './timesheet/submit-timesheet.tool';
import { CreateLeaveRequestTool } from './leave/create-leave-request.tool';

@Module({
  providers: [
    SubmitTimesheetTool,
    CreateLeaveRequestTool,
  ],

  exports: [
    SubmitTimesheetTool,
    CreateLeaveRequestTool,
  ],
})
export class ToolsModule {}