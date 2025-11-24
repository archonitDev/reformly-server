import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsRepository } from './repos/posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    const post = await this.postsRepository.create({
      content: createPostDto.content,
      imageUrl: createPostDto.imageUrl,
      author: {
        connect: { id: userId },
      },
    });

    return post;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    userId?: string,
  ): Promise<{
    posts: Post[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PostWhereInput = userId ? { authorId: userId } : {};

    const [posts, total] = await Promise.all([
      this.postsRepository.findMany({
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        where,
      }),
      this.postsRepository.count(),
    ]);

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(
    id: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.postsRepository.update(id, updatePostDto);

    return updatedPost;
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postsRepository.delete(id);
  }

  async togglePin(id: string, userId: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only pin your own posts');
    }

    const updatedPost = await this.postsRepository.togglePin(
      id,
      !post.isPinned,
    );

    return updatedPost;
  }
}


