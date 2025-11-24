import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsArray,
  MaxLength,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator';
import { Gender, MainGoal, Activity } from '@prisma/client';

export class OnboardingDto {
  @ApiProperty({
    description: 'User gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Date of birth',
    example: '1985-11-09',
    type: String,
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Main fitness goal',
    enum: MainGoal,
    example: MainGoal.LOSE_WEIGHT,
  })
  @IsEnum(MainGoal)
  mainGoal: MainGoal;

  @ApiProperty({
    description: 'Selected activities (up to 3)',
    enum: Activity,
    isArray: true,
    example: [Activity.GENERAL_FITNESS, Activity.WALKING],
  })
  @IsArray()
  @ArrayMaxSize(3, { message: 'You can select up to 3 activities' })
  @IsEnum(Activity, { each: true })
  activities: Activity[];

  @ApiProperty({
    description: 'Height in centimeters',
    example: 166,
    minimum: 50,
    maximum: 300,
  })
  @IsInt()
  @Min(50)
  @Max(300)
  height: number;

  @ApiProperty({
    description: 'Current weight in kilograms',
    example: 65,
    minimum: 20,
    maximum: 500,
  })
  @IsNumber()
  @Min(20)
  @Max(500)
  currentWeight: number;

  @ApiProperty({
    description: 'Goal weight in kilograms',
    example: 59,
    minimum: 20,
    maximum: 500,
  })
  @IsNumber()
  @Min(20)
  @Max(500)
  goalWeight: number;
}

