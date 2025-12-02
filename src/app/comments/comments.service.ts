import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from './repos/comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '@app/notifications/notifications.service';
import { Comment, PointSource } from '@prisma/client';
import { PostsService } from '@app/posts/posts.service';
import { LeaderboardService } from '@app/leaderboard/leaderboard.service';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private notificationsService: NotificationsService,
    private postService: PostsService,
    private leaderboardService: LeaderboardService,
  ) {}



  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postService.findOne(postId);
  
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  
    const comment = await this.commentsRepository.create({
      content: createCommentDto.content,
      post: {
        connect: { id: postId },
      },
      author: {
        connect: { id: userId },
      },
    });

    if (post?.authorId && post?.authorId !== userId) {
      await Promise.all([
        this.notificationsService.createCommentNotification(
          post.authorId,
          userId,
          postId,
          comment.id,
        ),
        this.leaderboardService.recordPoints(
          post.authorId,
          1,
          PointSource.COMMENT_ON_POST,
        ),
      ]);
    }

    return comment;
  }

  async createReply(
    postId: string,
    commentId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const parentComment = await this.commentsRepository.findById(commentId);
    const post = await this.postService.findOne(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!parentComment) {
      throw new NotFoundException('Parent comment not found');
    }

    if (parentComment.postId !== postId) {
      throw new ForbiddenException('Parent comment does not belong to this post');
    }

    const comment = await this.commentsRepository.create({
      content: createCommentDto.content,
      post: {
        connect: { id: postId },
      },
      author: {
        connect: { id: userId },
      },
      parentComment: {
        connect: { id: commentId },
      },
    });

    if (parentComment.authorId !== userId) {
      await Promise.all([
        this.notificationsService.createCommentNotification(
          parentComment.authorId,
          userId,
          postId,
          comment.id,
        ),
        this.leaderboardService.recordPoints(
          parentComment.authorId,
          1,
          PointSource.COMMENT_REPLY,
        ),
      ]);
    }

    return comment;
  }

  async findByPostId(
    postId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [topLevelComments, total] = await Promise.all([
      this.commentsRepository.findByPostId(postId, { skip, take: limit }),
      this.commentsRepository.count(postId),
    ]);


    return {
      comments: topLevelComments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReplies(
    commentId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;

    const comment = await this.commentsRepository.findById(commentId, { skip, take: limit });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updatedComment = await this.commentsRepository.update(
      id,
      updateCommentDto,
    );

    return updatedComment;
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentsRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.delete(id);
  }
}

