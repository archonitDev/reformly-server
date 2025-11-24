import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from './repos/comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { NotificationsService } from '@app/notifications/notifications.service';
import { LikesRepository } from '@app/likes/repos/likes.repository';
import { PrismaService } from '@libs/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private notificationsService: NotificationsService,
    private likesRepository: LikesRepository,
    private prisma: PrismaService,
  ) {}

  async create(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.create({
      content: createCommentDto.content,
      post: {
        connect: { id: postId },
      },
      author: {
        connect: { id: userId },
      },
    });

    // Fetch post to get authorId for notification
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    // Create notification for post author (if not commenting on own post)
    if (post && post.authorId !== userId) {
      await this.notificationsService.createCommentNotification(
        post.authorId,
        userId,
        postId,
        comment.id,
      );
    }

    return await this.mapToResponseDto(comment, userId);
  }

  async findByPostId(
    postId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ comments: CommentResponseDto[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.commentsRepository.findByPostId(postId, { skip, take: limit }),
      this.commentsRepository.count(postId),
    ]);

    const commentsWithLikeStatus = await Promise.all(
      comments.map(async (comment) => this.mapToResponseDto(comment, userId)),
    );

    return {
      comments: commentsWithLikeStatus,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updatedComment = await this.commentsRepository.update(id, updateCommentDto);

    return await this.mapToResponseDto(updatedComment, userId);
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

  private async mapToResponseDto(comment: any, userId: string): Promise<CommentResponseDto> {
    const isLikedByCurrentUser = await this.likesRepository.findByCommentAndUser(
      comment.id,
      userId,
    );

    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      likesCount: comment._count?.likes || 0,
      isLikedByCurrentUser: !!isLikedByCurrentUser,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        lastName: comment.author.lastName,
        email: comment.author.email,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}

