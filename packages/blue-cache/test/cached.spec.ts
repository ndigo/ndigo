/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { MemoryCacheManager } from '../src/cache-manager';
import type { CachedSpec } from '../src/cached';
import { DEFAULT_CACHE_NAME, cached, getCachedSpec, resolveCachedSpec } from '../src/cached';

describe('resolveCachedSpec', () => {
    test('defaults cacheName and accepts an omitted spec', () => {
        expect(resolveCachedSpec()).toEqual({ cacheName: 'default', key: undefined, ttl: undefined });
        expect(resolveCachedSpec({})).toEqual({ cacheName: 'default', key: undefined, ttl: undefined });
        expect(resolveCachedSpec({ cacheName: 'users' })).toEqual({
            cacheName: 'users',
            key: undefined,
            ttl: undefined,
        });
    });

    test('rejects malformed specs at decoration time', () => {
        expect(() => resolveCachedSpec({ ttl: -1 })).toThrow(TypeError);
        expect(() => resolveCachedSpec({ ttl: Number.NaN })).toThrow(TypeError);
        expect(() => resolveCachedSpec({ cacheName: '' })).toThrow(TypeError);
        expect(() => resolveCachedSpec({ key: 42 } as unknown as CachedSpec)).toThrow(TypeError);
        expect(() => resolveCachedSpec(null as unknown as CachedSpec)).toThrow(TypeError);
    });
});

describe('@cached', () => {
    class Service {
        cacheManager = new MemoryCacheManager();
        invocations = 0;

        @cached({ cacheName: 'msgs', ttl: 60_000 })
        message(id: string): string {
            this.invocations += 1;
            return `${id}-${this.invocations}`;
        }
    }

    test('returns the cached value without re-invoking the method', () => {
        const service = new Service();
        const first = service.message('a');
        expect(service.message('a')).toBe(first);
        expect(service.invocations).toBe(1);
    });

    test('keys by serialized arguments (miss on a different key)', () => {
        const service = new Service();
        service.message('a');
        service.message('b');
        expect(service.invocations).toBe(2);
    });

    test('a static string key caches a single method value regardless of args', () => {
        class Single {
            cacheManager = new MemoryCacheManager();
            invocations = 0;

            @cached({ key: 'fixed' })
            value(x: number): string {
                this.invocations += 1;
                return `v${x}`;
            }
        }
        const s = new Single();
        expect(s.value(1)).toBe('v1');
        expect(s.value(2)).toBe('v1');
        expect(s.invocations).toBe(1);
    });

    test('expires entries per the spec ttl', () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            const service = new Service();
            service.message('a');
            service.message('a');
            expect(service.invocations).toBe(1);
            vi.advanceTimersByTime(60_001);
            service.message('a');
            expect(service.invocations).toBe(2);
        } finally {
            vi.useRealTimers();
        }
    });

    test('async methods cache the settled value and never cache rejections', async () => {
        class Loader {
            cacheManager = new MemoryCacheManager();
            invocations = 0;

            @cached()
            async load(id: string): Promise<string> {
                this.invocations += 1;
                if (this.invocations === 1) {
                    throw new Error('boom');
                }
                return `v${id}`;
            }
        }
        const loader = new Loader();
        await expect(loader.load('a')).rejects.toThrow('boom');
        expect(await loader.load('a')).toBe('va');
        expect(await loader.load('a')).toBe('va');
        expect(loader.invocations).toBe(2);
    });

    test('degenerates gracefully without a cacheManager (plain unit-test posture)', () => {
        class Bare {
            invocations = 0;

            @cached()
            value(): number {
                this.invocations += 1;
                return this.invocations;
            }
        }
        const bare = new Bare();
        expect(bare.value()).toBe(1);
        expect(bare.value()).toBe(2); // no cache → always computed
    });

    test('writes the normalized spec to Symbol.metadata (getCachedSpec)', () => {
        class Meta {
            @cached({ cacheName: 'named', ttl: 5_000 })
            m(): number {
                return 1;
            }
        }
        expect(getCachedSpec(Meta, 'm')).toEqual({ cacheName: 'named', key: undefined, ttl: 5_000 });
        expect(getCachedSpec(Meta, 'missing')).toBeUndefined();
    });

    test('uses the default named cache when cacheName is omitted', () => {
        class Plain {
            cacheManager = new MemoryCacheManager();

            @cached()
            m(): number {
                return 1;
            }
        }
        const plain = new Plain();
        expect(plain.m()).toBe(1);
        expect(plain.cacheManager.hasCache(DEFAULT_CACHE_NAME)).toBe(true);
    });

    test('rejects non-method targets', () => {
        const decorator = cached();
        // TS types the decorator for method contexts only — a getter context
        // is the runtime failure case, exercised through the untyped seam.
        const applyToGetter = decorator as (value: Function, context: unknown) => unknown;
        expect(() => applyToGetter(() => 1, { kind: 'getter', name: 'value' })).toThrow(TypeError);
    });
});
