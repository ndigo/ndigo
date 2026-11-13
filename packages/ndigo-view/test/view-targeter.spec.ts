/**
 */
import { describe, expect, it, vi } from 'vitest';
import {
    BoundedCache,
    FixedViewTargeter,
    MAX_VIEW_CACHE_ENTRIES,
    ViewTargeter,
    ViewTargeterComposite,
    ViewTargetingContext,
    ViewTarget,
    likeViewTarget,
} from '../src/index';

const context = (viewName: string | null = null): ViewTargetingContext =>
    ({ route: { path: '/' }, viewName, view: null, model: null, language: 'en' }) as ViewTargetingContext;

const target = (label: string): ViewTarget =>
    ({
        prepare: () => undefined,
        commit: () => undefined,
        clear: () => undefined,
        label,
    }) as ViewTarget & { label: string };

const targeter = (resolve: ViewTargeter['resolveViewTarget']): ViewTargeter => ({ resolveViewTarget: resolve });

describe('likeViewTarget', () => {
    it('accepts a target-shaped object', () => {
        expect(likeViewTarget(target('a'))).toBe(true);
    });

    it('rejects primitives, arrays, and partial shapes', () => {
        expect(likeViewTarget('#footer')).toBe(false);
        expect(likeViewTarget(null)).toBe(false);
        expect(likeViewTarget(undefined)).toBe(false);
        expect(likeViewTarget({})).toBe(false);
        expect(likeViewTarget([target('a')])).toBe(false);
        expect(likeViewTarget({ prepare: () => undefined, commit: () => undefined })).toBe(false);
    });
});

describe('ViewTargeterComposite', () => {
    it('returns the first non-null target and never consults later delegates', async () => {
        const b = target('b'),
            first = vi.fn(() => null),
            second = vi.fn(() => b),
            third = vi.fn(() => target('c'));
        const composite = new ViewTargeterComposite([targeter(first), targeter(second), targeter(third)]);

        await expect(composite.resolveViewTarget(context())).resolves.toBe(b);
        expect(first).toHaveBeenCalledTimes(1);
        expect(third).not.toHaveBeenCalled();
    });

    it('accepts synchronous and asynchronous targeters in one chain', async () => {
        const sync = targeter(() => target('sync'));
        const asyncTargeter = targeter(async () => target('async'));

        await expect(
            new ViewTargeterComposite([sync, asyncTargeter]).resolveViewTarget(context())
        ).resolves.toMatchObject({ label: 'sync' });
        await expect(new ViewTargeterComposite([asyncTargeter]).resolveViewTarget(context())).resolves.toMatchObject({
            label: 'async',
        });
    });

    it('returns null when every delegate declines', async () => {
        await expect(
            new ViewTargeterComposite([targeter(() => null)]).resolveViewTarget(context())
        ).resolves.toBeNull();
    });

    it('returns null for an empty chain', async () => {
        await expect(new ViewTargeterComposite().resolveViewTarget(context())).resolves.toBeNull();
    });
});

describe('FixedViewTargeter', () => {
    it('always returns the same target', () => {
        const fixed = target('fixed');
        const fixedTargeter = new FixedViewTargeter(fixed);

        expect(fixedTargeter.resolveViewTarget(context())).toBe(fixed);
        expect(fixedTargeter.resolveViewTarget(context('other'))).toBe(fixed);
    });
});

describe('BoundedCache onEvict', () => {
    it('reports the evicted value and key exactly once', () => {
        const evicted = vi.fn();
        const cache = new BoundedCache<number>(evicted);

        for (let index = 0; index < MAX_VIEW_CACHE_ENTRIES; index++) {
            cache.set(`k${index}`, index);
        }
        expect(evicted).not.toHaveBeenCalled();

        cache.set('overflow', -1);
        expect(evicted).toHaveBeenCalledTimes(1);
        expect(evicted).toHaveBeenCalledWith(0, 'k0');
        expect(cache.get('k0')).toBeUndefined();
        expect(cache.size).toBe(MAX_VIEW_CACHE_ENTRIES);
    });

    it('does not evict when re-setting an existing key', () => {
        const evicted = vi.fn();
        const cache = new BoundedCache<number>(evicted);

        for (let index = 0; index < MAX_VIEW_CACHE_ENTRIES; index++) {
            cache.set(`k${index}`, index);
        }
        cache.set('k0', 42);

        expect(evicted).not.toHaveBeenCalled();
        expect(cache.get('k0')).toBe(42);
    });
});
