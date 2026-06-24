import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConversationContextService {
  constructor(private readonly prisma: PrismaService) {}

  async getContext(userId: string) {
    return this.prisma.conversationContext.findUnique({
      where: { userId },
    });
  }

  async saveContext(
    userId: string,
    intent: string,
    data: any,
    question?: string,
  ) {
    return this.prisma.conversationContext.upsert({
      where: { userId },
      update: {
        intent,
        extractedData: data,
        pendingQuestion: question || null,
      },
      create: {
        userId,
        intent,
        extractedData: data,
        pendingQuestion: question || null,
      },
    });
  }

  async clearContext(userId: string) {
    try {
      await this.prisma.conversationContext.delete({
        where: { userId },
      });
    } catch (e) {
      // Ignore if not found
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        return;
      }
      throw e;
    }
  }

  /**
   * Merges incoming new data into the existing context data.
   * New non-null values overwrite existing values.
   * Existing non-null values are preserved if incoming is null/undefined.
   */
  mergeData(existing: any, incoming: any): any {
    if (!existing) return incoming || {};
    if (!incoming) return existing || {};

    const merged = { ...existing };

    for (const key of Object.keys(incoming)) {
      const incomingValue = incoming[key];
      
      if (Array.isArray(incomingValue) && Array.isArray(existing[key])) {
         // Deep merge arrays element by element
         const mergedArray: any[] = [];
         const maxLength = Math.max(existing[key].length, incomingValue.length);
         
         for (let i = 0; i < maxLength; i++) {
           const existingItem = existing[key][i];
           const incomingItem = incomingValue[i];
           
           if (existingItem && incomingItem) {
             // Both exist, merge their properties
             const mergedItem = { ...existingItem };
             for (const itemKey of Object.keys(incomingItem)) {
               if (incomingItem[itemKey] !== null && incomingItem[itemKey] !== undefined) {
                 mergedItem[itemKey] = incomingItem[itemKey];
               }
             }
             mergedArray.push(mergedItem);
           } else if (incomingItem) {
             mergedArray.push(incomingItem);
           } else if (existingItem) {
             mergedArray.push(existingItem);
           }
         }
         
         if (mergedArray.length > 0) {
           merged[key] = mergedArray;
         }
      } else if (incomingValue !== null && incomingValue !== undefined) {
        merged[key] = incomingValue;
      }
    }

    return merged;
  }
}
