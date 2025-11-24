import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { WorkoutProgramsRepository } from './repos/workout-programs.repository';
import { PrismaModule } from '@libs/prisma/prisma.module';
import { WorkoutsModule } from '@app/workouts/workouts.module';

@Module({
  imports: [PrismaModule, WorkoutsModule],
  controllers: [ProgramsController],
  providers: [ProgramsService, WorkoutProgramsRepository],
  exports: [ProgramsService, WorkoutProgramsRepository],
})
export class ProgramsModule {}

