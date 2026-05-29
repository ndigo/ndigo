/** @author Jeff Rose */
import { AuthenticationManager } from '@blue/auth';

describe('AuthenticationManager', () => {
  describe('Initialization', () => {
    it('should have strategyCount === 0 when new', () => {
      const manager = new AuthenticationManager();
      expect(manager.strategyCount).toBe(0);
    });
  });

  describe('register', () => {
    it('should increment strategyCount after registering a strategy', () => {
      const manager = new AuthenticationManager();
      const strategy = {
        supports(c: unknown): c is { username: string } {
          return typeof c === 'object' && c !== null && 'username' in c;
        },
        async authenticate(c: { username: string }) {
          return { id: '1', name: c.username, roles: [], hasRole: () => false, hasAnyRole: () => false };
        }
      };
      
      manager.register(strategy);
      expect(manager.strategyCount).toBe(1);
    });
  });

  describe('authenticate', () => {
    it('should delegate to the matching strategy', async () => {
      const manager = new AuthenticationManager();
      const strategy = {
        supports(c: unknown): c is { username: string } {
          return typeof c === 'object' && c !== null && 'username' in c;
        },
        async authenticate(c: { username: string }) {
          return { id: '1', name: c.username, roles: [], hasRole: () => false, hasAnyRole: () => false };
        }
      };
      
      manager.register(strategy);
      
      const result = await manager.authenticate({ username: 'Alice' });
      expect(result?.name).toBe('Alice');
    });

    it('should throw when no strategy supports the credentials', async () => {
      const manager = new AuthenticationManager();
      const strategy = {
        supports(c: unknown): c is { username: string } {
          return typeof c === 'object' && c !== null && 'username' in c;
        },
        async authenticate(c: { username: string }) {
          return { id: '1', name: c.username, roles: [], hasRole: () => false, hasAnyRole: () => false };
        }
      };
      
      manager.register(strategy);
      
      await expect(manager.authenticate({ token: 'xyz' })).rejects.toThrow(/No AuthenticationStrategy/);
    });

    it('should select the correct strategy when multiple are registered', async () => {
      const manager = new AuthenticationManager();
      
      const strategy1 = {
        supports(c: unknown): c is { username: string } {
          return typeof c === 'object' && c !== null && 'username' in c;
        },
        async authenticate(c: { username: string }) {
          return { id: '1', name: c.username, roles: [], hasRole: () => false, hasAnyRole: () => false };
        }
      };
      
      const strategy2 = {
        supports(c: unknown): c is { token: string } {
          return typeof c === 'object' && c !== null && 'token' in c;
        },
        async authenticate(c: { token: string }) {
          return { id: '2', name: 'TokenUser', roles: [], hasRole: () => false, hasAnyRole: () => false };
        }
      };
      
      manager.register(strategy1);
      manager.register(strategy2);
      
      const result = await manager.authenticate({ token: 'xyz' });
      expect(result?.name).toBe('TokenUser');
    });
  });
});