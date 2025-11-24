import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: Prisma.UserWhereUniqueInput, select?: Prisma.UserSelect): Promise<User> {
    return this.prisma.user.findUnique({ where, select });
  }

  async findOneById(id: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(
    user: Pick<
      User,
      'role' | 'gender' | 'email' | 'name' | 'lastName'
    >,
  ): Promise<User> {
    return await this.prisma.user.create({
      data: {
        role: user.role,
        gender: user.gender,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
      },
    });
  }

  async updateRtHash(userId: string, hashedRt: string): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hashedRt,
      },
    });
  }

  async deleteRtHash(user: Pick<User, 'id'>): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedRt: null,
      },
    });
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
