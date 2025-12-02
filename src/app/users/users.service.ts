import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Gender, Prisma, Role, User, MainGoal, Activity } from '@prisma/client';
import { UsersRepository } from './repos/users.repository';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import * as admin from 'firebase-admin';
import { parseFullName } from './utils/utils';
import { OnboardingDto } from './dto/onboarding.dto';
import { StorageService } from '@libs/storage/storage.service';


const userSelect = {
  id: true,
  email: true,
  name: true,
  lastName: true,
  gender: true,
  role: true,
  dateOfBirth: true,
  mainGoal: true,
  activities: true,
  height: true,
  currentWeight: true,
  goalWeight: true,
  onboardingCompleted: true,
  profilePictureUrl: true,
  totalPoints: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository, private readonly storageService: StorageService) {}

  async updateProfilePicture(id: string, file: Express.Multer.File) {
    const user = await this.usersRepository.findOneById(id);

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCodes.NotExists_User,
      });
    }

    const { url } = await this.storageService.uploadObject({
      key: `users/${id}/${file.originalname.replace(' ', '_')}`,
      body: file.buffer,
      contentType: file.mimetype,
    });

    await this.usersRepository.updateUser(id, { profilePictureUrl: url });

    return url;
  }

  async findById(id: string) {
    const user = await this.usersRepository.findUnique({ id }, userSelect);

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCodes.NotExists_User,
      });
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findUnique({ email }, userSelect);
  }

  /**
   * Finds existing user or creates a new one based on Firebase token data
   * @param decodedToken - Decoded Firebase token
   * @returns User entity
   * @throws InternalServerErrorException if user creation fails
   */
  async findOrCreateUser(
    decodedToken: admin.auth.DecodedIdToken,
  ): Promise<User> {
    const { email, name } = decodedToken;

    let user = await this.findByEmail(email);

    if (!user) {
      this.logger.log(`Creating new user for email: ${email}`);
      user = await this.createUserFromFirebaseData(email, name);
    }

    return user;
  }

  /**
   * Creates a new user from Firebase authentication data
   * Delegates to UsersService for actual user creation
   * @param email - User's email address
   * @param name - User's full name from Firebase (optional)
   * @returns Newly created user entity
   * @throws InternalServerErrorException if creation fails
   */
  private async createUserFromFirebaseData(
    email: string,
    name?: string,
  ): Promise<User> {
    try {
      const { firstName, lastName } = parseFullName(name, email);
      const user = await this.usersRepository.createUser({
        email,
        name: firstName,
        lastName,
        gender: Gender.OTHER,
        role: Role.USER,
      });

      this.logger.log(`User created from auth provider: ${email}`);

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to create user from auth: ${email}`,
        error.stack,
      );

      if (error.code === 'P2002') {
        throw new InternalServerErrorException({
          message: 'User with this email already exists',
          errorCode: ErrorCodes.UserWithEmailExists,
        });
      }

      throw new InternalServerErrorException({
        message: 'Failed to create user account',
        errorCode: ErrorCodes.UserCreationFailed,
      });
    }
  }


  async updateUser(id: string, updateData: Prisma.UserUpdateInput) {
    try {
      const user = await this.usersRepository.findOneById(id);

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          errorCode: ErrorCodes.NotExists_User,
        });
      }
      await this.usersRepository.updateUser(id, updateData);

      const updatedUser = await this.usersRepository.findOneById(id);

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to update user ${id}:`, error.stack);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Calculates BMI (Body Mass Index) using metric formula
   * BMI = weight_kg / (height_m²)
   * @param weightKg - Weight in kilograms
   * @param heightCm - Height in centimeters
   * @returns BMI value or null if inputs are invalid
   */
  private calculateBMI(weightKg: number, heightCm: number): number | null {
    if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
      return null;
    }

    // Convert height from cm to meters
    const heightMeters = heightCm / 100;
    
    // Calculate BMI: weight (kg) / height (m)²
    const bmi = weightKg / (heightMeters * heightMeters);
    
    return Math.round(bmi * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Completes user onboarding by saving all onboarding data
   * @param userId - User ID
   * @param onboardingData - Onboarding data from DTO
   * @returns Updated user entity
   * @throws NotFoundException if user not found
   * @throws InternalServerErrorException if update fails
   */
  async completeOnboarding(
    userId: string,
    onboardingData: OnboardingDto,
  ): Promise<User> {
    try {
      const user = await this.usersRepository.findOneById(userId);

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          errorCode: ErrorCodes.NotExists_User,
        });
      }

      const bmi = this.calculateBMI(
        onboardingData.currentWeight,
        onboardingData.height,
      );

      const updateData: Prisma.UserUpdateInput = {
        gender: onboardingData.gender,
        heightUnit: onboardingData.heightUnit,
        weightUnit: onboardingData.weightUnit,
        dateOfBirth: new Date(onboardingData.dateOfBirth),
        mainGoal: onboardingData.mainGoal,
        activities: {
          set: onboardingData.activities,
        },
        height: onboardingData.height,
        bmi,
        currentWeight: onboardingData.currentWeight,
        goalWeight: onboardingData.goalWeight,
        onboardingCompleted: true,
      };

      const updatedUser = await this.usersRepository.updateUser(
        userId,
        updateData,
      );

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to complete onboarding for user ${userId}:`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to complete onboarding');
    }
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOneById(id);

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCodes.NotExists_User,
      });
    }

    return this.usersRepository.deleteUser(id);
  }
}
