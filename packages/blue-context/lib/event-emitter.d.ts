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
 */
export declare const likeApplicationEventEmitterAware: (value: any) => value is ApplicationEventEmitterAware;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link EventEmitter|EventEmitter}
 */
export declare const likeEventEmitter: (value: any) => value is EventEmitter;
/**
 * @see module:context.AsEventEmitter
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
export declare const asEventEmitter: (target: any) => EventEmitter;
export interface AsyncEventEmitter extends EventEmitter {
    tick(type: EventType, ...data: any[]): Promise<void>;
}
export interface ConditionalEventEmitter extends EventEmitter {
    once(type: EventType, listener: Function): this;
    many(type: EventType, times: number, listener: Function): this;
    until(type: EventType, listener: Function): this;
}
export declare const AsAsyncEventEmitter: <T extends Constructable<EventEmitter>>(superclass: T) => Constructable<AsyncEventEmitter> & T;
export declare const AsConditionalEventEmitter: <T extends Constructable<EventEmitter>>(superclass: T) => Constructable<ConditionalEventEmitter> & T;
declare const EmitterBase: Constructable<EventEmitter> & {
    new (): {};
};
export declare class Emitter extends EmitterBase {
    static readonly every: string;
    static readonly version: string;
    destroyed: boolean;
    constructor(mapping?: EventHandlers);
    clear(type?: EventType): this;
    toJSON(): any;
    toString(): string;
    destroy(): void;
}
export {};
//# sourceMappingURL=event-emitter.d.ts.map