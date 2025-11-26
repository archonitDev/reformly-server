import { ApiProperty } from '@nestjs/swagger';
import { EquipmentResponseDto } from './equipment-response.dto';

export class WorkoutResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  programId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  thumbnailUrl?: string;

  @ApiProperty()
  videoUrl: string;

  @ApiProperty()
  duration: number; // minutes

  @ApiProperty()
  calories: number;

  @ApiProperty()
  isLiked: boolean;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty({ type: [EquipmentResponseDto] })
  equipment: EquipmentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}





