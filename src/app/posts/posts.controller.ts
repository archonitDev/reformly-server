import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('posts')
@ApiBearerAuth()
@ApiTags('Community Posts - V1')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  create(
    @GetCurrentUser() user: AuthUser,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.postsService.create(user.userId, createPostDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts (with pagination)' })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    type: [Post],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.findAll(page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single post by ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  update(
    @Param('id') id: string,
    @GetCurrentUser() user: AuthUser,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.userId, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  remove(@Param('id') id: string, @GetCurrentUser() user: AuthUser) {
    return this.postsService.remove(id, user.userId);
  }

  @Patch(':id/pin')
  @ApiOperation({ summary: 'Toggle pin status of a post' })
  @ApiResponse({ status: 200, description: 'Post pin status toggled' })
  togglePin(@Param('id') id: string, @GetCurrentUser() user: AuthUser) {
    return this.postsService.togglePin(id, user.userId);
  }
}

