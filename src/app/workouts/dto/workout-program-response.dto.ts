import { ApiProperty } from '@nestjs/swagger';
import { WorkoutCategory } from '@prisma/client';

export class WorkoutProgramResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: WorkoutCategory })
  category: WorkoutCategory;

  @ApiProperty({ required: false })
  thumbnailUrl?: string;

  @ApiProperty()
  workoutCount: number;

  @ApiProperty()
  completedWorkouts: number;

  @ApiProperty()
  progressPercentage: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}


