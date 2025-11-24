import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findByUserId(
    userId: string,
    params?: { skip?: number; take?: number; isRead?: boolean },
  ) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (params?.isRead !== undefined) {
      where.isRead = params.isRead;
    }

    return this.prisma.notification.findMany({
      where,
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }

  async count(userId: string, isRead?: boolean): Promise<number> {
    const where: Prisma.NotificationWhereInput = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    return this.prisma.notification.count({ where });
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({ where: { id } });
  }

  async deleteAll(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });
    return result.count;
  }
}



