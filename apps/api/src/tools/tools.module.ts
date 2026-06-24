import { Module } from '@nestjs/common';
import { SubmitTimesheetTool } from './timesheet/submit-timesheet.tool';
import { CreateLeaveRequestTool } from './leave/create-leave-request.tool';

import { LogAttendanceTool } from './attendance/log-attendance.tool';

@Module({
  providers: [SubmitTimesheetTool, CreateLeaveRequestTool, LogAttendanceTool],

  exports: [SubmitTimesheetTool, CreateLeaveRequestTool, LogAttendanceTool],
})
export class ToolsModule {}
