/** @author Jeff Rose */
import { AnonymousPrincipal, isPrincipal } from '@blue/auth';

describe('Principal', () => {
  describe('AnonymousPrincipal', () => {
    it('should have id="anonymous", name="Anonymous", and roles=[]', () => {
      const principal = new AnonymousPrincipal();
      expect(principal.id).toBe('anonymous');
      expect(principal.name).toBe('Anonymous');
      expect(principal.roles).toEqual([]);
    });

    it('should return false for hasRole("admin")', () => {
      const principal = new AnonymousPrincipal();
      expect(principal.hasRole('admin')).toBe(false);
    });

    it('should return false for hasAnyRole("admin", "user")', () => {
      const principal = new AnonymousPrincipal();
      expect(principal.hasAnyRole('admin', 'user')).toBe(false);
    });
  });

  describe('isPrincipal', () => {
    it('should return true for a custom principal object with roles', () => {
      const user = {
        id: '1',
        name: 'Alice',
        roles: ['admin', 'user'],
        hasRole(r: string) { return this.roles.includes(r); },
        hasAnyRole(...rs: string[]) { return rs.some(r => this.roles.includes(r)); }
      };
      
      expect(isPrincipal(user)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isPrincipal(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isPrincipal(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isPrincipal('test')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isPrincipal(42)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isPrincipal({})).toBe(false);
    });
  });
});