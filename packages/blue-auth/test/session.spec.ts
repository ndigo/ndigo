/** @author Jeff Rose */
import { DefaultSession, isSession } from '@blue/auth';

describe('Session', () => {
  describe('DefaultSession', () => {
    it('should have principal=null, token=null, and isAuthenticated=false when new', () => {
      const session = new DefaultSession();
      expect(session.principal).toBeNull();
      expect(session.token).toBeNull();
      expect(session.isAuthenticated).toBe(false);
    });

    it('should set principal and token when setPrincipal is called', () => {
      const session = new DefaultSession();
      const principal = { id: '1', name: 'Alice', roles: [], hasRole: () => false, hasAnyRole: () => false };
      
      session.setPrincipal(principal, 'tok');
      
      expect(session.principal).toBe(principal);
      expect(session.token).toBe('tok');
      expect(session.isAuthenticated).toBe(true);
    });

    it('should reset to initial state when clear is called', () => {
      const session = new DefaultSession();
      const principal = { id: '1', name: 'Alice', roles: [], hasRole: () => false, hasAnyRole: () => false };
      
      session.setPrincipal(principal, 'tok');
      session.clear();
      
      expect(session.principal).toBeNull();
      expect(session.token).toBeNull();
      expect(session.isAuthenticated).toBe(false);
    });
  });

  describe('isSession', () => {
    it('should return true for a DefaultSession instance', () => {
      const session = new DefaultSession();
      expect(isSession(session)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isSession(null)).toBe(false);
    });

    it('should return false for plain object without required props', () => {
      expect(isSession({})).toBe(false);
    });
  });
});