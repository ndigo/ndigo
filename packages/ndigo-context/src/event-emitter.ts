/**
 * Application event emitters and listener contracts.
 */
import { JSONValue, Serializable, Null, createNull } from '@ndigo/core';
import { Destroyable } from '@ndigo/factory';
import {
    $events,
    $every,
    defineProperty,
    keys,
    addEventHandlers,
    removeAllEventListeners,
    getEvents,
    emitEvent,
} from './_event-emitter-helpers';
import { AsEventEmitter } from './event-emitter-mixins';
import type { EventEmitter, EventType, EventHandlers } from './event-emitter-types';
import { likeEventEmitter } from './event-emitter-types';

// Re-export moved contracts/mixins for backward compat.
export * from './event-emitter-types';
export * from './event-emitter-mixins';

/**
 * Standalone event emitter with destroy and serialization support.
 */
export class Emitter extends AsEventEmitter(Null) implements Destroyable, Serializable {
    /** Sentinel type matching every event. */
    static readonly every: string = $every;
    /** Emitter implementation version. */
    static readonly version: string = '3.0.0';

    /** Whether the emitter has been destroyed. */
    destroyed: boolean = false;

    /**
     * Creates an emitter and optionally seeds it with listeners.
     *
     * @param mapping - Optional initial event mappings.
     *
     * @example
     * ```ts
     * const emitter = new Emitter({ 'user:login': (u) => console.log(u) });
     * emitter.emit('user:login', { id: 1 });
     * ```
     */
    constructor(mapping?: EventHandlers) {
        super();

        defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        // eslint-disable-next-line no-unused-expressions -- guarded dispatch: seed listeners only when a mapping was provided
        typeof mapping !== 'undefined' && addEventHandlers(this, mapping, false);
    }

    /**
     * Removes listeners for one type or for all types.
     *
     * @param type - Optional event type to clear.
     * @returns This emitter.
     */
    clear(type?: EventType): this {
        removeAllEventListeners(this, type);
        return this;
    }

    /**
     * Serializes the listener counts to JSON.
     *
     * @returns A JSON representation of the emitter state.
     */
    toJSON(): JSONValue {
        const json: { listenerCount?: { [type: string]: number } } = createNull();
        const types = keys(getEvents(this) || createNull());

        const listenerCount: { [type: string]: number } = createNull();
        const length = types.length;
        for (let index = 0; index < length; index += 1) {
            const type = types[index];
            listenerCount[type] = this.listenerCount(type);
        }
        json.listenerCount = listenerCount;

        return json as JSONValue;
    }

    /**
     * Returns a compact textual summary of the emitter.
     *
     * @returns A string representation.
     */
    toString(): string {
        // The mixin always installs a `Symbol.toStringTag` getter.
        const self = this as unknown as { [Symbol.toStringTag]: string };
        return `${self[Symbol.toStringTag]} ${JSON.stringify(this.toJSON())}`.trim();
    }

    /**
     * Destroys the emitter and clears its listeners.
     */
    destroy(): void {
        if (!this.destroyed) {
            defineProperty(this, 'destroyed', {
                value: true,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            emitEvent(this, ':destroy', [], false);
            this.clear();
            this.toJSON = () => 'destroyed';
        }
    }
}

/**
 * Internal target shape used by the object mixin helper.
 */
export type EventEmitterTarget = EventEmitter & {
    '@@emitter/events'?: Emitter;
};

/**
 * Mixes event emitter behavior into an existing object.
 *
 * @param target - The object to augment.
 * @returns The augmented object.
 */
export const asEventEmitter = <TTarget extends object>(target: TTarget): TTarget & EventEmitter => {
    if (!target || typeof target !== 'object') {
        throw new TypeError('asEventEmitter target must be an object');
    }

    if (likeEventEmitter(target)) {
        return target as TTarget & EventEmitter;
    }

    // NOTE: bridging to EventEmitterTarget — the source type is wider than this consumer's contract.
    const t = target as unknown as EventEmitterTarget;
    const emitter = new Emitter();

    defineProperty(t, $events, {
        value: emitter,
        configurable: true,
        enumerable: false,
        writable: false,
    });

    const forward = (key: keyof EventEmitter) =>
        function (this: EventEmitter, ...args: unknown[]) {
            // The stored value under $events is the backing Emitter instance.
            const backingEmitter = (this as EventEmitterTarget)[$events] as EventEmitter;
            return (backingEmitter[key] as (...args: unknown[]) => unknown).call(backingEmitter, ...args);
        };

    (['emit', 'eventTypes', 'listenerCount', 'listeners', 'off', 'on'] as (keyof EventEmitter)[]).forEach((key) => {
        defineProperty(t, key, {
            value: forward(key),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    });

    return target as TTarget & EventEmitter;
};
