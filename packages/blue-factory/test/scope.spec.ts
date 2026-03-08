/**
 * Behavioral tests for @blue/factory scope decorators (TC39)
 *
 * Tests verify that scope decorators store metadata correctly using TC39 Symbol.metadata
 * and that helper functions and mixins can read the metadata.
 */

import { describe, it, expect, vi } from 'vitest';
import {
    scope,
    singletonScope,
    prototypeScope,
    hashScope,
    defineScope,
    getScope,
    hasScope,
    HashScope,
    PrototypeScope,
    SingletonScope,
} from '../src/scope';

describe('Scope Decorators - TC39 Behavioral Tests', () => {
    describe('@scope decorator', () => {
        it('should store scope metadata on class', () => {
            @scope('singleton')
            class TestService {}

            const metadata = (TestService as any)[Symbol.metadata];
            expect(metadata).toBeDefined();
            expect(metadata['scope:mapping']).toBe('singleton');
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
