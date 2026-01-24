const { expect, use } = require('chai');
const sinon_chai = require('sinon-chai');
import { spy } from 'sinon';
import { AsFactoryAware, DefaultFactory, ProxiedFactory } from '../src/factory';
import { $aware } from '../src/aware';

use(sinon_chai);

class EmptyPrototype {}

describe('DefaultFactory', function () {
    class TestPrototype {
        constructor() {
            this[$aware] = true;
            this.destroyed = false;
            this.destroy = spy();
            this.init = spy();
            this.setName = spy();
        }
    }

    class TestProcessor {
        constructor() {
            const returnNull = (name, value) => null,
                returnValue = (name, value) => value;
            this.processAfterInitialization = spy(returnValue);
            this.processAfterConstruction = spy(returnValue);
            this.processBeforeDestruction = spy();
            this.processBeforeInitialization = spy(returnValue);
            this.processBeforeConstruction = spy(returnNull);
            this.processProperties = spy((properties, name, value) => properties);
        }
    }

    let factory, processor;

    afterEach(function () {
        // TODO call destroy later
        factory = processor = undefined;
    });

    beforeEach(function () {
        processor = new TestProcessor();
        factory = new DefaultFactory();
        factory.addProcessor(processor);
    });

    test('it should create instances', function () {
        factory.setValue('empty', EmptyPrototype);
        factory.setValue('test', TestPrototype);

        const empty = factory.getInstance('empty');
        expect(empty).toBeInstanceOf(EmptyPrototype);
        expect(processor.processBeforeConstruction).to.be.calledWith('empty', EmptyPrototype);
        expect(processor.processProperties).to.be.calledWith({}, 'empty', empty);
        expect(processor.processAfterConstruction).to.be.calledWith('empty', empty);

        const test = factory.getInstance('test');
        expect(test).toBeInstanceOf(TestPrototype);
        expect(processor.processBeforeConstruction).to.be.calledWith('test', TestPrototype);
        expect(processor.processProperties).to.be.calledWith({}, 'test', test);
        expect(processor.processAfterConstruction).to.be.calledWith('test', test);

        expect(Object.prototype.toString.call(factory)).toBe('[object Factory]');
    });

    test('it should manage processors', function () {
        const processor2 = new TestProcessor();
        factory.addProcessor(processor2);

        expect(factory.processors).toHaveProperty('length').that.equals(2);
        expect(factory.processors).toHaveProperty(0).that.equals(processor);
        expect(factory.processors).toHaveProperty(1).that.equals(processor2);

        factory.addProcessor(processor);

        expect(factory.processors).toHaveProperty('length').that.equals(2);
        expect(factory.processors).toHaveProperty(0).that.equals(processor2);
        expect(factory.processors).toHaveProperty(1).that.equals(processor);
    });

    test('it should create aware instances', function () {
        factory.setValue('test', TestPrototype);

        const test = factory.getInstance('test');
        expect(test.setName).to.be.calledWith('test');
    });

    test('it should create initializable instances', function () {
        factory.setValue('empty', EmptyPrototype);
        factory.setValue('test', TestPrototype);

        const empty = factory.getInstance('empty');
        expect(empty).toBeInstanceOf(EmptyPrototype);
        expect(processor.processBeforeInitialization).to.be.calledWith('empty', empty);
        expect(processor.processAfterInitialization).to.be.calledWith('empty', empty);

        const test = factory.getInstance('test');
        expect(test).toBeInstanceOf(TestPrototype);
        expect(test.init).to.be.called;
        expect(processor.processBeforeInitialization).to.be.calledWith('test', test);
        expect(processor.processAfterInitialization).to.be.calledWith('test', test);
    });

    test('it should destoy destroyable instances', function () {
        factory.setValue('empty1', EmptyPrototype);
        const empty1 = factory.getValue('empty1');
        factory.destroyValue('empty1');
        expect(processor.processBeforeDestruction).to.not.be.calledWith('empty1', empty1);

        factory.setValue('test1', TestPrototype);
        const test1 = factory.getValue('test1');
        factory.destroyValue('test1');
        expect(test1.destroy.calledWith()).toBe(true);
        expect(processor.processBeforeDestruction).to.be.calledWith('test1', test1);

        const empty2 = new EmptyPrototype();
        factory.setValue('empty2', empty2);
        factory.destroyValue('empty2');
        expect(processor.processBeforeDestruction).to.not.be.calledWith('empty2', empty2);

        const test2 = new TestPrototype();
        factory.setValue('test2', test2);
        factory.destroyValue('test2');
        expect(test2.destroy.calledWith()).toBe(true);
        expect(processor.processBeforeDestruction).to.be.calledWith('test2', test2);
    });

    test('it should create instances from enumerables', function () {
        factory.setValue('list', [new TestPrototype(), new TestPrototype()]);

        const list = factory.getValue('list'),
            [test1, test2] = list;

        expect(test1).toBeInstanceOf(TestPrototype);
        expect(test1.init).to.be.calledOnce;
        expect(processor.processBeforeInitialization).to.be.calledWith('list[0]', test1);
        expect(processor.processAfterInitialization).to.be.calledWith('list[0]', test1);
        expect(test2).toBeInstanceOf(TestPrototype);
        expect(test2.init).to.be.calledOnce;
        expect(processor.processBeforeInitialization).to.be.calledWith('list[1]', test2);
        expect(processor.processAfterInitialization).to.be.calledWith('list[1]', test2);

        factory.setValue('numbers', [1, 2, 3]);

        const numbers = factory.getValue('numbers');
    });
});

describe('ProxiedFactory', function () {
    let factory;

    afterEach(function () {
        // TODO call destroy later
        factory = undefined;
    });

    beforeEach(function () {
        factory = new ProxiedFactory();
    });

    test('it should alias methods', function () {
        factory.setValue('foo', 123);
        factory.bar = 456;

        expect(factory.getValue('foo')).toBe(123);
        expect(factory.foo).toBe(123);
        expect(factory.hasValue('foo')).toBe(true);
        expect('foo' in factory).toBe(true);
        expect(factory.getValue('bar')).toBe(456);
        expect(factory.bar).toBe(456);
        expect(factory.hasValue('bar')).toBe(true);
        expect('bar' in factory).toBe(true);

        delete factory.bar;

        expect(factory.getValue('bar')).toBeUndefined();
        expect(factory.bar).toBeUndefined();
        expect(factory.hasValue('bar')).toBe(false);
        expect('bar' in factory).toBe(false);

        Reflect.deleteProperty(factory, 'foo');

        expect(factory.getValue('foo')).toBeUndefined();
        expect(factory.foo).toBeUndefined();
        expect(factory.hasValue('foo')).toBe(false);
        expect('foo' in factory).toBe(false);
    });
});

describe('AsFactoryAware', function () {
    test('it should mixin functionality', function () {
        const FactoryAwarePrototype = AsFactoryAware(EmptyPrototype),
            factoryAware = new FactoryAwarePrototype(),
            factory = new DefaultFactory();

        expect(factoryAware).toHaveProperty('setFactory').that.is.a('Function');

        factoryAware.setFactory(factory);

        expect(factoryAware).toHaveProperty('factory').that.is.an.instanceOf(DefaultFactory);
    });
});
