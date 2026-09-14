/**
 * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContextToken } from '../src/context-token';
import { AsFactoryAware, DefaultFactory, ProxiedFactory } from '../src/factory';
import { $aware } from '../src/aware';
import { prototypeScope, scope, singletonScope, type Scope } from '../src/scope';
import type {
    ConstructionAwareProcessor,
    DestructionAwareProcessor,
    InitializationAwareProcessor,
} from '../src/entry-processor';

class EmptyPrototype {}

/** Asserts that a fixture initialized in `beforeEach` is present. */
function defined<T>(value: T | undefined): T {
    if (value === undefined) {
        throw new Error('Expected fixture to be defined');
    }
    return value;
}

describe('DefaultFactory', () => {
    class TestPrototype {
        [$aware] = true;
        destroyed = false;
        destroy = vi.fn();
        init = vi.fn();
        setName = vi.fn();
    }

    @singletonScope
    class SingletonScopedPrototype {
        value = Math.random();
    }

    @prototypeScope
    class PrototypeScopedPrototype {
        value = Math.random();
    }

    @scope('custom')
    class CustomScopedPrototype {
        value = Math.random();
    }

    class TestProcessor implements InitializationAwareProcessor, ConstructionAwareProcessor, DestructionAwareProcessor {
        processAfterInitialization = vi.fn(
            (_name: string, value: unknown) => value
        ) as InitializationAwareProcessor['processAfterInitialization'];
        processAfterConstruction = vi.fn(
            (_name: string, value: unknown) => value
        ) as ConstructionAwareProcessor['processAfterConstruction'];
        processBeforeDestruction = vi.fn() as DestructionAwareProcessor['processBeforeDestruction'];
        processBeforeInitialization = vi.fn(
            (_name: string, value: unknown) => value
        ) as InitializationAwareProcessor['processBeforeInitialization'];
        processBeforeConstruction = vi.fn(() => null) as ConstructionAwareProcessor['processBeforeConstruction'];
        processProperties = vi.fn(
            (properties: PropertyDescriptorMap) => properties
        ) as ConstructionAwareProcessor['processProperties'];
    }

    let factory: DefaultFactory | undefined;
    let processor: TestProcessor | undefined;

    beforeEach(() => {
        processor = new TestProcessor();
        factory = new DefaultFactory();
        factory.addProcessor(processor);
    });

    afterEach(() => {
        // TODO call destroy later
        factory = processor = undefined;
    });

    test('it should create instances', () => {
        const f = defined(factory);
        const p = defined(processor);

        f.setValue('empty', EmptyPrototype);
        f.setValue('test', TestPrototype);

        const empty = f.getInstance<EmptyPrototype>('empty');
        expect(empty).toBeInstanceOf(EmptyPrototype);
        expect(p.processBeforeConstruction).toHaveBeenCalledWith('empty', EmptyPrototype, []);
        expect(p.processProperties).toHaveBeenCalledWith({}, 'empty', empty);
        expect(p.processAfterConstruction).toHaveBeenCalledWith('empty', empty);

        const test = f.getInstance<TestPrototype>('test');
        expect(test).toBeInstanceOf(TestPrototype);
        expect(p.processBeforeConstruction).toHaveBeenCalledWith('test', TestPrototype, []);
        expect(p.processProperties).toHaveBeenCalledWith({}, 'test', test);
        expect(p.processAfterConstruction).toHaveBeenCalledWith('test', test);

        expect(Object.prototype.toString.call(f)).toBe('[object Factory]');
    });

    test('it should respect singleton scope metadata in getValue', () => {
        const f = defined(factory);

        f.setValue('singletonScoped', SingletonScopedPrototype);

        const a = f.getValue<SingletonScopedPrototype>('singletonScoped');
        const b = f.getValue<SingletonScopedPrototype>('singletonScoped');

        expect(a).toBeInstanceOf(SingletonScopedPrototype);
        expect(b).toBeInstanceOf(SingletonScopedPrototype);
        expect(a).toBe(b);
    });

    test('it should respect prototype scope metadata in getValue', () => {
        const f = defined(factory);

        f.setValue('prototypeScoped', PrototypeScopedPrototype);

        const a = f.getValue<PrototypeScopedPrototype>('prototypeScoped');
        const b = f.getValue<PrototypeScopedPrototype>('prototypeScoped');

        expect(a).toBeInstanceOf(PrototypeScopedPrototype);
        expect(b).toBeInstanceOf(PrototypeScopedPrototype);
        expect(a).not.toBe(b);
    });

    test('it should manage processors', () => {
        const f = defined(factory);
        const p = defined(processor);
        const processor2 = new TestProcessor();

        f.addProcessor(processor2);

        expect(f.processors).toHaveProperty('length', 2);
        expect(f.processors).toHaveProperty('0', p);
        expect(f.processors).toHaveProperty('1', processor2);

        f.addProcessor(p);

        expect(f.processors).toHaveProperty('length', 2);
        expect(f.processors).toHaveProperty('0', processor2);
        expect(f.processors).toHaveProperty('1', p);
    });

    test('it should expose and manage registered scopes', () => {
        const f = defined(factory);
        const scopeNames = f.getScopeNames();

        expect(scopeNames).toContain('singleton');
        expect(scopeNames).toContain('prototype');
        expect(scopeNames).toContain('route');
        expect(scopeNames).toContain('hash');
    });

    test('it should resolve values using registered custom scopes', () => {
        const f = defined(factory);
        const customScope: Scope = {
            destroyValue: vi.fn(),
            getValue: vi.fn((_name: string, objectFactory: () => unknown) => objectFactory()) as Scope['getValue'],
        };

        f.registerScope('custom', customScope);
        f.setValue('customScoped', CustomScopedPrototype);

        const a = f.getValue<CustomScopedPrototype>('customScoped');
        const b = f.getValue<CustomScopedPrototype>('customScoped');

        expect(a).toBeInstanceOf(CustomScopedPrototype);
        expect(b).toBeInstanceOf(CustomScopedPrototype);
        expect(a).not.toBe(b);
        expect(customScope.getValue).toHaveBeenCalledTimes(2);
        expect(customScope.getValue).toHaveBeenCalledWith('customScoped', expect.any(Function));
    });

    test('it should create aware instances', () => {
        const f = defined(factory);

        f.setValue('test', TestPrototype);

        const test = f.getInstance<TestPrototype>('test');
        expect(test.setName).toHaveBeenCalledWith('test');
    });

    test('it should create initializable instances', () => {
        const f = defined(factory);
        const p = defined(processor);

        f.setValue('empty', EmptyPrototype);
        f.setValue('test', TestPrototype);

        const empty = f.getInstance<EmptyPrototype>('empty');
        expect(empty).toBeInstanceOf(EmptyPrototype);
        expect(p.processBeforeInitialization).toHaveBeenCalledWith('empty', empty);
        expect(p.processAfterInitialization).toHaveBeenCalledWith('empty', empty);

        const test = f.getInstance<TestPrototype>('test');
        expect(test).toBeInstanceOf(TestPrototype);
        expect(test.init).toHaveBeenCalled();
        expect(p.processBeforeInitialization).toHaveBeenCalledWith('test', test);
        expect(p.processAfterInitialization).toHaveBeenCalledWith('test', test);
    });

    test('it should destoy destroyable instances', () => {
        const f = defined(factory);
        const p = defined(processor);

        f.setValue('empty1', EmptyPrototype);
        const empty1 = f.getValue('empty1');
        f.destroyValue('empty1');
        expect(p.processBeforeDestruction).not.toHaveBeenCalledWith('empty1', empty1);

        f.setValue('test1', TestPrototype);
        const test1 = f.getValue<TestPrototype>('test1');
        f.destroyValue('test1');
        expect(test1.destroy).toHaveBeenCalledWith();
        expect(p.processBeforeDestruction).toHaveBeenCalledWith('test1', test1);

        const empty2 = new EmptyPrototype();
        f.setValue('empty2', empty2);
        f.destroyValue('empty2');
        expect(p.processBeforeDestruction).not.toHaveBeenCalledWith('empty2', empty2);

        const test2 = new TestPrototype();
        f.setValue('test2', test2);
        f.destroyValue('test2');
        expect(test2.destroy).toHaveBeenCalledWith();
        expect(p.processBeforeDestruction).toHaveBeenCalledWith('test2', test2);
    });

    test('it should create instances from enumerables', () => {
        const f = defined(factory);
        const p = defined(processor);

        f.setValue('list', [new TestPrototype(), new TestPrototype()]);

        const list = f.getValue<TestPrototype[]>('list');
        const [test1, test2] = list;

        expect(test1).toBeInstanceOf(TestPrototype);
        expect(test1.init).toHaveBeenCalledOnce();
        expect(p.processBeforeInitialization).toHaveBeenCalledWith('list[0]', test1);
        expect(p.processAfterInitialization).toHaveBeenCalledWith('list[0]', test1);
        expect(test2).toBeInstanceOf(TestPrototype);
        expect(test2.init).toHaveBeenCalledOnce();
        expect(p.processBeforeInitialization).toHaveBeenCalledWith('list[1]', test2);
        expect(p.processAfterInitialization).toHaveBeenCalledWith('list[1]', test2);

        f.setValue('numbers', [1, 2, 3]);
        f.getValue('numbers');
    });

    test('it should support token-based set/get/has/destroy', () => {
        const f = defined(factory);
        const fooToken = new ContextToken<number>('foo');

        f.setValue(fooToken, 123);

        expect(f.getValue(fooToken)).toBe(123);
        expect(f.getValue<number>('foo')).toBe(123);
        expect(f.hasValue(fooToken)).toBe(true);

        f.destroyValue(fooToken);

        expect(f.hasValue(fooToken)).toBe(false);
        expect(f.getValue(fooToken)).toBeUndefined();
    });

    test('it should support token/string interoperability', () => {
        const f = defined(factory);
        const fooToken = new ContextToken<number>('foo');

        f.setValue('foo', 456);
        expect(f.getValue(fooToken)).toBe(456);

        f.setValue(fooToken, 789);
        expect(f.getValue<number>('foo')).toBe(789);
    });

    test('it should support constructor registration using token', () => {
        const f = defined(factory);
        const emptyToken = new ContextToken<unknown>('empty');

        f.setValue(emptyToken, EmptyPrototype);

        const empty = f.getValue(emptyToken);
        expect(empty).toBeInstanceOf(EmptyPrototype);
    });
});

