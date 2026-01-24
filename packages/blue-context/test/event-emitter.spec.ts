import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Emitter, AsAsyncEventEmitter, AsConditionalEventEmitter } from '../src/event-emitter';

describe('Emitter', () => {
    test('it should be a function', () => {
        expect(Emitter).toBeInstanceOf(Function);
    });

    test('it should have static properties', () => {
        expect(typeof Emitter.every).toBe('string');
        expect(typeof Emitter.version).toBe('string');
    });

    describe('instances', () => {
        let emitter: Emitter;

        beforeEach(() => (emitter = new Emitter()));

        afterEach(() => {
            emitter.destroy();
            emitter = undefined as any;
        });

        test('it should provide event subscription', () => {
            let events: string[] = [],
                listeners: Function[] = [];

            const onFoo = vi.fn(),
                onFooToo = vi.fn(),
                onBar = vi.fn();

            emitter.on(':on', (event: string, listener: Function) => {
                events.push(event);
                listeners.push(listener);
            });

            emitter.on('foo', onFoo);
            emitter.on('foo', onFooToo);
            emitter.on('bar', onBar);

            emitter.emit('foo');
            emitter.emit('bar');

            expect(onFoo).toHaveBeenCalledOnce();
            expect(onFooToo).toHaveBeenCalledOnce();
            expect(onBar).toHaveBeenCalledOnce();
        });

        test.skip('it should provide event subscription at construction time', () => {
            let events: string[] = [],
                listeners: Function[] = [],
                onFoo = vi.fn(),
                onFooToo = vi.fn(),
                onBar = vi.fn();

            emitter = new Emitter({
                ':on': (event: string, listener: Function) => {
                    events.push(event);
                    listeners.push(listener);
                },
                foo: [onFoo, onFooToo],
                bar: onBar,
            });

            emitter.emit('foo');
            emitter.emit('bar');

            expect(onFoo).toHaveBeenCalledOnce();
            expect(onFooToo).toHaveBeenCalledOnce();
            expect(onBar).toHaveBeenCalledOnce();

            expect(events).toEqual(['foo', 'foo', 'bar']);
            expect(listeners).toEqual([onFoo, onFooToo, onBar]);

            expect(emitter.listeners('foo')[0]).toBe(onFoo);
            expect(emitter.listeners('foo')[1]).toBe(onFooToo);

            expect(() => emitter.on('foo')).toThrow(TypeError);
        });

        test('it should support namespaced event types', () => {
            let onFoo = vi.fn(),
                onBar = vi.fn(),
                onQux = vi.fn();

            emitter.on('foo', onFoo);
            emitter.on('foo:bar', onBar);
            emitter.on('foo:bar:qux', onQux);

            emitter.emit('foo:bar:qux', 1, 2, 3);

            expect(onFoo).toHaveBeenCalledWith(1, 2, 3);
            expect(onBar).toHaveBeenCalledWith(1, 2, 3);
            expect(onQux).toHaveBeenCalledWith(1, 2, 3);

            emitter.emit('foo:bar:qux', 4, 5, 6);

            expect(onFoo).toHaveBeenCalledWith(4, 5, 6);
            expect(onBar).toHaveBeenCalledWith(4, 5, 6);
            expect(onQux).toHaveBeenCalledWith(4, 5, 6);

            expect(onFoo).toHaveBeenCalledTimes(2);
            expect(onBar).toHaveBeenCalledTimes(2);
            expect(onQux).toHaveBeenCalledTimes(2);
        });

        test('it should emit events differently based on the number of arguments', () => {
            let test = Symbol('@@test'),
                onEmit = vi.fn();

            emitter.on('test', onEmit);
            emitter.on(test, onEmit);

            emitter.emit('test');
            emitter.emit('test', 0);
            emitter.emit('test', 1, 2);
            emitter.emit('test', 3, 4, 5);
            emitter.emit('test', 6, 7, 8, 9);
            emitter.emit(test);

            expect(onEmit.mock.calls.some((call) => call.length === 0)).toBe(true);
            expect(onEmit).toHaveBeenCalledWith(0);
            expect(onEmit).toHaveBeenCalledWith(1, 2);
            expect(onEmit).toHaveBeenCalledWith(3, 4, 5);
            expect(onEmit).toHaveBeenCalledWith(6, 7, 8, 9);
            expect(onEmit).toHaveBeenCalledTimes(6);
        });

        test('it should catch errors in bad listeners', () => {
            let onEmit = vi.fn(),
                onError = vi.fn(),
                badListenerError = new Error('Bad listener');

            emitter.on('test', () => {
                throw badListenerError;
            });
            emitter.on('test', onEmit);

            emitter.on('error', onError);

            emitter.emit('test');

            expect(onError).toHaveBeenCalledOnce();
            expect(onError).toHaveBeenCalledWith(badListenerError);
            expect(onEmit).toHaveBeenCalledOnce();

            emitter.off('error', onError);

            expect(() => emitter.emit('test')).toThrow(badListenerError);
            expect(onEmit).toHaveBeenCalledTimes(2);
        });

        test('it should provide a way to unsubscribe', () => {
            const onAll = vi.fn(),
                onEmit = vi.fn(),
                onEmitToo = vi.fn(),
                onOff = vi.fn();

            emitter.on(':off', onOff);

            emitter.on('test', onEmit);
            emitter.on('test', onEmitToo);

            emitter.on(onAll);

            emitter.emit('test', 1, 2, 3);
            emitter.off('test', onEmit);
            emitter.emit('test', 4, 5, 6);
            emitter.off('test', onEmitToo);

            emitter.off(onAll);

            emitter.off('undefined', onEmit);

            expect(onEmit).toHaveBeenCalledWith(1, 2, 3);
            expect(onEmit).toHaveBeenCalledOnce();

            expect(onEmitToo).toHaveBeenCalledWith(1, 2, 3);
            expect(onEmitToo).toHaveBeenCalledWith(4, 5, 6);
            expect(onEmitToo).toHaveBeenCalledTimes(2);

            expect(onOff).toHaveBeenCalledWith('test', onEmit);
            expect(onOff).toHaveBeenCalledWith('test', onEmitToo);
            expect(onOff).toHaveBeenCalledTimes(3);
        });

        test('it should provide a way to listen to every event', () => {
            const onEmit = vi.fn();

            emitter.on(Emitter.every, onEmit);
            emitter.on(undefined, onEmit);

            emitter.emit('foo');
            emitter.emit('bar');

            emitter.clear(Emitter.every);

            emitter.emit('qux');

            expect(onEmit).toHaveBeenCalledTimes(4);
        });

        test('it should provide a listener count', () => {
            let noop = () => {};

            emitter.on('test', noop);
            emitter.on('test', noop);

            emitter.emit('empty');

            expect(emitter.listenerCount('test')).toBe(2);
            expect(emitter.listenerCount('empty')).toBe(0);
            expect(emitter.listenerCount('undefined')).toBe(0);
        });

        test('it should provide a clean JSON and String representation', () => {
            let noop = () => {},
                json: any,
                string: string;

            emitter.maxListeners = 5;
            emitter.on('test', noop);
            emitter.on('test', noop);

            json = emitter.toJSON();
            string = emitter.toString();

            // Object.prototype.toString.call()
            expect(Object.prototype.toString.call(emitter)).toBe('[object EventEmitter]');

            // toJSON()
            expect(json).toHaveProperty('listenerCount');
            expect(typeof json.listenerCount).toBe('object');
            expect(json.listenerCount).toHaveProperty('test');
            expect(typeof json.listenerCount.test).toBe('number');

            // toString()
            expect(string).toMatch(/^EventEmitter {.+}$/);
            expect(string).toMatch(/"test":2/);

            emitter.destroy();

            json = emitter.toJSON();
            string = emitter.toString();

            expect(json).toBe('destroyed');
            expect(string).toMatch(/^EventEmitter "destroyed"$/);
        });

        test('it should provide listener count', () => {
            const noop = () => {};
            let count: number;

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

        test('it should provide a list of event types', () => {
            const onEmit = vi.fn();

            emitter.on('foo', onEmit);
            emitter.on('bar', onEmit);

            expect(emitter.eventTypes().length).toBe(2);
        });
    });
});

describe('AsAsyncEventEmitter', () => {
    test('it should be a function', () => {
        expect(AsAsyncEventEmitter).toBeInstanceOf(Function);
    });

    describe('instances', () => {
        let emitter: Emitter & { tick: (event: string | symbol, ...args: any[]) => Promise<any> };

        beforeEach(() => {
            const AsyncEmitter = AsAsyncEventEmitter(Emitter);
            emitter = new AsyncEmitter();
        });

        afterEach(() => {
            emitter.destroy();
            emitter = undefined as any;
        });

        test('it should have functions and properties', () => {
            expect(emitter.tick).toBeInstanceOf(Function);
        });

        test('it should provide asynchronous event emission', async () => {
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

            let onEmit = vi.fn();

            emitter.on('test', onEmit);

            await emitter.tick('test', 1, 2, 3);
            expect(onEmit).toHaveBeenCalledOnce();
        });
    });
});

describe('AsConditionalEventEmitter', () => {
    test('it should be a function', () => {
        expect(AsConditionalEventEmitter).toBeInstanceOf(Function);
    });

    describe('instances', () => {
        let emitter: Emitter & {
            many: (event: string | symbol, times: number, listener: Function) => void;
            once: (event: string | symbol, listener: Function) => void;
            until: (event: string | symbol, listener: Function) => void;
        };

        beforeEach(() => {
            const ConditionalEmitter = AsConditionalEventEmitter(Emitter);
            emitter = new ConditionalEmitter();
        });

        afterEach(() => {
            emitter.destroy();
            emitter = undefined as any;
        });

        test('it should have functions and properties', () => {
            expect(emitter.many).toBeInstanceOf(Function);
            expect(emitter.once).toBeInstanceOf(Function);
            expect(emitter.until).toBeInstanceOf(Function);
        });

        test('it should provide one-time event subscription', () => {
            let onEmit = vi.fn();

            emitter.once('test', onEmit);

            emitter.emit('test', 1, 2, 3);
            emitter.emit('test', 4, 5, 6);

            expect(onEmit).toHaveBeenCalledWith(1, 2, 3);
            expect(onEmit).toHaveBeenCalledOnce();
        });

        test('it should provide many-time event subscription', () => {
            let onEmit = vi.fn();

            emitter.many('test', 2, onEmit);

            emitter.emit('test', 1, 2, 3);
            emitter.emit('test', 4, 5, 6);
            emitter.emit('test', 7, 8, 9);

            expect(onEmit).toHaveBeenCalledWith(1, 2, 3);
            expect(onEmit).toHaveBeenCalledWith(4, 5, 6);
            expect(onEmit).toHaveBeenCalledTimes(2);
        });

        test('it should allow unsubscribing early from a many-time event', () => {
            let onEmit = vi.fn();

            emitter.many('test', 5, onEmit);

            emitter.emit('test', 1, 2);
            emitter.emit('test', 3, 4);
            emitter.emit('test', 5, 6);

            emitter.off('test', onEmit);

            emitter.emit('test', 7, 8);
            emitter.emit('test', 9, 0);

            expect(onEmit).toHaveBeenCalledTimes(3);
        });

        test('it should provide conditional event subscription', () => {
            let onEmit = vi.fn();

            emitter.until('test', (first: number, second: number, third: number) => {
                onEmit(first, second, third);
                return third === 6;
            });

            emitter.emit('test', 1, 2, 3);
            emitter.emit('test', 4, 5, 6);
            emitter.emit('test', 7, 8, 9);

            expect(onEmit).toHaveBeenCalledWith(1, 2, 3);
            expect(onEmit).toHaveBeenCalledWith(4, 5, 6);
            expect(onEmit).toHaveBeenCalledTimes(2);

            let count = 0;
            onEmit = vi.fn();

            emitter.until(Emitter.every, () => {
                onEmit();
                return ++count === 2;
            });

            emitter.emit('foo');
            emitter.emit('bar');
            emitter.emit('baz');

            expect(onEmit).toHaveBeenCalledTimes(2);
        });

        test('it should emit events when listeners are added and removed', () => {
            let noop = () => {},
                onNewListener = vi.fn(),
                onRemoveListener = vi.fn();

            emitter.on(':on', onNewListener);
            emitter.on(':off', onRemoveListener);

            emitter.once('test', noop);

            emitter.emit('test');

            expect(onNewListener).toHaveBeenCalledWith('test');
            expect(onNewListener).toHaveBeenCalledWith(':off');
            expect(onNewListener).toHaveBeenCalledTimes(2);

            expect(onRemoveListener).toHaveBeenCalledWith('test');
            expect(onRemoveListener).toHaveBeenCalledOnce();
        });
    });
});
