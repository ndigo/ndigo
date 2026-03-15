import { describe, expect, test } from 'vitest';
import { AbstractViewMapping, AbstractPathViewMapping } from '../src/view-mapping';
import { Route } from '@blue/router';

class TestViewMapping extends AbstractViewMapping {
    target: any;

    constructor(target: any = null) {
        super();
        this.target = target;
    }

    protected _getTarget(route: Route): any {
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
            protected _getTarget(): any {
                return null;
            }
        }

        const mapping = new TestPathMapping();

        expect(mapping.rootTarget).toBeNull();
        expect(mapping.useTrailingSlashMatch).toBe(false);
        expect((mapping as any)._targets).toBeInstanceOf(Map);
    });
});
