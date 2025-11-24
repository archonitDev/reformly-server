import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Like } from '@prisma/client';

@Injectable()
export class LikesRepository {
  constructor(private prisma: PrismaService) {}

  async createPostLike(postId: string, userId: string): Promise<Like> {
    return this.prisma.like.create({
      data: {
        post: {
          connect: { id: postId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async createCommentLike(commentId: string, userId: string): Promise<Like> {
    return this.prisma.like.create({
      data: {
        comment: {
          connect: { id: commentId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findByPostAndUser(postId: string, userId: string): Promise<Like | null> {
    return this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
  }

  async findByCommentAndUser(commentId: string, userId: string): Promise<Like | null> {
    return this.prisma.like.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });
  }

  async deletePostLike(postId: string, userId: string): Promise<Like> {
    return this.prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
  }

  async deleteCommentLike(commentId: string, userId: string): Promise<Like> {
    return this.prisma.like.delete({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });
  }

  async getPostLikes(postId: string, params?: { skip?: number; take?: number }) {
    return this.prisma.like.findMany({
      where: { postId },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getCommentLikes(commentId: string, params?: { skip?: number; take?: number }) {
    return this.prisma.like.findMany({
      where: { commentId },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async countPostLikes(postId: string): Promise<number> {
    return this.prisma.like.count({ where: { postId } });
  }

  async countCommentLikes(commentId: string): Promise<number> {
    return this.prisma.like.count({ where: { commentId } });
  }
}

