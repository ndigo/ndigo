import { JSONValue, JSONObject, Serializable, createNull } from '@blue/core';
import { Emitter, EventEmitter } from '@blue/context';
import { AsyncDestroyable, Initializable } from '@blue/factory';
import { forEachObjIndexed } from '@blue/util/object';
import { validated, ClassValidationOptions, ClassValidationResult } from '@blue/validate';

/**
 * Maps action names to handlers that receive domain data payloads.
 */
export type DomainActions = {
    [action: string]: (data: JSONObject) => void;
};

/**
 * Stores JSON-compatible data exposed by a domain component.
 */
export type DomainData = {
    [property: string]: JSONValue;
};

/**
 * Stores configuration values that affect how a domain component behaves.
 */
export type DomainSettings = {
    [setting: string]: JSONValue;
};

/**
 * Stores named state values for a domain component.
 */
export type DomainStates = {
    [state: string]: JSONValue;
};

/**
 * Represents a serializable, event-driven domain component with lifecycle hooks.
 */
export interface DomainComponent extends Initializable, EventEmitter, AsyncDestroyable, Serializable {
    id: number;
    name: string;
    model: JSONObject;
    actions: DomainActions;
    data: DomainData;
    settings: DomainSettings;
    states: DomainStates;

    /**
     * Validates a component property before it is used or persisted.
     *
     * @param options - Validation options.
     */
    validate(options?: ClassValidationOptions): ClassValidationResult;
}

const { defineProperty, deleteProperty } = Reflect,
    initializeData = (component) => (value, key) => {
        component.model.set(key, value);
        defineProperty(component, key, {
            get: () => component.model.get(key, { isolate: true }),
            set: function () {},
            configurable: true,
            enumerable: true,
            writable: false,
        });
    };

let uuid = 0;

@validated()
export class GenericDomainComponent extends Emitter implements DomainComponent {
    id: number;
    name: string;
    model: JSONObject;
    actions: DomainActions;
    settings: DomainSettings;
    states: DomainStates;
    declare validate: (options?: ClassValidationOptions) => ClassValidationResult;

    get [Symbol.toStringTag](): string {
        return `DomainComponent:${this.name}`;
    }

    /**
     * Assigns initial data by mirroring model values onto the component instance.
     *
     * @param newData - Initial domain data to attach.
     */
    set data(newData: DomainData) {
        const initData = initializeData(this);
        forEachObjIndexed(initData as any, newData);
        deleteProperty(this, 'data');
    }

    /**
     * Creates a new component instance with a unique identifier.
     */
    constructor() {
        super();
        const id = ++uuid;
        defineProperty(this, 'id', {
            get: () => id,
            configurable: true,
            enumerable: false,
        });
    }

    /**
     * Sets the component name after construction.
     *
     * @param name - Human-readable component name.
     */
    init(name: string): void {
        defineProperty(this, 'name', {
            get: () => name,
            configurable: true,
            enumerable: false,
        });
    }

    /**
     * Destroys the component and releases any associated resources.
     *
     * @returns A promise that resolves when destruction is complete.
     */
    async destroy(): Promise<void> {
        if (!this.destroyed) {
            this.emit('destroy');
            super.destroy();  // Emitter.destroy() → clears all listeners and sets destroyed=true
        }
    }

    /**
     * Serializes the component to a JSON-compatible object.
     *
     * @returns A JSON object containing the component identity.
     */
    toJSON(): JSONObject {
        const json = createNull();

        json.name = this.name;
        json.id = this.id;

        return json;
    }

    /**
     * Returns the component name for string coercion.
     *
     * @returns The component name.
     */
    toString(): string {
        return this.name;
    }
}