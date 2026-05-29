/** @author Jeff Rose */
import '@tsmetadata/polyfill';
import { authenticated, authorized, AuthRouteGuard, DefaultSession } from '@blue/auth';

// Mock route
const route: any = { path: '/test' };

// Helper to build a fake handler (mimics RouteHandlerMethod shape)
function makeHandler(metadata: Record<string, unknown>, methodName: string | null) {
  const ctor = function FakeController() {};
  ctor[Symbol.metadata] = metadata;
  return {
    handler: new ctor() as any,
    method: methodName,
  };
}

describe('AuthRouteGuard', () => {
  describe('preHandle', () => {
    it('should return true for public route (no auth metadata) with unauthenticated session', async () => {
      const session = new DefaultSession();
      const guard = new AuthRouteGuard(session);
      
      const handler = makeHandler({}, null);
      const result = await guard.preHandle(route, handler);
      expect(result).toBe(true);
    });

    it('should return false for class-level auth required with unauthenticated session', async () => {
      const session = new DefaultSession();
      const guard = new AuthRouteGuard(session);
      
      const handler = makeHandler({ 'auth:required': true }, null);
      const result = await guard.preHandle(route, handler);
      expect(result).toBe(false);
    });

    it('should return true for class-level auth required with authenticated session', async () => {
      const session = new DefaultSession();
      const principal = { 
        id: '1', 
        name: 'Alice', 
        roles: [], 
        hasRole(r: string) { return this.roles.includes(r); },
        hasAnyRole(...rs: string[]) { return rs.some(r => this.roles.includes(r)); }
      };
      
      session.setPrincipal(principal, 'token123');
      const guard = new AuthRouteGuard(session);
      
      const handler = makeHandler({ 'auth:required': true }, null);
      const result = await guard.preHandle(route, handler);
      expect(result).toBe(true);
    });

    it('should return false for method-level auth required with unauthenticated session', async () => {
      const session = new DefaultSession();
      const guard = new AuthRouteGuard(session);
      
      const handler = makeHandler({ 'auth:required:methodName': true }, 'methodName');
      const result = await guard.preHandle(route, handler);
      expect(result).toBe(false);
    });

    it('should return true for method-level auth required with authenticated session', async () => {
      const session = new DefaultSession();
      const principal = { 
        id: '1', 
        name: 'Alice', 
        roles: [], 
        hasRole(r: string) { return this.roles.includes(r); },
        hasAnyRole(...rs: string[]) { return rs.some(r => this.roles.includes(r)); }
      };
      
      session.setPrincipal(principal, 'token123');
      const guard = new AuthRouteGuard(session);
      
      const handler = makeHandler({ 'auth:required:methodName': true }, 'methodName');
      const result = await guard.preHandle(route, handler);
      expect(result).toBe(true);
    });

    it('should return false for role required but principal missing role', async () => {
      const session = new DefaultSession();
      const principal = { 
        id: '1', 
        name: 'Alice', 
        roles: [], 
        hasRole(r: string) { return this.roles.includes(r); },
        hasAnyRole(...rs: string[]) { return rs.some(r => this.roles.includes(r)); }
      };
      
      session.setPrincipal(principal, 'token123');
      const guard = new AuthRouteGuard(session);
      
      const handler = makeHandler({ 'auth:roles': ['admin'] }, null);
      const result = await guard.preHandle(route, handler);
      expect(result).toBe(false);
    });

    it('should return true for role required and principal has role', async () => {
      const session = new DefaultSession();
      const principal = { 
        id: '1', 
        name: 'Alice', 
        roles: ['admin'], 
        hasRole(r: string) { return this.roles.includes(r); },
        hasAnyRole(...rs: string[]) { return rs.some(r => this.roles.includes(r)); }
      };
      
      session.setPrincipal(principal, 'token123');
      const guard = new AuthRouteGuard(session);
      
      const handler = makeHandler({ 'auth:roles': ['admin'] }, null);
      const result = await guard.preHandle(route, handler);
      expect(result).toBe(true);
    });
  });

  describe('postHandle and completeHandle', () => {
    it('should resolve without error for postHandle', async () => {
      const session = new DefaultSession();
      const guard = new AuthRouteGuard(session);
      
      await expect(guard.postHandle(route, {})).resolves.toBeUndefined();
    });

    it('should resolve without error for completeHandle', async () => {
      const session = new DefaultSession();
      const guard = new AuthRouteGuard(session);
      
      await expect(guard.completeHandle(route, {})).resolves.toBeUndefined();
    });
  });
});