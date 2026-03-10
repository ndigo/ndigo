import { describe, expect, test } from 'vitest';
import { AbstractPathBasedViewResolver } from '../src/view-resolver';
import { View } from '../src/view';

class TestPathBasedViewResolver extends AbstractPathBasedViewResolver {
    protected async _loadView(name: string, language?: any): Promise<View> {
        return null;
    }
}

describe('AbstractPathBasedViewResolver', () => {
    test('it should not support any view names when viewNames is null', () => {
        const resolver = new TestPathBasedViewResolver();

        expect(resolver.supports('home')).toBe(false);
    });

    test('it should support matching string view names', () => {
        const resolver = new TestPathBasedViewResolver();
        resolver.viewNames = ['home', 'about'];

        expect(resolver.supports('home')).toBe(true);
        expect(resolver.supports('contact')).toBe(false);
    });

    test('it should support matching RegExp view names', () => {
        const resolver = new TestPathBasedViewResolver();
        resolver.viewNames = [/^users\/.+$/];

        expect(resolver.supports('users/123')).toBe(true);
        expect(resolver.supports('posts/123')).toBe(false);
    });
});
