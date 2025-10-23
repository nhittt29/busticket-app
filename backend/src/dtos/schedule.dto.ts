import { IsInt, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ScheduleStatus } from '@prisma/client';

export class CreateScheduleDto {
  @IsInt()
  busId: number;

  @IsInt()
  routeId: number;

  @IsDateString()
  departureAt: string;

  @IsDateString()
  arrivalAt: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
