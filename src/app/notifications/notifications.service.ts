import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './repos/notifications.repository';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '@libs/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor(
    private notificationsRepository: NotificationsRepository,
    private readonly configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const firebaseCredentials = this.configService.get('firebase.credential');
    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseCredentials),
      databaseURL: this.configService.get('firebase.databaseURL'),
    });
  }

  async sendPushNotification(token: string, title: string, body: string) {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    try {
      await firebase.messaging().send(message);
    } catch (error) {
      console.log('error', error);
    }
  }

  async createLikeNotification(
    userId: string,
    senderId: string,
    postId: string,
  ): Promise<NotificationResponseDto> {
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    const notification = await this.notificationsRepository.create({
      type: NotificationType.POST_LIKED,
      message: `${sender.name} ${sender.lastName} liked your post`,
      user: {
        connect: { id: userId },
      },
      sender: {
        connect: { id: senderId },
      },
      postId,
    });

    return this.mapToResponseDto(notification);
  }

  async createCommentNotification(
    userId: string,
    senderId: string,
    postId: string,
    commentId: string,
  ): Promise<NotificationResponseDto> {
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    const notification = await this.notificationsRepository.create({
      type: NotificationType.POST_COMMENTED,
      message: `${sender.name} ${sender.lastName} commented on your post`,
      user: {
        connect: { id: userId },
      },
      sender: {
        connect: { id: senderId },
      },
      postId,
      commentId,
    });

    return this.mapToResponseDto(notification);
  }

  async createCommentLikeNotification(
    userId: string,
    senderId: string,
    postId: string,
    commentId: string,
  ): Promise<NotificationResponseDto> {
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    const notification = await this.notificationsRepository.create({
      type: NotificationType.COMMENT_LIKED,
      message: `${sender.name} ${sender.lastName} liked your comment`,
      user: {
        connect: { id: userId },
      },
      sender: {
        connect: { id: senderId },
      },
      postId,
      commentId,
    });

    return this.mapToResponseDto(notification);
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 50,
    isRead?: boolean,
  ): Promise<{
    notifications: NotificationResponseDto[];
    total: number;
    unreadCount: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationsRepository.findByUserId(userId, {
        skip,
        take: limit,
        isRead,
      }),
      this.notificationsRepository.count(userId, isRead),
      this.notificationsRepository.count(userId, false),
    ]);

    return {
      notifications: notifications.map((notification) =>
        this.mapToResponseDto(notification),
      ),
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsRepository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updatedNotification =
      await this.notificationsRepository.markAsRead(id);

    return this.mapToResponseDto(updatedNotification);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.notificationsRepository.markAllAsRead(userId);
    return { count };
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await this.notificationsRepository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationsRepository.delete(id);
  }

  async deleteAllNotifications(userId: string): Promise<{ count: number }> {
    const count = await this.notificationsRepository.deleteAll(userId);
    return { count };
  }

  private mapToResponseDto(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      sender: notification.sender
        ? {
            id: notification.sender.id,
            name: notification.sender.name,
            lastName: notification.sender.lastName,
          }
        : undefined,
      postId: notification.postId,
      commentId: notification.commentId,
      createdAt: notification.createdAt,
    };
  }
}

