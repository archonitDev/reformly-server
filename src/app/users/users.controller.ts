import { Controller, Get, Req, Put, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

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
}
