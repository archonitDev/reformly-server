import {ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class FileUrlDto {
  @ApiPropertyOptional({
    description: 'File URL',
  })
  @IsString()
  @IsOptional()
  fileUrl: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required: false })
  file?: Express.Multer.File;
}