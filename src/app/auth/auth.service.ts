import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@app/users/users.service';
import { ErrorCodes } from '@common/enums/error-codes.enum';
import { FirebaseService } from '@libs/firebase/firebase.service';
import { SecurityService } from '@libs/security/security.service';
import { AuthResponse } from './interfaces/auth-response.interface';
import * as admin from 'firebase-admin';
import { Role } from '@prisma/client';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly securityService: SecurityService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Authenticates a user using Firebase ID token.
   * Creates a new user if they don't exist in the database.
   * @param idToken - Firebase ID token to verify
   * @returns Authentication response with tokens and user data
   * @throws UnauthorizedException if token is invalid or email is missing
   * @throws InternalServerErrorException if user creation fails
   */
  async authenticateWithFirebase(idToken: string): Promise<AuthResponse> {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);

      this.logger.log(
        `Firebase authentication attempt for: ${decodedToken.email}`,
      );

      this.validateDecodedToken(decodedToken);

      const user = await this.usersService.findOrCreateUser(decodedToken);

      const tokens = await this.securityService.signTokens(user.id, user.email);

      await this.securityService.updateRtHash(user.id, tokens.refreshToken);

      this.logger.log(`User authenticated successfully: ${user.email}`);

      return {
        ...tokens,
        user,
      };
    } catch (error) {
      return this.handleAuthenticationError(error);
    }
  }

  
  async logout(userId: string) {
    await this.usersService.updateUser(userId, { hashedRt: null });
  }
  
  private handleAuthenticationError(error: any): never {
    if (
      error instanceof UnauthorizedException ||
      error instanceof BadRequestException ||
      error instanceof InternalServerErrorException
    ) {
      throw error;
    }

    this.logger.error(
      `Firebase authentication failed: ${error.message}`,
      error.stack,
    );

    throw new UnauthorizedException({
      message: 'Invalid Firebase token',
      errorCode: ErrorCodes.NotAuthorizedRequest,
    });
  }

  private validateDecodedToken(decodedToken: admin.auth.DecodedIdToken): void {
    if (!decodedToken?.email) {
      this.logger.warn('Firebase token missing email field');
      throw new UnauthorizedException({
        message: 'Firebase token does not contain an email',
        errorCode: ErrorCodes.NotAuthorizedRequest,
      });
    }
  }
}
