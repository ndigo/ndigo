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
    isSafeViewName,
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
    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
        return null;
    }
}

class TestCachingResolver extends AbstractCachingViewResolver {
    loadCount = 0;
    nextView: View | null = { mediaType: null, render: () => undefined };

    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
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

    test('does not collide the (user_en, US) and (user, en_US) cache keys (DSV-VIEW-3)', async () => {
        const resolver = new KeyedCachingResolver();

        const first = await resolver.resolveViewName('user_en', 'US');
        const second = await resolver.resolveViewName('user', 'en_US');

        // Pre-fix both pairs keyed to `user_en_US`, so the second call returned
        // the first (wrong) view and never loaded the real one.
        expect(first).not.toBe(second);
        expect(resolver.loaded).toEqual(['user_en|US', 'user|en_US']);
    });

    test('bounds the cache, evicting the oldest entries (DSV-VIEW-3)', async () => {
        const resolver = new KeyedCachingResolver();

        for (let index = 0; index < 1100; index++) {
            // eslint-disable-next-line no-await-in-loop -- each name must resolve before the next (FIFO-eviction assertion)
            await resolver.resolveViewName(`view-${index}`);
        }

        expect(Object.keys(resolver.cache).length).toBeLessThanOrEqual(1024);
        expect(resolver.cache[JSON.stringify(['view-0', ''])]).toBeUndefined();
        expect(resolver.cache[JSON.stringify(['view-1099', ''])]).toBeDefined();
    });
});

/** A caching resolver whose loaded view records the exact name/language pair. */
class KeyedCachingResolver extends AbstractCachingViewResolver {
    loaded: string[] = [];

    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
        const pair = `${name}|${String(language ?? '')}`;
        this.loaded.push(pair);
        return { mediaType: null, render: () => undefined } as View;
    }
}

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
            // drive-relative (VIEW-7): any drive specifier is rejected, not
            // only `C:\` — `C:foo` escapes via the drive's working directory.
            'C:foo',
            'c:relative',
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

        // These literals must be REJECTED by the resolver — the lint rule
        // (no-unsafe-view-name-literal) is intentionally inverted proof here.
        // eslint-disable-next-line @blue/no-unsafe-view-name-literal -- traversal probe must reach the resolver
        expect(await resolver.resolveViewName('/../../../etc/passwd')).toBeNull();
        // eslint-disable-next-line @blue/no-unsafe-view-name-literal -- matrix-param traversal probe
        expect(await resolver.resolveViewName('..;x=1/..;x=1/tmp/traversed')).toBeNull();
        // eslint-disable-next-line @blue/no-unsafe-view-name-literal -- NUL probe
        expect(await resolver.resolveViewName('nul\u0000byte')).toBeNull();
    });
});

/**
 * Shared view-name safety vector table (REU-2 / VIEW-7). The
 * `no-unsafe-view-name-literal` lint rule asserts the same table, so the
 * runtime predicate and the lint grammar cannot drift.
 */
const UNSAFE_VIEW_NAMES = [
    'a\u0000b', // NUL, truncates native paths
    '/x', // POSIX absolute
    '\\x', // backslash absolute
    'C:\\x', // Windows absolute
    'C:foo', // Windows drive-relative (VIEW-7)
    '..', // parent segment
    '..;a=1', // parent segment with matrix param
    '.. ', // parent segment with trailing space
    '..\\x',
] as const;

const SAFE_VIEW_NAMES = ['v1.2', 'admin/user', 'home', 'my.file', 'user_profile'] as const;

describe('isSafeViewName predicate (REU-2/VIEW-7)', () => {
    test('rejects every unsafe form in the shared vector table', () => {
        for (const name of UNSAFE_VIEW_NAMES) {
            expect(isSafeViewName(name), `expected ${JSON.stringify(name)} to be unsafe`).toBe(false);
        }
    });

    test('accepts legitimate nested, dotted, and underscored names', () => {
        for (const name of SAFE_VIEW_NAMES) {
            expect(isSafeViewName(name), `expected ${JSON.stringify(name)} to be safe`).toBe(true);
        }
    });

    test('the resolver class delegates to the module predicate', () => {
        const resolver = new ExposedPathResolver();
        for (const name of [...UNSAFE_VIEW_NAMES, ...SAFE_VIEW_NAMES]) {
            expect(resolver.isSafe(name)).toBe(isSafeViewName(name));
        }
    });
});
