import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './repos/notifications.repository';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}







