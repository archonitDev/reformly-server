import { Controller, Get, Req, Put, Param, Body, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { OnboardingDto } from './dto/onboarding.dto';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: 200,
    description: 'User information updated successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        lastName: { type: 'string' },
        gender: { type: 'string' },
      },
    },
  })
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: Prisma.UserUpdateInput,
  ) {
    return this.usersService.updateUser(id, updateData);
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
}
