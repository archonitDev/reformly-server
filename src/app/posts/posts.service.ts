import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsRepository } from './repos/posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, Prisma } from '@prisma/client';
import { StorageService } from '@libs/storage/storage.service';
import { NotificationsService } from '@app/notifications/notifications.service';
import { parseMentions } from '@common/utils/mentions/parse-mentions.utils';
import { PostSort, PostSortType } from './types/post-sort.type';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private storageService: StorageService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto, file: Express.Multer.File): Promise<Post> {
    if (file) {
      const { url } = await this.storageService.uploadObject({
        key: `posts/${userId}/${file.originalname.replace(' ', '_')}`,
        body: file.buffer,
        contentType: file.mimetype,
      });
      createPostDto.fileUrl = url;
    }
    const post = await this.postsRepository.create({
      content: createPostDto.content,
      fileUrl: createPostDto.fileUrl,
      author: {
        connect: { id: userId },
      },
    });

    const { usernames, everyone } = parseMentions(createPostDto.content);

    // Handle @username mentions
    await this.notificationsService.notifyDirectMentions(
      userId,
      post.id,
      usernames,
    );

    // Handle @everyone (excluding already-mentioned users)
    if (everyone) {
      await this.notificationsService.notifyEveryoneMention(
        userId,
        post.id,
        usernames,
      );
    }

    return post;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    sort: PostSortType,
    userId?: string,
  ): Promise<{
    posts: Post[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where: Prisma.PostWhereInput = userId ? { authorId: userId } : {};
  
    const orderBy: Prisma.PostOrderByWithRelationInput[] = [{ isPinned: 'desc' }];

    if (sort === PostSort.RECENTLY_COMMENTED) {
      orderBy.push({ lastCommentAt: { sort: 'desc', nulls: 'last' } });
    } else if (sort === PostSort.OLDEST) {
      orderBy.push({ createdAt: 'asc' });
    } else {
      orderBy.push({ createdAt: 'desc' });
    }
  
    const [posts, total] = await Promise.all([
      this.postsRepository.findMany({
        skip,
        take: limit,
        orderBy,
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

  async findOne(id: string): Promise<Post> {
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

  async updateLastCommentAt(id: string, date: Date): Promise<void> {
    await this.postsRepository.update(id, { lastCommentAt: date });
  }
}






