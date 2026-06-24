import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TimesheetEntryDto {
  @IsString()
  @IsOptional()
  project?: string | null;

  @IsNumber()
  @IsOptional()
  hours?: number | null;
}

export class TimesheetExtractionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimesheetEntryDto)
  @IsOptional()
  entries?: TimesheetEntryDto[];
}
