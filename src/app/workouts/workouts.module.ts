import { Module, forwardRef } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsRepository } from './repos/workouts.repository';
import { WorkoutCompletionsRepository } from './repos/workout-completions.repository';
import { WorkoutLikesRepository } from './repos/workout-likes.repository';
import { PrismaModule } from '@libs/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkoutsController],
  providers: [
    WorkoutsService,
    WorkoutsRepository,
    WorkoutCompletionsRepository,
    WorkoutLikesRepository,
  ],
  exports: [
    WorkoutsService,
    WorkoutsRepository,
    WorkoutCompletionsRepository,
    WorkoutLikesRepository,
  ],
})
export class WorkoutsModule {}

