import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkoutsRepository } from './repos/workouts.repository';
import { WorkoutCompletionsRepository } from './repos/workout-completions.repository';
import { WorkoutLikesRepository } from './repos/workout-likes.repository';
import { WorkoutResponseDto } from './dto/workout-response.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    private workoutsRepository: WorkoutsRepository,
    private workoutCompletionsRepository: WorkoutCompletionsRepository,
    private workoutLikesRepository: WorkoutLikesRepository,
  ) {}

  async getWorkoutById(workoutId: string, userId: string): Promise<WorkoutResponseDto> {
    const workout = await this.workoutsRepository.findById(workoutId);
    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    const [isLiked, completion] = await Promise.all([
      this.workoutLikesRepository.findByWorkoutAndUser(workout.id, userId),
      this.workoutCompletionsRepository.findByWorkoutAndUser(workout.id, userId),
    ]);

    return {
      ...workout,
      equipment: workout.equipment?.map((we: any) => ({
        id: we.equipment.id,
        name: we.equipment.name,
        description: we.equipment.description,
        imageUrl: we.equipment.imageUrl,
        purchaseUrl: we.equipment.purchaseUrl,
      })) || [],
      isLiked: !!isLiked,
      isCompleted: !!completion,
    };
  }

  async getLikedWorkouts(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    workoutsWithProgress: WorkoutResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const allLikedWorkouts = await this.workoutLikesRepository.findByUser(userId);
    const total = allLikedWorkouts.length;
    const likedWorkouts = allLikedWorkouts.slice(skip, skip + limit);

    const workoutsWithProgress = await Promise.all(likedWorkouts.map(async (like) => {
      const [isLiked, completion] = await Promise.all([
        this.workoutLikesRepository.findByWorkoutAndUser(like.workout.id, userId),
        this.workoutCompletionsRepository.findByWorkoutAndUser(like.workout.id, userId),
      ]);

      return {
        ...like.workout,
        isLiked: !!isLiked,
        equipment: like.workout.equipment?.map((we: any) => ({
          id: we.equipment.id,
          name: we.equipment.name,
          description: we.equipment.description,
          imageUrl: we.equipment.imageUrl,
          purchaseUrl: we.equipment.purchaseUrl,
        })) || [],
        isCompleted: !!completion,
      };
    }));

    

    return {
      workoutsWithProgress,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleWorkoutLike(workoutId: string, userId: string): Promise<{ liked: boolean }> {
    const existingLike = await this.workoutLikesRepository.findByWorkoutAndUser(workoutId, userId);

    if (existingLike) {
      await this.workoutLikesRepository.delete(workoutId, userId);
      return { liked: false };
    } else {
      await this.workoutLikesRepository.create(workoutId, userId);
      return { liked: true };
    }
  }

  async completeWorkout(
    workoutId: string,
    userId: string,
  ): Promise<{ completed: boolean }> {
    const workout = await this.workoutsRepository.findById(workoutId);
    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    await this.workoutCompletionsRepository.upsert(workoutId, userId);

    return { completed: true };
  }
}

