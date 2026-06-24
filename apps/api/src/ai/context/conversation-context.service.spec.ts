import { ConversationContextService } from './conversation-context.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ConversationContextService', () => {
  let service: ConversationContextService;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = {} as any; // We only test mergeData which doesn't need Prisma
    service = new ConversationContextService(prismaService);
  });

  describe('mergeData', () => {
    it('should return incoming if existing is null', () => {
      const incoming = { a: 1 };
      expect(service.mergeData({} as any, incoming)).toEqual(incoming);
    });

    it('should return existing if incoming is null', () => {
      const existing = { a: 1 };
      expect(service.mergeData(existing, {} as any)).toEqual(existing);
    });

    it('should merge non-null incoming fields into existing', () => {
      const existing = { leaveType: null, startDate: '2026-06-25' };
      const incoming = { leaveType: 'SICK', startDate: null };

      expect(service.mergeData(existing, incoming)).toEqual({
        leaveType: 'SICK',
        startDate: '2026-06-25',
      });
    });

    it('should overwrite existing non-null fields with incoming non-null fields', () => {
      const existing = { leaveType: 'SICK' };
      const incoming = { leaveType: 'CASUAL' };

      expect(service.mergeData(existing, incoming)).toEqual({
        leaveType: 'CASUAL',
      });
    });

    it('should preserve arrays if incoming is empty', () => {
      const existing = { entries: [{ project: 'frontend', hours: 4 }] };
      const incoming = { entries: [] };

      expect(service.mergeData(existing, incoming)).toEqual({
        entries: [{ project: 'frontend', hours: 4 }],
      });
    });

    it('should merge arrays of objects element by element', () => {
      const existing = { entries: [{ project: 'support', hours: null }] };
      const incoming = { entries: [{ project: null, hours: 0.75 }] };

      expect(service.mergeData(existing, incoming)).toEqual({
        entries: [{ project: 'support', hours: 0.75 }],
      });
    });

    it('should append new items in incoming arrays if it is longer', () => {
      const existing = { entries: [{ project: 'frontend', hours: 4 }] };
      const incoming = {
        entries: [
          { project: null, hours: null },
          { project: 'backend', hours: 2 },
        ],
      };

      expect(service.mergeData(existing, incoming)).toEqual({
        entries: [
          { project: 'frontend', hours: 4 },
          { project: 'backend', hours: 2 },
        ],
      });
    });
  });
});
