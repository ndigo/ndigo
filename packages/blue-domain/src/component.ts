import { FrameworkError, JSONValue, JSONObject, Null, Serializable, createNull } from '@blue/core';
import { AsEventEmitter, EventEmitter } from '@blue/context';
import { AsyncDestroyable, Initializable } from '@blue/factory';
import { forEachObjIndexed } from '@blue/util/object';

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
     * @param property - Property name to validate.
     */
    validate(property: string): void;
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

export class GenericDomainComponent extends AsEventEmitter(Null) implements DomainComponent {
    id: number;
    name: string;
    model: JSONObject;
    actions: DomainActions;
    settings: DomainSettings;
    states: DomainStates;
    destroyed: boolean;

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
     * Validates a component property.
     *
     * @param property - Property name to validate.
     * @throws {FrameworkError} Always, because this class requires a concrete override.
     */
    validate(property: string): void {
        throw new FrameworkError('Method not implemented.');
    }

    /**
     * Destroys the component and releases any associated resources.
     *
     * @returns A promise that resolves when destruction is complete.
     * @throws {FrameworkError} Always, because this class requires a concrete override.
     */
    async destroy(): Promise<void> {
        throw new FrameworkError('Method not implemented.');
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
