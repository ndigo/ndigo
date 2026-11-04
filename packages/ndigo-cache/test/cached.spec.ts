/**
 * @module ndigo-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { MemoryCacheManager } from '../src/cache-manager';
import type { CacheManager } from '../src/cache-manager';
import { CacheMiss, MemoryCache } from '../src/cache';
import type { Cache } from '../src/cache';
import type { CachedSpec } from '../src/cached';
import { cached, getCachedSpec, resolveCachedSpec } from '../src/cached';
import { serializeCacheKey } from '../src/keys';
import { ContextToken } from '@ndigo/context';

function gate() {
    let release!: () => void;
    const promise = new Promise<void>((resolve) => {
        release = resolve;
    });
    return { promise, release };
}

class DeferredMemoryCache extends MemoryCache<unknown> {
    readonly readStarted = gate();
    readonly writeStarted = gate();
    readonly readGate = gate();
    readonly writeGate = gate();

    override async get(key: string): Promise<unknown | CacheMiss> {
        this.readStarted.release();
        await this.readGate.promise;
        return super.get(key);
    }

    override async set(key: string, value: unknown, ttl?: number): Promise<void> {
        this.writeStarted.release();
        await this.writeGate.promise;
        await super.set(key, value, ttl);
    }
}

function managerFor(store: Cache<unknown>): CacheManager {
    return {
        getCache<V = unknown>(): Cache<V> {
            return store as Cache<V>;
        },
        hasCache: () => true,
    };
}

describe('resolveCachedSpec', () => {
    test('rejects malformed specs at decoration time', () => {
        expect(() => resolveCachedSpec({ ttl: -1 })).toThrow(TypeError);
        expect(() => resolveCachedSpec({ ttl: Number.NaN })).toThrow(TypeError);
        expect(() => resolveCachedSpec({ cacheName: '' })).toThrow(TypeError);
        expect(() => resolveCachedSpec({ key: 42 } as unknown as CachedSpec)).toThrow(TypeError);
        expect(() => resolveCachedSpec(null as unknown as CachedSpec)).toThrow(TypeError);
    });
});

describe('cache-store tokens (AD-34 D7)', () => {
    const REPORTS_CACHE = new ContextToken<Cache<string>>('reports');

    class Service {
        cacheManager = new MemoryCacheManager();
        invocations = 0;

        @cached({ cache: REPORTS_CACHE, ttl: 60_000 })
        async report(id: string): Promise<string> {
            this.invocations += 1;
            return `${id}-${this.invocations}`;
        }
    }

    test('token-keyed caching shares the store with the string form and supports eviction', async () => {
        const service = new Service();
        const first = await service.report('a');

        expect(await service.cacheManager.getCache('reports').get(serializeCacheKey('a'))).toBe(first);
        expect(await service.report('a')).toBe(first);
        expect(service.invocations).toBe(1);

        await service.cacheManager.getCache(REPORTS_CACHE).delete(serializeCacheKey('a'));
        expect(await service.report('a')).not.toBe(first);
        expect(service.invocations).toBe(2);
    });
});

describe('@cached', () => {
    class Service {
        cacheManager = new MemoryCacheManager();
        invocations = 0;

        @cached({ cacheName: 'msgs', ttl: 60_000 })
        async message(id: string): Promise<string> {
            this.invocations += 1;
            return `${id}-${this.invocations}`;
        }
    }

    test('returns the cached value without re-invoking the method', async () => {
        const service = new Service();
        const first = await service.message('a');
        expect(await service.message('a')).toBe(first);
        expect(service.invocations).toBe(1);
    });

    test('keys by serialized arguments (miss on a different key)', async () => {
        const service = new Service();
        expect(await service.message('a')).toBe('a-1');
        expect(await service.message('b')).toBe('b-2');
        expect(await service.message('a')).toBe('a-1');
        expect(service.invocations).toBe(2);
    });

    test('a static string key caches a single method value regardless of args', async () => {
        class Single {
            cacheManager = new MemoryCacheManager();
            invocations = 0;

            @cached({ key: 'fixed' })
            async value(x: number): Promise<string> {
                this.invocations += 1;
                return `v${x}`;
            }
        }
        const s = new Single();
        expect(await s.value(1)).toBe('v1');
        expect(await s.value(2)).toBe('v1');
        expect(s.invocations).toBe(1);
    });

    test('expires entries per the spec ttl', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            const service = new Service();
            const first = await service.message('a');
            expect(await service.message('a')).toBe(first);
            expect(service.invocations).toBe(1);
            vi.advanceTimersByTime(60_001);
            expect(await service.message('a')).not.toBe(first);
            expect(service.invocations).toBe(2);
        } finally {
            vi.useRealTimers();
        }
    });

    test('caches the settled value and never caches computation rejections', async () => {
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

    test('calls through without a cacheManager', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            class Bare {
                invocations = 0;

                @cached()
                async value(): Promise<number> {
                    this.invocations += 1;
                    return this.invocations;
                }
            }
            const bare = new Bare();
            expect(await bare.value()).toBe(1);
            expect(await bare.value()).toBe(2);
        } finally {
            warn.mockRestore();
        }
    });

    test('calls through on a detached invocation with an undefined receiver', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            let invocations = 0;
            class Detached {
                @cached()
                async value(): Promise<number> {
                    invocations += 1;
                    return invocations;
                }
            }
            const { value } = new Detached();
            // Before the guard this threw "Cannot read properties of undefined
            // (reading 'cacheManager')"; it must degrade like @transactional.
            await expect(value()).resolves.toBe(1);
            await expect(value()).resolves.toBe(2);
        } finally {
            warn.mockRestore();
        }
    });

    test('coalesces concurrent computation for the same key', async () => {
        const started = gate();
        const computation = gate();
        class Loader {
            cacheManager = new MemoryCacheManager();
            invocations = 0;

            @cached()
            async load(_id: string): Promise<string> {
                this.invocations += 1;
                started.release();
                await computation.promise;
                return 'done';
            }
        }
        const loader = new Loader();
        const first = loader.load('a');
        await started.promise;
        const second = loader.load('a');
        expect(loader.invocations).toBe(1);
        computation.release();
        expect(await Promise.all([first, second])).toEqual(['done', 'done']);
        expect(await loader.load('a')).toBe('done');
        expect(loader.invocations).toBe(1);
    });

    test('coalesces calls throughout deferred cache reads and writes', async () => {
        const store = new DeferredMemoryCache();
        class Loader {
            cacheManager = managerFor(store);
            invocations = 0;

            @cached()
            async load(_id: string): Promise<string> {
                this.invocations += 1;
                return `result-${this.invocations}`;
            }
        }
        const loader = new Loader();
        const first = loader.load('a');
        await store.readStarted.promise;
        const duringRead = loader.load('a');
        expect(loader.invocations).toBe(0);

        store.readGate.release();
        await store.writeStarted.promise;
        expect(loader.invocations).toBe(1);
        const duringWrite = loader.load('a');
        store.writeGate.release();

        expect(await Promise.all([first, duringRead, duringWrite])).toEqual(['result-1', 'result-1', 'result-1']);
        expect(await loader.load('a')).toBe('result-1');
        expect(loader.invocations).toBe(1);
    });

    test('isolates the same method and key across separate managers and stores', async () => {
        const computation = gate();
        class Loader {
            cacheManager = new MemoryCacheManager();
            invocations = 0;

            constructor(readonly label: string) {}

            @cached()
            async load(id: string): Promise<string> {
                this.invocations += 1;
                await computation.promise;
                return `${this.label}-${id}`;
            }
        }
        const left = new Loader('left');
        const right = new Loader('right');
        const first = left.load('a');
        const second = right.load('a');
        computation.release();
        expect(await Promise.all([first, second])).toEqual(['left-a', 'right-a']);
        expect(await left.load('a')).toBe('left-a');
        expect(await right.load('a')).toBe('right-a');
        expect(left.invocations).toBe(1);
        expect(right.invocations).toBe(1);
    });

    test('propagates a rejected cache read and allows retry', async () => {
        const failure = new Error('read unavailable');
        class RejectingReadCache extends MemoryCache<unknown> {
            private rejectRead = true;

            override async get(key: string): Promise<unknown | CacheMiss> {
                await Promise.resolve();
                if (this.rejectRead) {
                    this.rejectRead = false;
                    throw failure;
                }
                return super.get(key);
            }
        }
        class Loader {
            cacheManager = managerFor(new RejectingReadCache());
            invocations = 0;

            @cached()
            async load(id: string): Promise<string> {
                this.invocations += 1;
                return `v${id}`;
            }
        }
        const loader = new Loader();
        await expect(loader.load('a')).rejects.toBe(failure);
        expect(loader.invocations).toBe(0);
        expect(await loader.load('a')).toBe('va');
        expect(await loader.load('a')).toBe('va');
        expect(loader.invocations).toBe(1);
    });

    test('logs an async cache write rejection and returns the primary result', async () => {
        const failure = new Error('store full');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            class RejectingWriteCache extends MemoryCache<unknown> {
                override async set(_key: string, _value: unknown, _ttl?: number): Promise<void> {
                    await Promise.resolve();
                    throw failure;
                }
            }
            class Loader {
                cacheManager = managerFor(new RejectingWriteCache());
                invocations = 0;

                @cached()
                async load(id: string): Promise<string> {
                    this.invocations += 1;
                    return `v${id}-${this.invocations}`;
                }
            }
            const loader = new Loader();
            expect(await loader.load('a')).toBe('va-1');
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('failed to cache'), { error: 'store full' });
            expect(await loader.load('a')).toBe('va-2');
            expect(loader.invocations).toBe(2);
        } finally {
            warn.mockRestore();
        }
    });

    test('rejects non-method targets', () => {
        const decorator = cached();
        const applyToGetter = decorator as (value: Function, context: unknown) => unknown;
        expect(() => applyToGetter(async () => 1, { kind: 'getter', name: 'value' })).toThrow(TypeError);
    });
});

describe('getCachedSpec (DAT-F13)', () => {
    class Service {
        @cached({ cacheName: 'msgs', ttl: 60_000 })
        async message(id: string): Promise<string> {
            return id;
        }
    }

    test('reads the spec from the class constructor', () => {
        expect(getCachedSpec(Service, 'message')).toEqual({ cacheName: 'msgs', key: undefined, ttl: 60_000 });
    });

    test('reads the spec from an instance by resolving through its constructor', () => {
        // Pre-fix the instance form read `Symbol.metadata` off the instance
        // itself (always absent) and returned undefined despite the JSDoc.
        expect(getCachedSpec(new Service(), 'message')).toEqual(getCachedSpec(Service, 'message'));
    });

    test('returns undefined for an undocumented method', () => {
        expect(getCachedSpec(Service, 'missing')).toBeUndefined();
        expect(getCachedSpec(new Service(), 'missing')).toBeUndefined();
    });
});
