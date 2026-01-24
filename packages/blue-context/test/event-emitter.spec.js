const { expect, use } = require('chai');
const sinon_chai = require('sinon-chai');
import { spy } from 'sinon';
import { Emitter, AsAsyncEventEmitter, AsConditionalEventEmitter } from '../src/event-emitter';

use(sinon_chai);

describe('Emitter', function () {
    test('it should be a function', function () {
        expect(Emitter).toBeInstanceOf(Function);
    });

    test('it should have static properties', function () {
        expect(Emitter.every).to.be.a('string');
        expect(Emitter.version).to.be.a('string');
    });

    describe('instances', function () {
        let emitter;

        beforeEach(() => (emitter = new Emitter()));

        afterEach(function () {
            emitter.destroy();
            emitter = undefined;
        });

        test('it should provide event subscription', function () {
            let events = [],
                listeners = [];

            const onFoo = spy(),
                onFooToo = spy(),
                onBar = spy();

            emitter.on(':on', (event, listener) => {
                events.push(event);
                listeners.push(listener);
            });

            emitter.on('foo', onFoo);
            emitter.on('foo', onFooToo);
            emitter.on('bar', onBar);

            emitter.emtest('foo');
            emitter.emtest('bar');

            expect(onFoo).to.be.calledOnce;
            expect(onFooToo).to.be.calledOnce;
            expect(onBar).to.be.calledOnce;
        });

        xtest('it should provide event subscription at construction time', function () {
            let events = [],
                listeners = [],
                onFoo = spy(),
                onFooToo = spy(),
                onBar = spy();

            emitter = new Emitter({
                ':on': (event, listener) => {
                    events.push(event);
                    listeners.push(listener);
                },
                foo: [onFoo, onFooToo],
                bar: onBar,
            });

            emitter.emtest('foo');
            emitter.emtest('bar');

            expect(onFoo).to.be.calledOnce;
            expect(onFooToo).to.be.calledOnce;
            expect(onBar).to.be.calledOnce;

            expect(events).toEqual(['foo', 'foo', 'bar']);
            expect(listeners).toEqual([onFoo, onFooToo, onBar]);

            expect(emitter.listeners('foo')[0]).toBe(onFoo);
            expect(emitter.listeners('foo')[1]).toBe(onFooToo);

            expect(() => emitter.on('foo')).toThrow(TypeError);
        });

        test('it should support namespaced event types', function () {
            let onFoo = spy(),
                onBar = spy(),
                onQux = spy();

            emitter.on('foo', onFoo);
            emitter.on('foo:bar', onBar);
            emitter.on('foo:bar:qux', onQux);

            emitter.emtest('foo:bar:qux', 1, 2, 3);

            expect(onFoo).to.be.calledWith(1, 2, 3);
            expect(onBar).to.be.calledWith(1, 2, 3);
            expect(onQux).to.be.calledWith(1, 2, 3);

            emitter.emtest('foo:bar:qux', 4, 5, 6);

            expect(onFoo).to.be.calledWith(4, 5, 6);
            expect(onBar).to.be.calledWith(4, 5, 6);
            expect(onQux).to.be.calledWith(4, 5, 6);

            expect(onFoo).to.be.calledTwice;
            expect(onBar).to.be.calledTwice;
            expect(onQux).to.be.calledTwice;
        });

        test('it should emit events differently based on the number of arguments', function () {
            let test = Symbol('@@test'),
                onEmit = spy();

            emitter.on('test', onEmit);
            emitter.on(test, onEmit);

            emitter.emtest('test');
            emitter.emtest('test', 0);
            emitter.emtest('test', 1, 2);
            emitter.emtest('test', 3, 4, 5);
            emitter.emtest('test', 6, 7, 8, 9);
            emitter.emit(test);

            expect(onEmit.calledWith()).to.be.ok;
            expect(onEmit).to.be.calledWith(0);
            expect(onEmit).to.be.calledWith(1, 2);
            expect(onEmit).to.be.calledWith(3, 4, 5);
            expect(onEmit).to.be.calledWith(6, 7, 8, 9);
            expect(onEmit.callCount).toBe(6);
        });

        test('it should catch errors in bad listeners', function () {
            let onEmit = spy(),
                onError = spy(),
                badListenerError = new Error('Bad listener');

            emitter.on('test', function () {
                throw badListenerError;
            });
            emitter.on('test', onEmit);

            emitter.on('error', onError);

            emitter.emtest('test');

            expect(onError).to.be.calledOnce;
            expect(onError).to.be.calledWith(badListenerError);
            expect(onEmit).to.be.calledOnce;

            emitter.off('error', onError);

            expect(() => emitter.emtest('test')).toThrow(badListenerError);
            expect(onEmit).to.be.calledTwice;
        });

        test('it should provide a way to unsubscribe', function () {
            const onAll = spy(),
                onEmit = spy(),
                onEmitToo = spy(),
                onOff = spy();

            emitter.on(':off', onOff);

            emitter.on('test', onEmit);
            emitter.on('test', onEmitToo);

            emitter.on(onAll);

            emitter.emtest('test', 1, 2, 3);
            emitter.off('test', onEmit);
            emitter.emtest('test', 4, 5, 6);
            emitter.off('test', onEmitToo);

            emitter.off(onAll);

            emitter.off('undefined', onEmit);

            expect(onEmit).to.be.calledWith(1, 2, 3);
            expect(onEmit).to.be.calledOnce;

            expect(onEmitToo).to.be.calledWith(1, 2, 3);
            expect(onEmitToo).to.be.calledWith(4, 5, 6);
            expect(onEmitToo).to.be.calledTwice;

            expect(onOff).to.be.calledWith('test', onEmit);
            expect(onOff).to.be.calledWith('test', onEmitToo);
            expect(onOff).to.be.calledThrice;
        });

        test('it should provide a way to listen to every event', function () {
            const onEmit = spy();

            emitter.on(Emitter.every, onEmit);
            emitter.on(undefined, onEmit);

            emitter.emtest('foo');
            emitter.emtest('bar');

            emitter.clear(Emitter.every);

            emitter.emtest('qux');

            expect(onEmit).to.have.callCount(4);
        });

        test('it should provide a listener count', function () {
            let noop = function () {};

            emitter.on('test', noop);
            emitter.on('test', noop);

            emitter.emtest('empty');

            expect(emitter.listenerCount('test')).toBe(2);
            expect(emitter.listenerCount('empty')).toBe(0);
            expect(emitter.listenerCount('undefined')).toBe(0);
        });

        test('it should provide a clean JSON and String representation', function () {
            let noop = function () {},
                json,
                string;

            emitter.maxListeners = 5;
            emitter.on('test', noop);
            emitter.on('test', noop);

            json = emitter.toJSON();
            string = emitter.toString();

            // Object.prototype.toString.call()
            expect(Object.prototype.toString.call(emitter)).toBe('[object EventEmitter]');

            // toJSON()
            expect(json).toHaveProperty('listenerCount');
            expect(json.listenerCount).to.be.an('Object');
            expect(json.listenerCount).toHaveProperty('test');
            expect(json.listenerCount.test).to.be.a('Number');

            // toString()
            expect(string).to.match(/^EventEmitter {.+}$/);
            expect(string).to.match(/"test":2/);

            emitter.destroy();

            json = emitter.toJSON();
            string = emitter.toString();

            expect(json).toBe('destroyed');
            expect(string).to.match(/^EventEmitter "destroyed"$/);
        });

        test('it should provide listener count', function () {
            const noop = function () {};
            let count;

            count = emitter.listenerCount('test');

            expect(count).toBe(0);
            expect(count).toBe(emitter.listeners('test').length);

            emitter.on('test', noop);
            count = emitter.listenerCount('test');

            expect(count).toBe(1);
            expect(count).toBe(emitter.listeners('test').length);

            emitter.on('test', noop);
            count = emitter.listenerCount('test');

            expect(count).toBe(2);
            expect(count).toBe(emitter.listeners('test').length);

            emitter.on('test', noop);
            count = emitter.listenerCount('test');

            expect(count).toBe(3);
            expect(count).toBe(emitter.listeners('test').length);

            emitter.clear('test');
            count = emitter.listenerCount('test');

            expect(count).toBe(0);
            expect(count).toBe(emitter.listeners('test').length);
        });

        test('it should provide a list of event types', function () {
            const onEmit = spy();

            emitter.on('foo', onEmit);
            emitter.on('bar', onEmit);

            expect(emitter.eventTypes().length).toBe(2);
        });
    });
});

