import { ApiProperty } from '@nestjs/swagger';

export class CommentAuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  postId: string;

  @ApiProperty({ required: false })
  parentCommentId?: string;

  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  isLikedByCurrentUser: boolean;

  @ApiProperty({ type: CommentAuthorDto })
  author: CommentAuthorDto;

  @ApiProperty({ type: [CommentResponseDto], required: false })
  replies?: CommentResponseDto[];

  @ApiProperty()
  repliesCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

