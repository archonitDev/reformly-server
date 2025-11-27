
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Great progress! Keep it up! 💪',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: Express.Multer.File;
}