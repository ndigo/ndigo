/** @author Jeff Rose */
import { AuthHeaderInterceptor, DefaultSession } from '@blue/auth';

// Mock HTTP instance (not used by the interceptor but required by interface)
const http: any = {};

describe('AuthHeaderInterceptor', () => {
  describe('preRequest', () => {
    it('should return undefined for unauthenticated session', async () => {
      const session = new DefaultSession();
      const interceptor = new AuthHeaderInterceptor(session);
      
      const req = new Request('http://localhost/api/data', { method: 'GET' });
      const result = await interceptor.preRequest(req, http);
      
      expect(result).toBeUndefined();
    });

    it('should return a Request with Authorization header for authenticated session', async () => {
      const session = new DefaultSession();
      const principal = { 
        id: '1', 
        name: 'Alice', 
        roles: [], 
        hasRole(r: string) { return this.roles.includes(r); },
        hasAnyRole(...rs: string[]) { return rs.some(r => this.roles.includes(r)); }
      };
      
      session.setPrincipal(principal, 'abc123');
      const interceptor = new AuthHeaderInterceptor(session);
      
      const req = new Request('http://localhost/api/data', { method: 'GET' });
      const result = await interceptor.preRequest(req, http);
      
      expect(result).toBeDefined();
      expect(result?.headers.get('Authorization')).toBe('Bearer abc123');
    });

    it('should not mutate the original request object', async () => {
      const session = new DefaultSession();
      const principal = { 
        id: '1', 
        name: 'Alice', 
        roles: [], 
        hasRole(r: string) { return this.roles.includes(r); },
        hasAnyRole(...rs: string[]) { return rs.some(r => this.roles.includes(r)); }
      };
      
      session.setPrincipal(principal, 'abc123');
      const interceptor = new AuthHeaderInterceptor(session);
      
      const originalReq = new Request('http://localhost/api/data', { method: 'GET' });
      const originalHeaders = new Headers(originalReq.headers);
      
      await interceptor.preRequest(originalReq, http);
      
      // Check that original request wasn't mutated
      expect(originalReq.headers.get('Authorization')).toBeNull();
      
      // Compare headers by checking their entries
      const originalEntries = Array.from(originalHeaders.entries());
      const currentEntries = Array.from(originalReq.headers.entries());
      expect(currentEntries).toEqual(originalEntries);
    });

    it('should set correct Authorization header for different token values', async () => {
      const session = new DefaultSession();
      const principal = { 
        id: '1', 
        name: 'Alice', 
        roles: [], 
        hasRole(r: string) { return this.roles.includes(r); },
        hasAnyRole(...rs: string[]) { return rs.some(r => this.roles.includes(r)); }
      };
      
      session.setPrincipal(principal, 'xyz789');
      const interceptor = new AuthHeaderInterceptor(session);
      
      const req = new Request('http://localhost/api/data', { method: 'GET' });
      const result = await interceptor.preRequest(req, http);
      
      expect(result).toBeDefined();
      expect(result?.headers.get('Authorization')).toBe('Bearer xyz789');
    });
  });
});