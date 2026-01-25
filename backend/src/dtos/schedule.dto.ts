// src/schedules/dtos/schedule.dto.ts
import { IsInt, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ScheduleStatus } from '../models/Ticket';

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