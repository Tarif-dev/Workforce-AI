import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AttendanceAction {
  CLOCK_IN = 'CLOCK_IN',
  CLOCK_OUT = 'CLOCK_OUT',
  WFH = 'WFH',
}

export class AttendanceExtractionDto {
  @IsEnum(AttendanceAction)
  action: AttendanceAction;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  date?: string;
}
