import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async handleUserCreated(data: any) {
    return this.usersService.createFromClerk({
      clerkUserId: data.id,
      email: data.email_addresses?.[0]?.email_address ?? '',
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
    });
  }

  async handleUserUpdated(data: any) {
    console.log('User updated:', data.id);
  }

  async handleUserDeleted(data: any) {
    console.log('User deleted:', data.id);
  }
}