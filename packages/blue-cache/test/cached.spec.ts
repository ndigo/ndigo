/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { MemoryCacheManager } from '../src/cache-manager';
import { CacheMiss } from '../src/cache';
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
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
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
        warn.mockRestore();
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

    test('coalesces concurrent async calls for the same key (single-flight, S1)', async () => {
        let invocations = 0;
        let release!: (value: string) => void;
        const gate = new Promise<string>((resolve) => {
            release = resolve;
        });
        class Loader {
            cacheManager = new MemoryCacheManager();

            @cached()
            async load(_id: string): Promise<string> {
                invocations += 1;
                return gate;
            }
        }
        const loader = new Loader();
        const p1 = loader.load('a');
        const p2 = loader.load('a');
        expect(p1).toBe(p2); // same in-flight promise while pending
        expect(invocations).toBe(1); // second caller did not re-invoke the target
        release('done');
        expect(await p1).toBe('done');
        expect(await p2).toBe('done');
        // Settled value is cached; a later call does not re-invoke.
        expect(await loader.load('a')).toBe('done');
        expect(invocations).toBe(1);
    });

    test('logs and swallows a cache write failure without breaking the result (S2)', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const throwingStore = {
            get: () => CacheMiss.INSTANCE,
            set: () => {
                throw new Error('store full');
            },
            has: () => false,
            delete: () => false,
            clear: () => undefined,
            get size() {
                return 0;
            },
        };
        const manager = { getCache: () => throwingStore };
        class Svc {
            cacheManager = manager as unknown as import('../src/cache-manager').CacheManager;
            invocations = 0;

            @cached()
            async load(id: string): Promise<string> {
                this.invocations += 1;
                return `v${id}`;
            }
        }
        const svc = new Svc();
        await expect(svc.load('a')).resolves.toBe('va'); // primary result intact
        expect(svc.invocations).toBe(1);
        expect(warn).toHaveBeenCalled(); // the write failure was surfaced, not silent
        warn.mockRestore();
    });

    test('warns once when degrading without a cacheManager in dev mode (S3)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
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
        expect(bare.value()).toBe(2); // still degrades correctly — no cache
        expect(warn).toHaveBeenCalledTimes(1); // one-time, not per call
        warn.mockRestore();
    });
    test('rejects non-method targets', () => {
        const decorator = cached();
        // TS types the decorator for method contexts only — a getter context
        // is the runtime failure case, exercised through the untyped seam.
        const applyToGetter = decorator as (value: Function, context: unknown) => unknown;
        expect(() => applyToGetter(() => 1, { kind: 'getter', name: 'value' })).toThrow(TypeError);
    });
});
