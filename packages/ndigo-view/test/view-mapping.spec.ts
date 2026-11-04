/**
 * @module ndigo-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { AbstractViewMapping, AbstractPathViewMapping } from '../src/view-mapping';
import { Route } from '@ndigo/router';

class TestViewMapping extends AbstractViewMapping {
    target: unknown;

    constructor(target: unknown = null) {
        super();
        this.target = target;
    }

    protected _getTarget(route: Route): unknown {
        return this.target;
    }
}

describe('AbstractViewMapping', () => {
    const route = { path: '/test' } as Route;

    test('it should return mapped target when available', () => {
        const mapping = new TestViewMapping('main');

        expect(mapping.getTarget(route)).toBe('main');
    });

    test('it should return default target when mapped target is unavailable', () => {
        const mapping = new TestViewMapping(null);
        mapping.defaultTarget = 'default';

        expect(mapping.getTarget(route)).toBe('default');
    });

    test('it should return null when no target is available', () => {
        const mapping = new TestViewMapping(null);

        expect(mapping.getTarget(route)).toBeNull();
    });

    test('it should initialize path view mapping defaults', () => {
        class TestPathMapping extends AbstractPathViewMapping {
            protected _getTarget(): unknown {
                return null;
            }
        }

        const mapping = new TestPathMapping();

        expect(mapping.rootTarget).toBeNull();
        expect(mapping.useTrailingSlashMatch).toBe(false);
        // Test seam: introspect the protected path-target registry.
        const mappingWithTargets = mapping as unknown as { _targets: Map<string, unknown> };
        expect(mappingWithTargets._targets).toBeInstanceOf(Map);
    });
});
