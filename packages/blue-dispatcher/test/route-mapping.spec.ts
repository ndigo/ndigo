import { describe, test, expect } from 'vitest';
import { routeMapping } from '../src/route-mapping';

describe('routeMapping', () => {
    test('it should throw for empty string route', () => {
        expect(() => routeMapping('')).toThrow('@routeMapping("") is not allowed');
    });

    test('it should accept root route "/"', () => {
        expect(() => routeMapping('/')).not.toThrow();
    });

    test('it should accept normal routes', () => {
        expect(() => routeMapping('/foo')).not.toThrow();
        expect(() => routeMapping('/foo/bar')).not.toThrow();
    });
});
