import { describe, expect, test } from 'vitest';
import {
    AbstractPathBasedViewResolver,
    NameViewResolver,
    ViewResolverComposite,
    AbstractCachingViewResolver,
} from '../src/view-resolver';
import { View } from '../src/view';

class TestView {
    mediaType = null;
    render(): void {
        /* no-op */
    }
}

class TestPathBasedViewResolver extends AbstractPathBasedViewResolver {
    protected async _loadView(name: string, language?: any): Promise<View> {
        return null;
    }
}

class TestCachingResolver extends AbstractCachingViewResolver {
    loadCount = 0;
    nextView: View | null = { mediaType: null, render: () => null };

    protected async _loadView(name: string, language?: any): Promise<View> {
        this.loadCount++;
        return this.nextView;
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

    test('it should return unresolved view as null and cache misses', async () => {
        const resolver = new TestCachingResolver();
        resolver.nextView = null;

        expect(await resolver.resolveViewName('home')).toBeNull();
        expect(await resolver.resolveViewName('home')).toBeNull();
        expect(resolver.loadCount).toBe(2);
    });

    test('it should cache resolved views when caching enabled', async () => {
        const resolver = new TestCachingResolver();
        resolver.nextView = new TestView() as any;

        const first = await resolver.resolveViewName('home');
        const second = await resolver.resolveViewName('home');

        expect(first).toBe(second);
        expect(resolver.loadCount).toBe(1);
    });

    test('it should resolve by name from application context', async () => {
        const resolver = new NameViewResolver();
        const view = new TestView();
        const context = {
            hasValue: (name: string) => name === 'home',
            getValue: () => view,
        } as any;

        (resolver as any).setApplicationContext(context);

        expect(await resolver.resolveViewName('home')).toBe(view as any);
        expect(await resolver.resolveViewName('missing')).toBeNull();
    });

    test('it should resolve through ViewResolverComposite', async () => {
        const first = {
            resolveViewName: async () => null,
        };
        const secondView = new TestView();
        const second = {
            resolveViewName: async () => secondView,
        };

        const composite = new ViewResolverComposite([first as any, second as any]);

        expect(await composite.resolveViewName('home')).toBe(secondView as any);
    });
});
