import { PrismaClient, Gender, Role, WorkoutCategory, MainGoal, Activity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      gender: Gender.MALE,
      role: Role.USER,
      onboardingCompleted: true,
      mainGoal: MainGoal.BUILD_MUSCLE,
      activities: [Activity.PILATES, Activity.GENERAL_FITNESS],
      height: 180,
      currentWeight: 75,
      goalWeight: 80,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      name: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      gender: Gender.FEMALE,
      role: Role.USER,
      onboardingCompleted: true,
      mainGoal: MainGoal.LOSE_WEIGHT,
      activities: [Activity.YOGA, Activity.PILATES],
      height: 165,
      currentWeight: 70,
      goalWeight: 60,
    },
  });

  console.log('✅ Created users');

  // Create equipment
  const loopBands = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Loop Bands',
      description: 'Resistance bands for strength training',
      imageUrl: 'https://example.com/images/loop-bands.jpg',
      purchaseUrl: 'https://example.com/shop/loop-bands',
    },
  });

  const yogaMat = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat for floor exercises',
      imageUrl: 'https://example.com/images/yoga-mat.jpg',
      purchaseUrl: 'https://example.com/shop/yoga-mat',
    },
  });

  const pilatesBall = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Pilates Ball',
      description: 'Exercise ball for core strengthening',
      imageUrl: 'https://example.com/images/pilates-ball.jpg',
      purchaseUrl: 'https://example.com/shop/pilates-ball',
    },
  });

  const miniReformer = await prisma.equipment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Mini Reformer',
      description: 'Compact Pilates reformer machine',
      imageUrl: 'https://example.com/images/mini-reformer.jpg',
      purchaseUrl: 'https://example.com/shop/mini-reformer',
    },
  });

  console.log('✅ Created equipment');

  // Create workout programs
  const pilatesEssentials = await prisma.workoutProgram.create({
    data: {
      title: 'Pilates with Essentials Kit',
      description: 'Complete Pilates program using essential equipment',
      category: WorkoutCategory.PILATES,
      thumbnailUrl: 'https://example.com/images/pilates-essentials.jpg',
    },
  });

  const pilatesMiniReformer = await prisma.workoutProgram.create({
    data: {
      title: 'Pilates with Mini Reformer',
      description: 'Advanced Pilates workouts using mini reformer',
      category: WorkoutCategory.PILATES,
      thumbnailUrl: 'https://example.com/images/pilates-mini-reformer.jpg',
    },
  });

  const wallPilates = await prisma.workoutProgram.create({
    data: {
      title: 'Wall Pilates',
      description: 'Pilates exercises using wall support',
      category: WorkoutCategory.PILATES,
      thumbnailUrl: 'https://example.com/images/wall-pilates.jpg',
    },
  });

  const homePilates = await prisma.workoutProgram.create({
    data: {
      title: 'Home Pilates',
      description: 'No-equipment Pilates workouts for home',
      category: WorkoutCategory.PILATES,
      thumbnailUrl: 'https://example.com/images/home-pilates.jpg',
    },
  });

  const breakfastYoga = await prisma.workoutProgram.create({
    data: {
      title: 'Breakfast Yoga',
      description: 'Gentle morning yoga flow to start your day',
      category: WorkoutCategory.YOGA,
      thumbnailUrl: 'https://example.com/images/breakfast-yoga.jpg',
    },
  });

  const pilatesStudioSet = await prisma.workoutProgram.create({
    data: {
      title: 'Pilates with Studio Set',
      description: 'Professional Pilates program with full studio equipment',
      category: WorkoutCategory.PILATES,
      thumbnailUrl: 'https://example.com/images/pilates-studio.jpg',
    },
  });

  console.log('✅ Created workout programs');

  // Create workouts for Pilates with Essentials Kit
  const pilatesEssentialsWorkouts = [
    {
      title: 'Lower body workout',
      description: 'Target your legs and glutes with this comprehensive lower body session',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 20,
      calories: 220,
      equipmentIds: [loopBands.id, yogaMat.id],
    },
    {
      title: 'Upper body workout',
      description: 'Strengthen your arms, shoulders, and core',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 20,
      calories: 220,
      equipmentIds: [loopBands.id],
    },
    {
      title: 'Core confidence workout',
      description: 'Build a strong core with targeted exercises',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 20,
      calories: 220,
      equipmentIds: [yogaMat.id, pilatesBall.id],
    },
  ];

  for (let i = 0; i < 28; i++) {
    const workoutData = pilatesEssentialsWorkouts[i % pilatesEssentialsWorkouts.length];
    const workout = await prisma.workout.create({
      data: {
        programId: pilatesEssentials.id,
        title: `${workoutData.title} ${i > 0 ? `- Day ${i + 1}` : ''}`,
        description: workoutData.description,
        videoUrl: workoutData.videoUrl,
        duration: workoutData.duration,
        calories: workoutData.calories,
        thumbnailUrl: `https://example.com/images/workout-${i + 1}.jpg`,
        equipment: {
          create: workoutData.equipmentIds.map((equipmentId) => ({
            equipment: { connect: { id: equipmentId } },
          })),
        },
      },
    });

    // Create some completions for user1 (5 workouts completed)
    if (i < 5) {
      await prisma.workoutCompletion.create({
        data: {
          workoutId: workout.id,
          userId: user1.id,
        },
      });
    }
  }

  // Create workouts for Pilates with Mini Reformer
  for (let i = 0; i < 28; i++) {
    await prisma.workout.create({
      data: {
        programId: pilatesMiniReformer.id,
        title: `Mini Reformer Workout ${i + 1}`,
        description: 'Full body workout using mini reformer',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 25,
        calories: 250,
        thumbnailUrl: `https://example.com/images/mini-reformer-${i + 1}.jpg`,
        equipment: {
          create: {
            equipment: { connect: { id: miniReformer.id } },
          },
        },
      },
    });
  }

  // Create workouts for Wall Pilates (all completed by user1)
  for (let i = 0; i < 28; i++) {
    const workout = await prisma.workout.create({
      data: {
        programId: wallPilates.id,
        title: `Wall Pilates Workout ${i + 1}`,
        description: 'Pilates exercises using wall support',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 20,
        calories: 200,
        thumbnailUrl: `https://example.com/images/wall-pilates-${i + 1}.jpg`,
      },
    });

    // All workouts completed
    await prisma.workoutCompletion.create({
      data: {
        workoutId: workout.id,
        userId: user1.id,
      },
    });
  }

  // Create workouts for Home Pilates (10 completed by user1)
  for (let i = 0; i < 28; i++) {
    const workout = await prisma.workout.create({
      data: {
        programId: homePilates.id,
        title: `Home Pilates Workout ${i + 1}`,
        description: 'No-equipment Pilates workout',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 20,
        calories: 180,
        thumbnailUrl: `https://example.com/images/home-pilates-${i + 1}.jpg`,
      },
    });

    if (i < 10) {
      await prisma.workoutCompletion.create({
        data: {
          workoutId: workout.id,
          userId: user1.id,
        },
      });
    }
  }

  // Create workouts for Breakfast Yoga (15 completed by user1)
  for (let i = 0; i < 28; i++) {
    const workout = await prisma.workout.create({
      data: {
        programId: breakfastYoga.id,
        title: `Morning Yoga Flow ${i + 1}`,
        description: 'Gentle yoga flow to energize your morning',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 15,
        calories: 150,
        thumbnailUrl: `https://example.com/images/yoga-${i + 1}.jpg`,
        equipment: {
          create: {
            equipment: { connect: { id: yogaMat.id } },
          },
        },
      },
    });

    if (i < 15) {
      await prisma.workoutCompletion.create({
        data: {
          workoutId: workout.id,
          userId: user1.id,
        },
      });
    }
  }

  // Create workouts for Pilates with Studio Set (5 completed by user1)
  for (let i = 0; i < 28; i++) {
    const workout = await prisma.workout.create({
      data: {
        programId: pilatesStudioSet.id,
        title: `Studio Pilates Workout ${i + 1}`,
        description: 'Professional Pilates session with studio equipment',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: 30,
        calories: 300,
        thumbnailUrl: `https://example.com/images/studio-${i + 1}.jpg`,
        equipment: {
          create: [
            { equipment: { connect: { id: miniReformer.id } } },
            { equipment: { connect: { id: pilatesBall.id } } },
          ],
        },
      },
    });

    if (i < 5) {
      await prisma.workoutCompletion.create({
        data: {
          workoutId: workout.id,
          userId: user1.id,
        },
      });
    }
  }

  console.log('✅ Created workouts and completions');

  // Create some workout likes
  const allWorkouts = await prisma.workout.findMany({
    where: { programId: pilatesEssentials.id },
    take: 3,
  });

  for (const workout of allWorkouts) {
    await prisma.workoutLike.create({
      data: {
        workoutId: workout.id,
        userId: user1.id,
      },
    });
  }

  console.log('✅ Created workout likes');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

