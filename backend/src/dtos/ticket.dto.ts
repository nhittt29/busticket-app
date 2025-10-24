import { IsInt, IsNotEmpty } from 'class-validator';

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
  @IsNotEmpty()
  price: number;
}
