/**
 * @author Jeff Rose
 * @see {@link https://nodejs.org/api/events.html#events_class_eventemitter}
 * @see {@link https://github.com/jeffrose/emitter}
 */
import { Constructable } from '@blue/core';
import { Aware } from '@blue/factory';
export type EventListener = {
    (...args: any[]): void;
    listener?: EventListener;
};
export type EventHandler = EventListener | EventListener[];
export type EventHandlers = {
    [type: string]: EventHandler;
};
export type EventType = string | symbol;
export interface EventEmitter {
    emit(type: EventType, ...data: any[]): boolean;
    eventTypes(): EventType[];
    listenerCount(type: EventType): number;
    listeners(type: EventType): Function[];
    on(type: EventType, listener: Function): this;
    off(type: EventType, listener: Function): this;
}
export interface ApplicationEventEmitterAware extends Aware {
    setApplicationEventEmitter(eventEmitter: EventEmitter): void;
}
/**
 * @function module:context.likeApplicationEventEmitterAware
 */
export declare const likeApplicationEventEmitterAware: (value: any) => value is ApplicationEventEmitterAware;
/**
 * @function module:context.likeEventEmitter
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EventEmitter|EventEmitter}
 */
export declare const likeEventEmitter: (value: any) => value is EventEmitter;
/**
 * @mixin module:context.AsEventEmitter
 * @implements module:context.EventEmitter
 * @returns {module:core.Constructable<module:context.EventEmitter>}
 * @example
 * const
 *  MyEmitter = AsEventEmitter( {} ),
 *  greeter = new MyEmitter();
 * greeter.on( 'hello', () => console.log( 'Hello!' ) );
 * greeter.emtest( 'hello' ); // true
 * // Hello!
 */
export declare const AsEventEmitter: <T extends Constructable>(superclass: T) => Constructable<EventEmitter> & T;
//# sourceMappingURL=event-emitter.d.ts.map