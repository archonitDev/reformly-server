import { Controller, Post, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LikesService } from './likes.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';

@Controller('posts/:postId/likes')
@ApiBearerAuth()
@ApiTags('Community Likes - V1')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a post (like/unlike)' })
  @ApiResponse({ status: 200, description: 'Like toggled successfully' })
  togglePostLike(@Param('postId') postId: string, @GetCurrentUser() user: AuthUser) {
    return this.likesService.togglePostLike(postId, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all likes for a post' })
  @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  getPostLikes(
    @Param('postId') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.likesService.getPostLikes(postId, page ? +page : 1, limit ? +limit : 50);
  }
}

@Controller('comments/:commentId/likes')
@ApiBearerAuth()
@ApiTags('Community Likes - V1')
export class CommentLikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on a comment (like/unlike)' })
  @ApiResponse({ status: 200, description: 'Like toggled successfully' })
  toggleCommentLike(@Param('commentId') commentId: string, @GetCurrentUser() user: AuthUser) {
    return this.likesService.toggleCommentLike(commentId, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all likes for a comment' })
  @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  getCommentLikes(
    @Param('commentId') commentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.likesService.getCommentLikes(commentId, page ? +page : 1, limit ? +limit : 50);
  }
}

