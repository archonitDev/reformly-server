import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '@libs/prisma/prisma.service';
import { UsersRepository } from './repos/users.repository';
import { StorageModule } from '@libs/storage/storage.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PrismaService],
  exports: [UsersService, UsersRepository],
  imports: [StorageModule],
})
export class UsersModule {}
