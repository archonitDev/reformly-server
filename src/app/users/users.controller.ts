import { Controller, Put, Param, Body, Post, HttpCode, HttpStatus, Delete, UploadedFile, UseInterceptors, Query, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { OnboardingDto } from './dto/onboarding.dto';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';
import { UserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { FileUrlDto } from './dto/file-url.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('check-username')
  @ApiOperation({ summary: 'Check if username is available' })
  @ApiResponse({ status: 200, description: 'Username is available' })
  @ApiResponse({ status: 400, description: 'Username is already taken' })
  checkUsername(@Query('username') username: string) {
    return this.usersService.checkUsername(username);
  }

  @Post('profile-picture')
  @ApiOperation({ summary: 'Update user profile picture' })
  @ApiResponse({
    status: 201,
    description: 'Profile picture updated successfully',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  @ApiBody({ type: FileUrlDto })
  updateProfilePicture(
    @GetCurrentUser() user: AuthUser,
    @Body() fileUrlData: FileUrlDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateProfilePicture(user.userId, fileUrlData, file);
  }

  @Post('notification-settings')
  @ApiOperation({ summary: 'Edit notification settings' })
  @ApiResponse({
    status: 201,
    description: 'Notification settings updated successfully',
  })
  @ApiBody({ type: NotificationSettingsDto })
  editNotificationSettings(
    @Param('id') id: string,
    @Body() notificationSettings: NotificationSettingsDto,
  ) {
    return this.usersService.updateUser(id, notificationSettings);
  }

  @Put('')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: 200,
    description: 'User information updated successfully',
  })
  @ApiBody({ type: UserDto })
  async updateUser(
    @GetCurrentUser() user: AuthUser,
    @Body() updateData: UserDto,
  ) {
    return this.usersService.updateUser(user.userId, updateData);
  }

  @Post('finish-onboarding')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete user onboarding' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async completeOnboarding(
    @GetCurrentUser() user: AuthUser,
    @Body() onboardingData: OnboardingDto,
  ) {
    return this.usersService.completeOnboarding(user.userId, onboardingData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
