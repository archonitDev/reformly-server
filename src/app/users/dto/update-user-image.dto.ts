import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserImageDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: Express.Multer.File;
}