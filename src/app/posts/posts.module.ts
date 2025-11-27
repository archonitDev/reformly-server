import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './repos/posts.repository';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { StorageModule } from '@libs/storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
  exports: [PostsService, PostsRepository],
})
export class PostsModule {}







