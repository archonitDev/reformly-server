import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({ data });
  }

  async findById(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        comments: {
          select: {
            id: true,
            author: {
              select: {
                name: true,
                lastName: true,
                email: true,
              },
            },
            content: true,
            replies: {
              select: {
                author: {
                  select: {
                    name: true,
                    lastName: true,
                    email: true,
                  },
                },
                createdAt: true,
                updatedAt: true,
                id: true,
                content: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[];
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      where,
      orderBy,
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
            comments: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    return this.prisma.post.update({
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Post> {
    return this.prisma.post.delete({ where: { id } });
  }

  async count(where?: Prisma.PostWhereInput): Promise<number> {
    return this.prisma.post.count({ where });
  }

  async isLikedByUser(postId: string, userId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    return !!like;
  }

  async togglePin(id: string, isPinned: boolean): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data: { isPinned },
    });
  }
}

