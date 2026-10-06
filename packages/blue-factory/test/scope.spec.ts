/**
 * Behavioral tests for @blue/factory scope decorators (TC39).
 * * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, vi } from 'vitest';
import {
    scope,
    singletonScope,
    prototypeScope,
    hashScope,
    refreshScope,
    defineScope,
    getScope,
    hasScope,
    HashScope,
    PrototypeScope,
    RefreshScope,
    SingletonScope,
} from '../src/scope';

describe('Scope Decorators - TC39 Behavioral Tests', () => {
    describe('@scope decorator', () => {
        it('should store scope metadata on class', () => {
            @scope('singleton')
            class TestService {}

            // TC39 decorators write into Symbol.metadata, which TS's Function type does not declare.
            const metadata = (
                TestService as unknown as {
                    [Symbol.metadata]?: Record<string, unknown>;
                }
            )[Symbol.metadata];
            expect(metadata).toBeDefined();
            expect(metadata?.['scope:mapping']).toBe('singleton');
        });

        it('should work with different scope types', () => {
            @scope('prototype')
            class PrototypeService {}

            @scope('singleton')
            class SingletonService {}

            @scope('route')
            class RouteService {}

            expect(getScope(PrototypeService)).toBe('prototype');
            expect(getScope(SingletonService)).toBe('singleton');
            expect(getScope(RouteService)).toBe('route');
        });

        it('should work with custom scope names', () => {
            @scope('session')
            class SessionService {}

            expect(getScope(SessionService)).toBe('session');
        });

        it('should expose refreshScope convenience decorator', () => {
            @refreshScope
            class RefreshService {}

            expect(getScope(RefreshService)).toBe('refresh');
            expect(hasScope(RefreshService)).toBe(true);
        });

        it('should return original class', () => {
            @scope('singleton')
            class Original {}

            expect(Original.name).toBe('Original');
            expect(typeof Original).toBe('function');
        });
    });

    describe('@singletonScope decorator', () => {
        it('should store singleton scope metadata', () => {
            @singletonScope
            class SingletonService {}

            expect(getScope(SingletonService)).toBe('singleton');
        });

        it('should be equivalent to @scope("singleton")', () => {
            @singletonScope
            class Service1 {}

            @scope('singleton')
            class Service2 {}

            expect(getScope(Service1)).toBe(getScope(Service2));
        });
    });

    describe('@prototypeScope decorator', () => {
        it('should store prototype scope metadata', () => {
            @prototypeScope
            class PrototypeService {}

            expect(getScope(PrototypeService)).toBe('prototype');
        });

        it('should be equivalent to @scope("prototype")', () => {
            @prototypeScope
            class Service1 {}

            @scope('prototype')
            class Service2 {}

            expect(getScope(Service1)).toBe(getScope(Service2));
        });
    });

    describe('@hashScope decorator', () => {
        it('should store hash scope metadata', () => {
            @hashScope
            class HashService {}

            expect(getScope(HashService)).toBe('hash');
        });

        it('should be equivalent to @scope("hash")', () => {
            @hashScope
            class Service1 {}

            @scope('hash')
            class Service2 {}

            expect(getScope(Service1)).toBe(getScope(Service2));
        });
    });

    describe('Helper Functions', () => {
        describe('defineScope', () => {
            it('should define scope metadata on target', () => {
                class TestClass {}
                defineScope('singleton', TestClass);

                expect(getScope(TestClass)).toBe('singleton');
            });
        });

        describe('getScope', () => {
            it('should return scope for decorated class', () => {
                @scope('prototype')
                class Service {}

                expect(getScope(Service)).toBe('prototype');
            });

            it('should return undefined for non-decorated class', () => {
                class PlainClass {}

                expect(getScope(PlainClass)).toBeUndefined();
            });

            it('should work with class instances', () => {
                @scope('singleton')
                class Service {}

                const instance = new Service();
                expect(getScope(instance)).toBe('singleton');
            });
        });

        describe('hasScope', () => {
            it('should return true for decorated class', () => {
                @scope('singleton')
                class Service {}

                expect(hasScope(Service)).toBe(true);
            });

            it('should return false for non-decorated class', () => {
                class PlainClass {}

                expect(hasScope(PlainClass)).toBe(false);
            });

            it('should work with class instances', () => {
                @scope('prototype')
                class Service {}

                const instance = new Service();
                expect(hasScope(instance)).toBe(true);
            });
        });
    });

    describe('Scope Implementations', () => {
        it('SingletonScope should cache and destroy values', () => {
            const singleton = new SingletonScope();
            const objectFactory = vi.fn(() => ({ id: Math.random() }));

            const a = singleton.getValue('value', objectFactory);
            const b = singleton.getValue('value', objectFactory);

            expect(a).toBe(b);
            expect(objectFactory).toHaveBeenCalledTimes(1);

            singleton.destroyValue('value');

            const c = singleton.getValue('value', objectFactory);
            expect(c).not.toBe(a);
            expect(objectFactory).toHaveBeenCalledTimes(2);
        });

        it('RefreshScope should cache one instance per name until clear()', () => {
            const refresh = new RefreshScope();
            const objectFactory = vi.fn(() => ({ id: Math.random() }));

            const a = refresh.getValue('value', objectFactory);
            const b = refresh.getValue('value', objectFactory);

            expect(a).toBe(b);
            expect(objectFactory).toHaveBeenCalledTimes(1);

            refresh.clear();

            const c = refresh.getValue('value', objectFactory);

            expect(c).not.toBe(a);
            expect(objectFactory).toHaveBeenCalledTimes(2);
        });

        it('RefreshScope should clear all names at once', () => {
            const refresh = new RefreshScope();
            const factoryA = vi.fn(() => ({ id: Math.random() }));
            const factoryB = vi.fn(() => ({ id: Math.random() }));

            const a1 = refresh.getValue('a', factoryA);
            const b1 = refresh.getValue('b', factoryB);

            refresh.clear();

            const a2 = refresh.getValue('a', factoryA);
            const b2 = refresh.getValue('b', factoryB);

            expect(a2).not.toBe(a1);
            expect(b2).not.toBe(b1);
            expect(factoryA).toHaveBeenCalledTimes(2);
            expect(factoryB).toHaveBeenCalledTimes(2);
        });

        it('RefreshScope should run destruction callbacks on clear', () => {
            const refresh = new RefreshScope();
            const destroyed = vi.fn();

            refresh.registerDestructionCallback('value', destroyed);
            refresh.getValue('value', () => ({ id: 1 }));

            refresh.clear();

            expect(destroyed).toHaveBeenCalledTimes(1);
            expect(refresh.getValue('value', () => ({ id: 2 }))).toEqual({ id: 2 });
        });

        it('RefreshScope clear() survives a throwing destruction callback (ARC-1)', () => {
            const refresh = new RefreshScope();
            const error = new Error('teardown exploded');

            refresh.registerDestructionCallback('boom', () => {
                throw error;
            });
            const stale = refresh.getValue('value', () => ({ id: 1 }));

            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            refresh.clear();

            // The failing callback was reported (best-effort teardown)...
            // The report now flows through the @blue/log logger; assert
            // the essence (one report, mentioning the callback) without pinning
            // the logger's argument layout.
            expect(consoleError).toHaveBeenCalledTimes(1);
            expect(
                consoleError.mock.calls[0].some(
                    (arg) =>
                        typeof arg === 'string' && arg.includes('RefreshScope destruction callback for "boom" failed')
                )
            ).toBe(true);
            // ...and the instance map was STILL cleared — no stale instance
            // may survive a throwing callback (the pre-fix behavior aborted
            // before #instances.clear(), caching the old instance forever).
            expect(refresh.getValue('value', () => ({ id: 2 }))).toEqual({ id: 2 });
            expect(refresh.getValue('value', () => ({ id: 2 }))).not.toBe(stale);
            consoleError.mockRestore();
        });

        it('RefreshScope destroyValue should run the callback once', () => {
            const refresh = new RefreshScope();
            const destroyed = vi.fn();

            refresh.registerDestructionCallback('value', destroyed);
            refresh.getValue('value', () => ({ id: 1 }));
            refresh.destroyValue('value');

            expect(destroyed).toHaveBeenCalledTimes(1);
            expect(refresh.getValue('value', () => ({ id: 3 }))).toEqual({ id: 3 });
        });

        it('PrototypeScope should always create a new value', () => {
            const prototype = new PrototypeScope();
            const objectFactory = vi.fn(() => ({ id: Math.random() }));

            const a = prototype.getValue('value', objectFactory);
            const b = prototype.getValue('value', objectFactory);

            expect(a).not.toBe(b);
            expect(objectFactory).toHaveBeenCalledTimes(2);

            expect(() => prototype.destroyValue('value')).not.toThrow();
        });

        it('HashScope should isolate values by key', () => {
            const hash = new HashScope();
            const objectFactory = vi.fn(() => ({ id: Math.random() }));

            hash.setCurrentKey('k1');
            const k1a = hash.getValue('value', objectFactory);
            const k1b = hash.getValue('value', objectFactory);

            hash.setCurrentKey('k2');
            const k2a = hash.getValue('value', objectFactory);

            expect(k1a).toBe(k1b);
            expect(k1a).not.toBe(k2a);
            expect(objectFactory).toHaveBeenCalledTimes(2);

            hash.endScope('k2');
            hash.setCurrentKey('k2');
            const k2b = hash.getValue('value', objectFactory);

            expect(k2a).not.toBe(k2b);
            expect(objectFactory).toHaveBeenCalledTimes(3);
        });

        it('HashScope should throw when no active key exists', () => {
            const hash = new HashScope();

            expect(() => hash.getValue('value', () => ({ id: 1 }))).toThrow('No active hash scope context');
            expect(() => hash.destroyValue('value')).toThrow('No active hash scope context');
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple decorators on same class (first wins in TC39)', () => {
            // Note: TC39 decorators execute bottom-to-top, so first decorator in source wins
            @scope('singleton')
            @scope('prototype')
            class MultiDecoratedService {}

            // First decorator wins (singleton) - TC39 behavior
            expect(getScope(MultiDecoratedService)).toBe('singleton');
        });

        it('should work with class inheritance', () => {
            @scope('singleton')
            class BaseService {}

            class DerivedService extends BaseService {}

            // Parent metadata available
            expect(getScope(BaseService)).toBe('singleton');

            // In TC39, child DOES inherit parent's Symbol.metadata
            // This is expected TC39 behavior - metadata is inherited
            expect(getScope(DerivedService)).toBe('singleton');
        });

        it('should preserve class constructor behavior', () => {
            @scope('singleton')
            class Service {
                constructor(public value: string) {}
            }

            const instance = new Service('test');
            expect(instance.value).toBe('test');
            expect(instance instanceof Service).toBe(true);
        });
    });
});
