import { Module, forwardRef } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController, CommentLikesController } from './likes.controller';
import { LikesRepository } from './repos/likes.repository';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { NotificationsModule } from '@app/notifications/notifications.module';

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule)],
  controllers: [LikesController, CommentLikesController],
  providers: [LikesService, LikesRepository],
  exports: [LikesService, LikesRepository],
})
export class LikesModule {}

