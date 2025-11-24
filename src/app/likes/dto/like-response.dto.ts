import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  postId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;
}


