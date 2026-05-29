/** @author Jeff Rose */
import '@tsmetadata/polyfill';
import { authenticated, authorized } from '@blue/auth';

describe('Decorators', () => {
  describe('@authenticated', () => {
    it('should set auth:required metadata on class', () => {
      @authenticated
      class SecureController {}

      const metadata = SecureController[Symbol.metadata];
      expect(metadata['auth:required']).toBe(true);
    });

    it('should set auth:required metadata on method', () => {
      class MixedController {
        @authenticated
        secureMethod() {}
      }

      const metadata = MixedController[Symbol.metadata];
      expect(metadata['auth:required:secureMethod']).toBe(true);
    });
  });

  describe('@authorized', () => {
    it('should add role to auth:roles metadata on class', () => {
      @authorized('admin')
      class AdminController {}

      const metadata = AdminController[Symbol.metadata];
      expect(metadata['auth:roles']).toEqual(['admin']);
    });

    it('should add role to auth:roles metadata on method', () => {
      class MixedController {
        @authorized('admin')
        adminMethod() {}
      }

      const metadata = MixedController[Symbol.metadata];
      expect(metadata['auth:roles:adminMethod']).toEqual(['admin']);
    });

    it('should accumulate roles when multiple decorators are applied', () => {
      @authorized('superuser')
      @authorized('admin')
      class AdminController {}

      const metadata = AdminController[Symbol.metadata];
      const roles = metadata['auth:roles'];
      
      // Check that both roles are present (order may vary due to decorator evaluation)
      expect(roles).toContain('superuser');
      expect(roles).toContain('admin');
    });
  });
});