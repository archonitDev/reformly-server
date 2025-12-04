import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';

@Injectable()
export class CommentsRepository {
  constructor(private prisma: PrismaService) {}

  private readonly authorSelect = {
    id: true,
    name: true,
    lastName: true,
    email: true,
    username: true,
  };

  private readonly countSelect = {
    likes: true,
    replies: true,
  };

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.prisma.comment.create({ data });
  }

  async findById(
    id: string,
    repliesParams?: { skip?: number; take?: number },
  ) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: this.authorSelect,
        },
        replies: {
          include: {
            author: {select: this.authorSelect}, 
            _count: {select: this.countSelect}
          },
          skip: repliesParams?.skip ?? 0,
          take: repliesParams?.take ?? 10,
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: this.countSelect,
        },
      },
    });
  }

  async findByPostId(
    postId: string,
    params?: { skip?: number; take?: number },
  ) {
    return this.prisma.comment.findMany({
      where: {
        postId,
        parentCommentId: null,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: this.authorSelect,
        },
        // replies: {
        //   include: {
        //     author: {select: this.authorSelect}, 
        //     _count: {select: this.countSelect}
        //   },
        //   orderBy: { createdAt: 'asc' },
        // },
        _count: {
          select: this.countSelect,
        },
      },
    });
  }

  async update(id: string, data: Prisma.CommentUpdateInput) {
    return this.prisma.comment.update({
      where: { id },
      data,
      include: {
        author: {
          select: this.authorSelect,
        },
      },
    });
  }

  async delete(id: string): Promise<Comment> {
    return this.prisma.comment.delete({ where: { id } });
  }

  async count(postId: string, includeReplies = false): Promise<number> {
    return this.prisma.comment.count({
      where: {
        postId,
        ...(includeReplies ? {} : { parentCommentId: null }),
      },
    });
  }
}

