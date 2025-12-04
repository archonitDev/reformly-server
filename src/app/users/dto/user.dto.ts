import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, HeightUnit, WeightUnit } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsNull } from 'typeorm';

export class UserDto {
  @ApiProperty({
    description: 'User Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User Last Name',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'User Gender',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    description: 'User Username',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User Bio',
  })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiProperty({
    description: 'User Date of Birth',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    description: 'User Height',
  })
  @IsNumber()
  @IsNotEmpty()
  height: number;

  @ApiProperty({
    description: 'User Current Weight',
  })
  @IsNumber()
  @IsNotEmpty()
  currentWeight: number;

  @ApiProperty({
    description: 'User Goal Weight',
  })
  @IsNumber()
  @IsNotEmpty()
  goalWeight: number;

  @ApiProperty({
    description: 'User Height Unit',
  })
  @IsEnum(HeightUnit)
  @IsNotEmpty()
  heightUnit: HeightUnit;

  @ApiProperty({
    description: 'User Weight Unit',
  })
  @IsEnum(WeightUnit)
  @IsNotEmpty()
  weightUnit: WeightUnit;
}
