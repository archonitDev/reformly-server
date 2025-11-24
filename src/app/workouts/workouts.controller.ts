import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';
import { WorkoutResponseDto } from './dto/workout-response.dto';

@Controller('workouts')
@ApiBearerAuth()
@ApiTags('Workouts - V1')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a workout by ID' })
  @ApiResponse({ status: 200, description: 'Workout retrieved successfully', type: WorkoutResponseDto })
  getWorkoutById(@Param('id') id: string, @GetCurrentUser() user: AuthUser) {
    return this.workoutsService.getWorkoutById(id, user.userId);
  }

  @Get('liked')
  @ApiOperation({ summary: 'Get user\'s liked/favorited workouts' })
  @ApiResponse({
    status: 200,
    description: 'Liked workouts retrieved successfully',
    type: [WorkoutResponseDto],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  getLikedWorkouts(
    @GetCurrentUser() user: AuthUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.workoutsService.getLikedWorkouts(user.userId, page ? +page : 1, limit ? +limit : 20);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a workout (like/unlike)' })
  @ApiResponse({ status: 200, description: 'Like toggled successfully' })
  toggleWorkoutLike(@Param('id') id: string, @GetCurrentUser() user: AuthUser) {
    return this.workoutsService.toggleWorkoutLike(id, user.userId);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a workout as complete' })
  @ApiResponse({ status: 200, description: 'Workout marked as complete' })
  completeWorkout(
    @Param('id') id: string,
    @GetCurrentUser() user: AuthUser,
  ) {
    return this.workoutsService.completeWorkout(id, user.userId);
  }
}

