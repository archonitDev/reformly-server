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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { GetCurrentUser } from '@libs/security/decorators/get-current-user.decorator';
import { AuthUser } from '@common/interfaces/auth-user.interface';
import { CommentResponseDto } from './dto/comment-response.dto';

@Controller('posts/:postId/comments')
@ApiBearerAuth()
@ApiTags('Community Comments - V1')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all top-level comments for a post (with nested replies)',
  })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  findByPostId(
    @Param('postId') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.findByPostId(
      postId,
      page ? +page : 1,
      limit ? +limit : 50,
    );
  }

  @Get(':commentId/replies')
  @ApiOperation({ summary: 'Get all replies to a specific comment' })
  @ApiResponse({
    status: 200,
    description: 'Replies retrieved successfully',
    type: [CommentResponseDto],
  })
  @ApiParam({ name: 'commentId', required: true, type: String, example: '123' })
  @ApiParam({ name: 'postId', required: true, type: String, example: '123' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  getReplies(
    @Param('commentId') commentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.getReplies(
      commentId,
      page ? +page : 1,
      limit ? +limit : 50,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a comment on a post' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  createComment(
    @Param('postId') postId: string,
    @GetCurrentUser() user: AuthUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(
      postId,
      user.userId,
      createCommentDto,
    );
  }

  @Post(':commentId/replies')
  @ApiOperation({ summary: 'Reply to a comment' })
  @ApiResponse({
    status: 201,
    description: 'Reply created successfully',
    type: CommentResponseDto,
  })
  createReply(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @GetCurrentUser() user: AuthUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createReply(
      postId,
      commentId,
      user.userId,
      createCommentDto,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  update(
    @Param('id') id: string,
    @GetCurrentUser() user: AuthUser,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user.userId, updateCommentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  remove(@Param('id') id: string, @GetCurrentUser() user: AuthUser) {
    return this.commentsService.remove(id, user.userId);
  }
}

