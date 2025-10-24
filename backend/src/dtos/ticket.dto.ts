import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateTicketDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  scheduleId: number;

  @IsInt()
  @IsNotEmpty()
  seatId: number;

  @IsInt()
  @Min(0)
  price: number;
}
