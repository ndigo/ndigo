/**
 */
import { describe, expect, test } from 'vitest';
import { MappedServiceInterceptor } from '../src/service';

describe('MappedServiceInterceptor', () => {
    test('it should expose wrapped interceptor', () => {
        const interceptor = {
            preInit: () => true,
        };
        const mapped = new MappedServiceInterceptor(interceptor, ['/api/**'], ['/api/private/**']);

        expect(mapped.interceptor).toBe(interceptor);
    });

    test('it should support include/exclude pattern updates', () => {
        const mapped = new MappedServiceInterceptor({ preInit: () => true }, ['/a']);

        expect(() => mapped.setIncludePatterns(['/v1/**', '/v2/**'])).not.toThrow();
        expect(() => mapped.setExcludePatterns(['/v1/internal/**'])).not.toThrow();
    });

    test('it should match include patterns and reject excluded paths', () => {
        const mapped = new MappedServiceInterceptor(
            { preInit: () => true },
            ['/api/**', '/public/*'],
            ['/api/private/**']
        );

        expect(mapped.matches('/api/users')).toBe(true);
        expect(mapped.matches('/public/home')).toBe(true);
        expect(mapped.matches('/api/private/settings')).toBe(false);
        expect(mapped.matches('/other/path')).toBe(false);
    });

    test('it should use custom matcher when provided', () => {
        const mapped = new MappedServiceInterceptor({ preInit: () => true }, ['GET:/api/users']);

        const matcher = (path: string, pattern: string): boolean => {
            return `${path}` === pattern;
        };

        expect(mapped.matches('GET:/api/users', matcher)).toBe(true);
        expect(mapped.matches('POST:/api/users', matcher)).toBe(false);
    });
});