describe('ProxiedFactory', () => {
    let factory: ProxiedFactory | undefined;

    beforeEach(() => {
        factory = new ProxiedFactory();
    });

    afterEach(() => {
        // TODO call destroy later
        factory = undefined;
    });

    test('it should alias methods', () => {
        const f = defined(factory);

        f.setValue('foo', 123);
        f.bar = 456;

        expect(f.getValue('foo')).toBe(123);
        expect(f.foo).toBe(123);
        expect(f.hasValue('foo')).toBe(true);
        expect('foo' in f).toBe(true);
        expect(f.getValue('bar')).toBe(456);
        expect(f.bar).toBe(456);
        expect(f.hasValue('bar')).toBe(true);
        expect('bar' in f).toBe(true);

        delete f.bar;

        expect(f.getValue('bar')).toBeUndefined();
        expect(f.bar).toBeUndefined();
        expect(f.hasValue('bar')).toBe(false);
        expect('bar' in f).toBe(false);

        Reflect.deleteProperty(f, 'foo');

        expect(f.getValue('foo')).toBeUndefined();
        expect(f.foo).toBeUndefined();
        expect(f.hasValue('foo')).toBe(false);
        expect('foo' in f).toBe(false);
    });
});

describe('AsFactoryAware', () => {
    test('it should mixin functionality', () => {
        const FactoryAwarePrototype = AsFactoryAware(EmptyPrototype);
        const factoryAware = new FactoryAwarePrototype();
        const factory = new DefaultFactory();

        expect(factoryAware).toHaveProperty('setFactory');
        expect(typeof factoryAware.setFactory).toBe('function');

        factoryAware.setFactory(factory);

        expect(factoryAware).toHaveProperty('factory');
        // The mixin stores the factory behind a closure-backed `factory` getter not declared on the interface.
        expect((factoryAware as unknown as { factory: unknown }).factory).toBeInstanceOf(DefaultFactory);
    });
});
