import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationSenderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastName: string;
}

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ type: NotificationSenderDto, required: false })
  sender?: NotificationSenderDto;

  @ApiProperty({ required: false })
  postId?: string;

  @ApiProperty({ required: false })
  commentId?: string;

  @ApiProperty()
  createdAt: Date;
}





