import { IsOptional, IsString } from 'class-validator';

export class LeaveExtractionDto {
  @IsString()
  @IsOptional()
  leaveType?: string | null;

  @IsString()
  @IsOptional()
  startDate?: string | null;

  @IsString()
  @IsOptional()
  endDate?: string | null;

  @IsString()
  @IsOptional()
  reason?: string | null;
}
