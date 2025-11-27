import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';

export class CompleteWorkoutDto {
  @ApiProperty({
    description: 'Duration watched in seconds (defaults to 0)',
    example: 600,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  watchedDuration?: number;
}






