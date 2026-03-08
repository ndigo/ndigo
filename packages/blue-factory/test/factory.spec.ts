import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { AsFactoryAware, DefaultFactory, ProxiedFactory } from '../src/factory';
import { $aware } from '../src/aware';
import { prototypeScope, singletonScope } from '../src/scope';

class EmptyPrototype {}

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

    class TestProcessor {
        processAfterInitialization: any;
        processAfterConstruction: any;
        processBeforeDestruction: any;
        processBeforeInitialization: any;
        processBeforeConstruction: any;
        processProperties: any;

        constructor() {
            const returnNull = (name: string, value: any) => null;
            const returnValue = (name: string, value: any) => value;
            this.processAfterInitialization = vi.fn(returnValue);
            this.processAfterConstruction = vi.fn(returnValue);
            this.processBeforeDestruction = vi.fn();
            this.processBeforeInitialization = vi.fn(returnValue);
            this.processBeforeConstruction = vi.fn(returnNull);
            this.processProperties = vi.fn((properties: any, name: string, value: any) => properties);
        }
    }

    let factory: DefaultFactory | undefined;
    let processor: TestProcessor | undefined;

    beforeEach(() => {
        processor = new TestProcessor();
        factory = new DefaultFactory();
        factory.addProcessor(processor as any);
    });

    afterEach(() => {
        // TODO call destroy later
        factory = processor = undefined;
    });

    test('it should create instances', () => {
        factory!.setValue('empty', EmptyPrototype);
        factory!.setValue('test', TestPrototype);

        const empty = factory!.getInstance('empty');
        expect(empty).toBeInstanceOf(EmptyPrototype);
        expect(processor!.processBeforeConstruction).toHaveBeenCalledWith('empty', EmptyPrototype, []);
        expect(processor!.processProperties).toHaveBeenCalledWith({}, 'empty', empty);
        expect(processor!.processAfterConstruction).toHaveBeenCalledWith('empty', empty);

        const test = factory!.getInstance('test');
        expect(test).toBeInstanceOf(TestPrototype);
        expect(processor!.processBeforeConstruction).toHaveBeenCalledWith('test', TestPrototype, []);
        expect(processor!.processProperties).toHaveBeenCalledWith({}, 'test', test);
        expect(processor!.processAfterConstruction).toHaveBeenCalledWith('test', test);

        expect(Object.prototype.toString.call(factory)).toBe('[object Factory]');
    });

    test('it should respect singleton scope metadata in getValue', () => {
        factory!.setValue('singletonScoped', SingletonScopedPrototype);

        const a = factory!.getValue<SingletonScopedPrototype>('singletonScoped');
        const b = factory!.getValue<SingletonScopedPrototype>('singletonScoped');

        expect(a).toBeInstanceOf(SingletonScopedPrototype);
        expect(b).toBeInstanceOf(SingletonScopedPrototype);
        expect(a).toBe(b);
    });

    test('it should respect prototype scope metadata in getValue', () => {
        factory!.setValue('prototypeScoped', PrototypeScopedPrototype);

        const a = factory!.getValue<PrototypeScopedPrototype>('prototypeScoped');
        const b = factory!.getValue<PrototypeScopedPrototype>('prototypeScoped');

        expect(a).toBeInstanceOf(PrototypeScopedPrototype);
        expect(b).toBeInstanceOf(PrototypeScopedPrototype);
        expect(a).not.toBe(b);
    });

    test('it should manage processors', () => {
        const processor2 = new TestProcessor();
        factory!.addProcessor(processor2 as any);

        expect(factory!.processors).toHaveProperty('length', 2);
        expect(factory!.processors).toHaveProperty('0', processor);
        expect(factory!.processors).toHaveProperty('1', processor2);

        factory!.addProcessor(processor as any);

        expect(factory!.processors).toHaveProperty('length', 2);
        expect(factory!.processors).toHaveProperty('0', processor2);
        expect(factory!.processors).toHaveProperty('1', processor);
    });

    test('it should expose and manage registered scopes', () => {
        const scopeNames = factory!.getScopeNames();

        expect(scopeNames).toContain('singleton');
        expect(scopeNames).toContain('prototype');
        expect(scopeNames).toContain('route');
        expect(scopeNames).toContain('hash');
    });

    test('it should create aware instances', () => {
        factory!.setValue('test', TestPrototype);

        const test = factory!.getInstance('test');
        expect(test.setName).toHaveBeenCalledWith('test');
    });

    test('it should create initializable instances', () => {
        factory!.setValue('empty', EmptyPrototype);
        factory!.setValue('test', TestPrototype);

        const empty = factory!.getInstance('empty');
        expect(empty).toBeInstanceOf(EmptyPrototype);
        expect(processor!.processBeforeInitialization).toHaveBeenCalledWith('empty', empty);
        expect(processor!.processAfterInitialization).toHaveBeenCalledWith('empty', empty);

        const test = factory!.getInstance('test');
        expect(test).toBeInstanceOf(TestPrototype);
        expect(test.init).toHaveBeenCalled();
        expect(processor!.processBeforeInitialization).toHaveBeenCalledWith('test', test);
        expect(processor!.processAfterInitialization).toHaveBeenCalledWith('test', test);
    });

    test('it should destoy destroyable instances', () => {
        factory!.setValue('empty1', EmptyPrototype);
        const empty1 = factory!.getValue('empty1');
        factory!.destroyValue('empty1');
        expect(processor!.processBeforeDestruction).not.toHaveBeenCalledWith('empty1', empty1);

        factory!.setValue('test1', TestPrototype);
        const test1 = factory!.getValue('test1');
        factory!.destroyValue('test1');
        expect(test1.destroy).toHaveBeenCalledWith();
        expect(processor!.processBeforeDestruction).toHaveBeenCalledWith('test1', test1);

        const empty2 = new EmptyPrototype();
        factory!.setValue('empty2', empty2);
        factory!.destroyValue('empty2');
        expect(processor!.processBeforeDestruction).not.toHaveBeenCalledWith('empty2', empty2);

        const test2 = new TestPrototype();
        factory!.setValue('test2', test2);
        factory!.destroyValue('test2');
        expect(test2.destroy).toHaveBeenCalledWith();
        expect(processor!.processBeforeDestruction).toHaveBeenCalledWith('test2', test2);
    });

    test('it should create instances from enumerables', () => {
        factory!.setValue('list', [new TestPrototype(), new TestPrototype()]);

        const list = factory!.getValue('list');
        const [test1, test2] = list;

        expect(test1).toBeInstanceOf(TestPrototype);
        expect(test1.init).toHaveBeenCalledOnce();
        expect(processor!.processBeforeInitialization).toHaveBeenCalledWith('list[0]', test1);
        expect(processor!.processAfterInitialization).toHaveBeenCalledWith('list[0]', test1);
        expect(test2).toBeInstanceOf(TestPrototype);
        expect(test2.init).toHaveBeenCalledOnce();
        expect(processor!.processBeforeInitialization).toHaveBeenCalledWith('list[1]', test2);
        expect(processor!.processAfterInitialization).toHaveBeenCalledWith('list[1]', test2);

        factory!.setValue('numbers', [1, 2, 3]);
        factory!.getValue('numbers');
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
        factory!.setValue('foo', 123);
        (factory as any).bar = 456;

        expect(factory!.getValue('foo')).toBe(123);
        expect((factory as any).foo).toBe(123);
        expect(factory!.hasValue('foo')).toBe(true);
        expect('foo' in factory!).toBe(true);
        expect(factory!.getValue('bar')).toBe(456);
        expect((factory as any).bar).toBe(456);
        expect(factory!.hasValue('bar')).toBe(true);
        expect('bar' in factory!).toBe(true);

        delete (factory as any).bar;

        expect(factory!.getValue('bar')).toBeUndefined();
        expect((factory as any).bar).toBeUndefined();
        expect(factory!.hasValue('bar')).toBe(false);
        expect('bar' in factory!).toBe(false);

        Reflect.deleteProperty(factory!, 'foo');

        expect(factory!.getValue('foo')).toBeUndefined();
        expect((factory as any).foo).toBeUndefined();
        expect(factory!.hasValue('foo')).toBe(false);
        expect('foo' in factory!).toBe(false);
    });
});

describe('AsFactoryAware', () => {
    test('it should mixin functionality', () => {
        const FactoryAwarePrototype = AsFactoryAware(EmptyPrototype);
        const factoryAware = new FactoryAwarePrototype();
        const factory = new DefaultFactory();

        expect(factoryAware).toHaveProperty('setFactory');
        expect(typeof (factoryAware as any).setFactory).toBe('function');

        (factoryAware as any).setFactory(factory);

        expect(factoryAware).toHaveProperty('factory');
        expect((factoryAware as any).factory).toBeInstanceOf(DefaultFactory);
    });
});
