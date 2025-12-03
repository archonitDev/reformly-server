import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './repos/posts.repository';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { StorageModule } from '@libs/storage/storage.module';
import { NotificationsModule } from '@app/notifications/notifications.module';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [PrismaModule, StorageModule, NotificationsModule, UsersModule],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
  exports: [PostsService, PostsRepository],
})
export class PostsModule {}







