import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';
import { LeaderboardPeriodType } from './types/leaderboard-period.type';

@ApiTags('Community Leaderboard - V1')
@ApiBearerAuth()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get leaderboard (last 30 days or all time)' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Leaderboard period: last_30_days or all_time',
    example: 'last_30_days',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  getLeaderboard(
    @Query('period') period?: LeaderboardPeriodType,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard(period, limit ? +limit : 20);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user points, level, and levels overview' })
  @ApiResponse({ status: 200, description: 'User points overview retrieved successfully' })
  getMyOverview(@GetCurrentUser() user: AuthUser) {
    return this.leaderboardService.getUserOverview(user.userId);
  }
}





