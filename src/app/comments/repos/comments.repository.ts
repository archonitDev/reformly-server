import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';

@Injectable()
export class CommentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.prisma.comment.create({
      data,
      include: {
        author: {
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

  async findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
  }

  async findByPostId(postId: string, params?: { skip?: number; take?: number }) {
    return this.prisma.comment.findMany({
      where: { postId },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data,
      include: {
        author: {
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

  async delete(id: string): Promise<Comment> {
    return this.prisma.comment.delete({ where: { id } });
  }

  async count(postId: string): Promise<number> {
    return this.prisma.comment.count({ where: { postId } });
  }
}

