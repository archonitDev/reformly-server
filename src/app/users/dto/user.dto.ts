import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'User Id',
  })
  id: string;
  @ApiProperty({ description: 'User Email' })
  email: string;
}
