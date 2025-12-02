import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkoutProgramsRepository } from './repos/workout-programs.repository';
import { WorkoutCompletionsRepository } from '@app/workouts/repos/workout-completions.repository';
import { WorkoutsRepository } from '@app/workouts/repos/workouts.repository';
import { WorkoutLikesRepository } from '@app/workouts/repos/workout-likes.repository';
import { WorkoutProgramResponseDto } from './dto/workout-program-response.dto';
import { WorkoutCategory } from '@prisma/client';

@Injectable()
export class ProgramsService {
  constructor(
    private workoutProgramsRepository: WorkoutProgramsRepository,
    private workoutCompletionsRepository: WorkoutCompletionsRepository,
    private workoutsRepository: WorkoutsRepository,
    private workoutLikesRepository: WorkoutLikesRepository,
  ) {}

  async getPrograms(
    userId: string,
    category?: WorkoutCategory,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    programs: WorkoutProgramResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (category && category !== WorkoutCategory.ALL) {
      where.category = category;
    }

    const [programs, total] = await Promise.all([
      this.workoutProgramsRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.workoutProgramsRepository.count(where),
    ]);

    const programsWithProgress = await Promise.all(
      programs.map(async (program) => {

        // Count the amount of workouts COMPLETED by the user for the program
        const completedWorkouts =
          await this.workoutCompletionsRepository.countAmountByProgramId(
            program.id,
            userId,
          );
        
        const workoutCount = program._count.workouts;

        const progressPercentage =
          workoutCount > 0
            ? Math.round((completedWorkouts / workoutCount) * 100)
            : 0;

        const { _count, ...programWithoutCount} = program;
        return {
          ...programWithoutCount,
          workoutCount,
          completedWorkouts,
          progressPercentage,
        };
      }),
    );

    return {
      programs: programsWithProgress,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProgramById(programId: string, userId: string) {
    const program = await this.workoutProgramsRepository.findById(programId);
    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const workouts = await this.workoutsRepository.findByProgramId(programId);

    const completedWorkouts = await this.workoutCompletionsRepository.countAmountByProgramId(
      programId,
      userId,
    );

    const workoutCount = program._count.workouts;

    const progressPercentage =
      workoutCount > 0
        ? Math.round((completedWorkouts / workoutCount) * 100)
        : 0;


    const programWithProgress = await Promise.all(workouts.map(async (workout) => {
      const [isLiked, completion] = await Promise.all([
        this.workoutLikesRepository.findByWorkoutAndUser(workout.id, userId),
        this.workoutCompletionsRepository.findByWorkoutAndUser(workout.id, userId),
      ]);

      return {
        ...workout,
        isLiked: !!isLiked,
        isCompleted: !!completion,
      };
    }));

    return {
      id: program.id,
      title: program.title,
      description: program.description,
      category: program.category,
      thumbnailUrl: program.thumbnailUrl,
      workoutCount,
      completedWorkouts,
      progressPercentage,
      workouts: programWithProgress,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    };
  }
}