describe('AsAsyncEventEmitter', function () {
    test('it should be a function', function () {
        expect(AsAsyncEventEmitter).toBeInstanceOf(Function);
    });

    describe('instances', function () {
        let emitter;

        beforeEach(function () {
            const AsyncEmitter = AsAsyncEventEmitter(Emitter);
            emitter = new AsyncEmitter();
        });

        afterEach(function () {
            emitter.destroy();
            emitter = undefined;
        });

        test('it should have functions and properties', function () {
            expect(emitter.tick).toBeInstanceOf(Function);
        });

        test('it should provide asynchronous event emission', function (done) {
            /*
            const
                test = emitter.tick( 'test', 1, 2, 3 )
                    .then( function(){
                        console.log( 'resolved', arguments );
                    } ),
                none = emitter.tick( 'none', 4, 5, 6 )
                    .catch( function(){
                        console.log( 'rejected', arguments );
                    } );

            Promise.all( [ test, none ] ).then( done );
            */

            let onEmit = spy();

            emitter.on('test', onEmit);

            emitter.tick('test', 1, 2, 3).then(function () {
                expect(onEmit).to.be.calledOnce;
                done();
            });
        });
    });
});

describe('AsConditionalEventEmitter', function () {
    test('it should be a function', function () {
        expect(AsConditionalEventEmitter).toBeInstanceOf(Function);
    });

    describe('instances', function () {
        let emitter;

        beforeEach(function () {
            const ConditionalEmitter = AsConditionalEventEmitter(Emitter);
            emitter = new ConditionalEmitter();
        });

        afterEach(function () {
            emitter.destroy();
            emitter = undefined;
        });

        test('it should have functions and properties', function () {
            expect(emitter.many).toBeInstanceOf(Function);
            expect(emitter.once).toBeInstanceOf(Function);
            expect(emitter.until).toBeInstanceOf(Function);
        });

        test('it should provide one-time event subscription', function () {
            let onEmit = spy();

            emitter.once('test', onEmit);

            emitter.emtest('test', 1, 2, 3);
            emitter.emtest('test', 4, 5, 6);

            expect(onEmit).to.be.calledWith(1, 2, 3);
            expect(onEmit).to.be.calledOnce;
        });

        test('it should provide many-time event subscription', function () {
            let onEmit = spy();

            emitter.many('test', 2, onEmit);

            emitter.emtest('test', 1, 2, 3);
            emitter.emtest('test', 4, 5, 6);
            emitter.emtest('test', 7, 8, 9);

            expect(onEmit).to.be.calledWith(1, 2, 3);
            expect(onEmit).to.be.calledWith(4, 5, 6);
            expect(onEmit).to.be.calledTwice;
        });

        test('it should allow unsubscribing early from a many-time event', function () {
            let onEmit = spy();

            emitter.many('test', 5, onEmit);

            emitter.emtest('test', 1, 2);
            emitter.emtest('test', 3, 4);
            emitter.emtest('test', 5, 6);

            emitter.off('test', onEmit);

            emitter.emtest('test', 7, 8);
            emitter.emtest('test', 9, 0);

            expect(onEmit).to.be.calledThrice;
        });

        test('it should provide conditional event subscription', function () {
            let onEmit = spy();

            emitter.until('test', (first, second, third) => {
                onEmit(first, second, third);
                return third === 6;
            });

            emitter.emtest('test', 1, 2, 3);
            emitter.emtest('test', 4, 5, 6);
            emitter.emtest('test', 7, 8, 9);

            expect(onEmit).to.be.calledWith(1, 2, 3);
            expect(onEmit).to.be.calledWith(4, 5, 6);
            expect(onEmit).to.be.calledTwice;

            let count = 0;
            onEmit = spy();

            emitter.until(Emitter.every, function () {
                onEmit();
                return ++count === 2;
            });

            emitter.emtest('foo');
            emitter.emtest('bar');
            emitter.emtest('baz');

            expect(onEmit).to.be.calledTwice;
        });

        test('it should emit events when listeners are added and removed', function () {
            let noop = function () {},
                onNewListener = spy(),
                onRemoveListener = spy();

            emitter.on(':on', onNewListener);
            emitter.on(':off', onRemoveListener);

            emitter.once('test', noop);

            emitter.emtest('test');

            expect(onNewListener).to.be.calledWith('test');
            expect(onNewListener).to.be.calledWith(':off');
            expect(onNewListener).to.be.calledTwice;

            expect(onRemoveListener).to.be.calledWith('test');
            expect(onRemoveListener).to.be.calledOnce;
        });
    });
});
