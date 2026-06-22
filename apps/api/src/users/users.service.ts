import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateClerkUserDto {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createFromClerk(data: CreateClerkUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        clerkUserId: data.clerkUserId,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        clerkUserId: data.clerkUserId,
        email: data.email,
        name: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
      },
    });
  }

  async findByClerkId(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: {
        clerkUserId,
      },
    });
  }
}