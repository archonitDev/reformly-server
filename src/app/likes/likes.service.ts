import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { LikesRepository } from './repos/likes.repository';
import { LikeResponseDto } from './dto/like-response.dto';
import { NotificationsService } from '@app/notifications/notifications.service';
import { PrismaService } from '@libs/prisma/prisma.service';
import { LeaderboardService } from '@app/leaderboard/leaderboard.service';
import { PointSource } from '@prisma/client';

@Injectable()
export class LikesService {
  constructor(
    private likesRepository: LikesRepository,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
    private leaderboardService: LeaderboardService,
  ) {}

  async togglePostLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.likesRepository.findByPostAndUser(postId, userId);

    if (existingLike) {
      // Unlike
      await this.likesRepository.deletePostLike(postId, userId);
      const likesCount = await this.likesRepository.countPostLikes(postId);

      if (post.authorId !== userId) {
        await this.leaderboardService.recordPoints(
          post.authorId,
          -1,
          PointSource.POST_LIKED,
        );
      }

      return { liked: false, likesCount };
    } else {
      await this.likesRepository.createPostLike(postId, userId);
      const likesCount = await this.likesRepository.countPostLikes(postId);

      if (post.authorId !== userId) {
        await Promise.all([
          this.notificationsService.createLikeNotification(
            post.authorId,
            userId,
            postId,
          ),
          this.leaderboardService.recordPoints(
            post.authorId,
            1,
            PointSource.POST_LIKED,
          ),
        ]);
      }

      return { liked: true, likesCount };
    }
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.likesRepository.findByCommentAndUser(commentId, userId);

    if (existingLike) {
      // Unlike
      await this.likesRepository.deleteCommentLike(commentId, userId);
      const likesCount = await this.likesRepository.countCommentLikes(commentId);

      if (comment?.authorId && comment?.authorId !== userId) {
        await this.leaderboardService.recordPoints(
          comment.authorId,
          -1,
          PointSource.COMMENT_LIKED,
        );
      }

      return { liked: false, likesCount };
    } else {
      await this.likesRepository.createCommentLike(commentId, userId);
      const likesCount = await this.likesRepository.countCommentLikes(commentId);

      if (comment?.authorId && comment?.authorId !== userId) {
        await Promise.all([
          this.notificationsService.createCommentLikeNotification(
            comment.authorId,
            userId,
            comment.postId,
            commentId,
          ),
          this.leaderboardService.recordPoints(
            comment.authorId,
            1,
            PointSource.COMMENT_LIKED,
          ),
        ]);
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

