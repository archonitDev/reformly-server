import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';
import { WorkoutProgramResponseDto } from './dto/workout-program-response.dto';
import { WorkoutCategory } from '@prisma/client';

@Controller('programs')
@ApiBearerAuth()
@ApiTags('Workout Programs - V1')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workout programs with optional category filter' })
  @ApiResponse({
    status: 200,
    description: 'Programs retrieved successfully',
    type: [WorkoutProgramResponseDto],
  })
  @ApiQuery({ name: 'category', required: false, enum: WorkoutCategory })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  getPrograms(
    @GetCurrentUser() user: AuthUser,
    @Query('category') category?: WorkoutCategory,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.programsService.getPrograms(
      user.userId,
      category,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a program by ID with all workouts' })
  @ApiResponse({ status: 200, description: 'Program retrieved successfully' })
  getProgramById(@Param('id') id: string, @GetCurrentUser() user: AuthUser) {
    return this.programsService.getProgramById(id, user.userId);
  }
}

