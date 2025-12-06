import { IsInt, IsString, Min, Max, IsOptional } from 'class-validator';

export class UpdateReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;

    @IsString()
    @IsOptional()
    comment?: string;

    @IsOptional()
    @IsString({ each: true })
    images?: string[];
}
