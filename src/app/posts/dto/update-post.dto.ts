import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({
    description: 'Post content',
    example: 'Just completed my first workout! Feeling amazing! 💪',
    maxLength: 5000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiProperty({
    description: 'Optional image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}







