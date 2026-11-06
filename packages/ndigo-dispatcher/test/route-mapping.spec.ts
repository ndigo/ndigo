
import { describe, test, expect } from 'vitest';
import { routeMapping } from '../src/route-mapping';
import { getMapping, postMapping } from '../src/http-method-mapping';

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

describe('HTTP verb decorators are method-only', () => {
    test('getMapping throws when applied to a class', () => {
        expect(() => {
            @getMapping('/')
            class Invalid {}
        }).toThrow('@getMapping is method-only');
    });

    test('postMapping throws when applied to a class', () => {
        expect(() => {
            @postMapping('/docs')
            class Invalid {}
        }).toThrow('@postMapping is method-only');
    });
});
