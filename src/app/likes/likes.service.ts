import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { LikesRepository } from './repos/likes.repository';
import { LikeResponseDto } from './dto/like-response.dto';
import { NotificationsService } from '@app/notifications/notifications.service';
import { PrismaService } from '@libs/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(
    private likesRepository: LikesRepository,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  async togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    // Check if post exists
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.likesRepository.findByPostAndUser(postId, userId);

    if (existingLike) {
      // Unlike
      await this.likesRepository.deletePostLike(postId, userId);
      const likesCount = await this.likesRepository.countPostLikes(postId);
      return { liked: false, likesCount };
    } else {
      // Like
      await this.likesRepository.createPostLike(postId, userId);
      const likesCount = await this.likesRepository.countPostLikes(postId);

      // Create notification for post author (if not liking own post)
      if (post.authorId !== userId) {
        await this.notificationsService.createLikeNotification(post.authorId, userId, postId);
      }

      return { liked: true, likesCount };
    }
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    // Check if comment exists
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.likesRepository.findByCommentAndUser(commentId, userId);

    if (existingLike) {
      // Unlike
      await this.likesRepository.deleteCommentLike(commentId, userId);
      const likesCount = await this.likesRepository.countCommentLikes(commentId);
      return { liked: false, likesCount };
    } else {
      // Like
      await this.likesRepository.createCommentLike(commentId, userId);
      const likesCount = await this.likesRepository.countCommentLikes(commentId);

      // Create notification for comment author (if not liking own comment)
      if (comment.authorId !== userId) {
        await this.notificationsService.createCommentLikeNotification(
          comment.authorId,
          userId,
          comment.postId,
          commentId,
        );
      }

      return { liked: true, likesCount };
    }
  }

  async getPostLikes(
    postId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ likes: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      this.likesRepository.getPostLikes(postId, { skip, take: limit }),
      this.likesRepository.countPostLikes(postId),
    ]);

    return {
      likes: likes.map((like) => ({
        id: like.id,
        user: like.user,
        createdAt: like.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCommentLikes(
    commentId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ likes: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      this.likesRepository.getCommentLikes(commentId, { skip, take: limit }),
      this.likesRepository.countCommentLikes(commentId),
    ]);

    return {
      likes: likes.map((like) => ({
        id: like.id,
        user: like.user,
        createdAt: like.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

