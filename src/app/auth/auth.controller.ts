import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthDto } from './dto/auth.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@libs/security/decorators/public.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { UsersService } from '@app/users/users.service';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('Authentication - V1')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
  })
  async getCurrentUser(@GetCurrentUser() user: AuthUser) {
    return this.usersService.findById(user?.userId);
  }

  @Public()
  @Post('firebase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Firebase (Google/Apple)' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
  })
  async firebaseAuth(@Body() dto: FirebaseAuthDto) {
    return this.authService.authenticateWithFirebase(dto.idToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
