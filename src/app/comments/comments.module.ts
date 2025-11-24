import { Module, forwardRef } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './repos/comments.repository';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { NotificationsModule } from '@app/notifications/notifications.module';
import { LikesModule } from '@app/likes/likes.module';

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule), forwardRef(() => LikesModule)],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService, CommentsRepository],
})
export class CommentsModule {}

