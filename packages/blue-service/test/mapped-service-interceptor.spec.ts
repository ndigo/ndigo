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

    test('it should default match implementation to true', () => {
        const mapped = new MappedServiceInterceptor({ preInit: () => true }, ['/']);

        expect(mapped.matches('/any/path')).toBe(true);
    });
});
