import { describe, expect, test } from 'vitest';
import { AbstractViewMapping } from '../src/view-mapping';
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
});
