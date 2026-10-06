/**
 * @module blue-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import {
    AbstractPathBasedViewResolver,
    ImportViewResolver,
    NameViewResolver,
    ViewResolverComposite,
    AbstractCachingViewResolver,
} from '../src/view-resolver';
import { View } from '../src/view';
import type { ApplicationContext } from '@blue/context';

class TestView {
    mediaType = null;
    render(): void {
        /* no-op */
    }
}

class TestPathBasedViewResolver extends AbstractPathBasedViewResolver {
    protected async _loadView(name: string, language?: unknown): Promise<View> {
        return null;
    }
}

class TestCachingResolver extends AbstractCachingViewResolver {
    loadCount = 0;
    nextView: View | null = { mediaType: null, render: () => null };

    protected async _loadView(name: string, language?: unknown): Promise<View> {
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
        resolver.nextView = new TestView();

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
        } as unknown as ApplicationContext;

        resolver.setApplicationContext(context);

        expect(await resolver.resolveViewName('home')).toBe(view);
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

        const composite = new ViewResolverComposite([first, second]);

        expect(await composite.resolveViewName('home')).toBe(secondView);
    });
});

/** Exposes the protected containment guard for direct testing. */
class ExposedPathResolver extends AbstractPathBasedViewResolver {
    protected async _loadView(_name: string, _language?: unknown): Promise<View | null> {
        return null;
    }

    isSafe(name: string): boolean {
        return this.isSafeViewName(name);
    }
}

describe('AbstractPathBasedViewResolver name containment', () => {
    test('allows legitimate nested, dotted, and underscored names', () => {
        const resolver = new ExposedPathResolver();

        for (const name of ['home', 'admin/user', 'v1.2', 'my.file', 'user_profile', 'a/b/c']) {
            expect(resolver.isSafe(name)).toBe(true);
        }
    });

    test('rejects traversal, absolute, and NUL names', () => {
        const resolver = new ExposedPathResolver();

        for (const name of [
            '/../../etc/passwd',
            '../etc/passwd',
            'a/../../b',
            '..;x=1/..;x=1/tmp/traversed',
            '..',
            '..\\windows',
            '\\absolute',
            'C:\\absolute',
            'a//..;x=1/b',
            'nul\u0000byte',
        ]) {
            expect(resolver.isSafe(name)).toBe(false);
        }
    });

    test('ImportViewResolver resolves unsafe names to null without importing', async () => {
        const resolver = new ImportViewResolver();
        resolver.prefix = './views/';
        resolver.suffix = '.js';
        resolver.isCaching = false;

        expect(await resolver.resolveViewName('/../../../etc/passwd')).toBeNull();
        expect(await resolver.resolveViewName('..;x=1/..;x=1/tmp/traversed')).toBeNull();
        expect(await resolver.resolveViewName('nul\u0000byte')).toBeNull();
    });
});
