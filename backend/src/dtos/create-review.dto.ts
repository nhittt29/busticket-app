import { IsInt, IsString, Min, Max, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @IsNotEmpty()
    ticketId: number;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsOptional()
    comment?: string;

    @IsOptional()
    @IsString({ each: true })
    images?: string[];
}
