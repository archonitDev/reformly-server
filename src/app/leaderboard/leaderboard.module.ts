import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { LeaderboardRepository } from './repos/leaderboard.repository';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardRepository],
  exports: [LeaderboardService, LeaderboardRepository],
})
export class LeaderboardModule {}


