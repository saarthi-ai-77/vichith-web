import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from '../identity';

// Mock dependencies
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('../../supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

vi.mock('../tokens', () => ({
  verifyAccessToken: vi.fn(),
}));

import { verifyAccessToken } from '../tokens';

describe('Identity Unification Migration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('identity resolution for BOTH issuers', () => {
    it('resolves a Supabase token directly to the Supabase ID', async () => {
      const mockSupabaseUserId = 'sub-123';
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: mockSupabaseUserId, email: 'test@example.com' } },
        error: null,
      });

      const req = new Request('http://localhost', {
        headers: { authorization: 'Bearer supabasetoken' },
      });

      const identity = await authenticate(req);
      
      expect(identity).not.toBeNull();
      expect(identity?.userId).toBe(mockSupabaseUserId);
      expect(identity?.issuer).toBe('supabase');
      // Should NOT have made a DB call for Supabase token
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('resolves a legacy token with a mapping row to the Supabase ID', async () => {
      const mockLegacyUserId = 'leg-456';
      const mockAuthUserId = 'sub-123';
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: null,
        error: new Error('Invalid token'),
      });
      
      (verifyAccessToken as any).mockReturnValue({
        sub: mockLegacyUserId,
        email: 'legacy@example.com',
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: { auth_user_id: mockAuthUserId },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const req = new Request('http://localhost', {
        headers: { authorization: 'Bearer legacytoken' },
      });

      const identity = await authenticate(req);
      
      expect(identity).not.toBeNull();
      expect(identity?.userId).toBe(mockAuthUserId);
      expect(identity?.issuer).toBe('legacy');
    });

    it('resolves a legacy token WITHOUT a mapping row to the Legacy ID', async () => {
      const mockLegacyUserId = 'leg-999';
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: null,
        error: new Error('Invalid token'),
      });
      
      (verifyAccessToken as any).mockReturnValue({
        sub: mockLegacyUserId,
        email: 'legacy@example.com',
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      } as any);

      const req = new Request('http://localhost', {
        headers: { authorization: 'Bearer legacytoken2' },
      });

      const identity = await authenticate(req);
      
      expect(identity).not.toBeNull();
      expect(identity?.userId).toBe(mockLegacyUserId);
      expect(identity?.issuer).toBe('legacy');
    });
  });
});
