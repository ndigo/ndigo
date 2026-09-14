/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RingBuffer } from './ring-buffer.js';
import { JSONValue, Serializable, serialize } from './serializable.js';
import { Equatable, equates, equatable } from './equatable.js';
import { is, like } from '@blue/util/types';
import { likeIterable } from './iterable.js';
import { createNull } from './null.js';

/**
 * A collection that can look up property values by name.
 */
export interface PropertyValues extends Iterable<PropertyValue> {
    /** All property values in iteration order. */
    readonly propertyValues: PropertyValue[];

    /**
     * Returns the property value for the given name.
     *
     * @param propertyName - Property name to resolve.
     * @returns The matching property value, or `null` when no match exists.
     */
    getPropertyValue(propertyName: string): PropertyValue;
}

const isString = is(String) as (value: unknown) => value is string;

/**
 * Tests whether a value behaves like a `PropertyValues` collection.
 *
 * @param value - Value to test.
 * @returns `true` when the value is iterable and exposes property lookup helpers.
 */
const _likePropertyValuesShape = like({ propertyValues: Array, getPropertyValue: Function });

export const likePropertyValues = ((value: unknown) => likeIterable(value) && _likePropertyValuesShape(value)) as (
    value: unknown
) => value is PropertyValues;

/**
 * A named value wrapper used for property bags and metadata.
 */
export class PropertyValue implements Equatable, Serializable {
    #name: string;
    #value: unknown;

    /** Whether the property is optional when consumed by higher-level APIs. */
    optional: boolean;

    /**
     * The stable string tag for this instance.
     */
    get [Symbol.toStringTag](): string {
        return `PropertyValue:${this.#name}`;
    }

    /** The property name. */
    get name(): string {
        return this.#name;
    }

    /** The stored property value. */
    get value() {
        return this.#value;
    }

    /**
     * Creates a new property value.
     *
     * @param name - Property name.
     * @param value - Stored value.
     */
    constructor(name: string, value: unknown) {
        this.#name = name;
        this.#value = value;
        this.optional = false;
    }

    /**
     * Compares this property value to another value.
     *
     * @param value - Value to compare.
     * @returns `true` when both the name and wrapped value match.
     */
    equals(value: unknown): boolean {
        if (value === this) {
            return true;
        }
        if (!(value instanceof PropertyValue)) {
            return false;
        }
        // Wrapped values may be arbitrary; `equates` falls back to deep equality for unknown shapes.
        return this.name === value.name && equates(this.value as equatable, value.value as equatable);
    }

    /**
     * Serializes the property value to JSON.
     *
     * @returns A JSON object with `name` and `value` properties.
     */
    toJSON(): JSONValue {
        const json = createNull();
        json.name = this.#name;
        json.value = serialize(this.#value);
        return json;
    }

    /**
     * Returns the property name.
     *
     * @returns The property name.
     */
    toString(): string {
        return this.#name;
    }
}

/**
 * A mutable collection of named property values.
 */
export class MutablePropertyValues
    extends RingBuffer<PropertyValue>
    implements ArrayLike<PropertyValue | undefined>, Equatable, Iterable<PropertyValue>, Serializable
{
    /** All property values in iteration order. */
    get propertyValues(): PropertyValue[] {
        return [...this];
    }

    /**
     * The stable string tag for this collection.
     */
    get [Symbol.toStringTag](): string {
        return 'PropertyValues';
    }

    /**
     * Creates a collection seeded with existing property values.
     *
     * @param properties - Optional source collection to copy into this buffer.
     */
    constructor(properties?: Iterable<PropertyValue>) {
        super(32);
        if (likeIterable(properties)) {
            for (const property of properties) {
                this.put(property);
            }
        }
    }

    /**
     * Adds a property value to the collection.
     *
     * @param name - Property name.
     * @param value - Property value.
     */
    addPropertyValue(name: string, value: unknown): void;

    /**
     * Adds a pre-built property value to the collection.
     *
     * @param pv - Property value to add.
     */
    addPropertyValue(pv: PropertyValue): void;

    addPropertyValue(nameOrPropertyValue: string | PropertyValue, value?: unknown): void {
        if (isString(nameOrPropertyValue)) {
            this.put(new PropertyValue(nameOrPropertyValue, value));
        } else {
            this.put(nameOrPropertyValue);
        }
    }

    /**
     * Compares this collection to another property collection.
     *
     * @param value - Value to compare.
     * @returns `true` when both collections contain the same property names and values.
     */
    equals(value: unknown): boolean {
        let result = value === this;

        if (!result && likePropertyValues(value) && this.length === value.propertyValues.length) {
            const length = this.length;
            for (let index = 0; index < length; index++) {
                const pv = this[index];
                if (!pv) {
                    result = false;
                    break;
                }
                // Wrapped values may be arbitrary; `equates` handles any shape via deep equality.
                const other = value.getPropertyValue(pv.name)?.value;
                result = equates(other as equatable, pv.value as equatable);
                if (!result) {
                    break;
                }
            }
        }

        return result;
    }

    /**
     * Retrieves only the wrapped value for a named property.
     *
     * @param propertyName - Property name to resolve.
     * @returns The stored value, or `null` when the property is missing.
     */
    getValue(propertyName: string) {
        const pv = this.getPropertyValue(propertyName);
        return pv?.value ?? null;
    }

    /**
     * Finds a property value by name.
     *
     * @param propertyName - Property name to resolve.
     * @returns The matching property value, or `null` when no match exists.
     */
    getPropertyValue(propertyName: string): PropertyValue | null {
        const length = this.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const pv = this[index];
                if (pv && pv.name === propertyName) {
                    return pv;
                }
            }
        }
        return null;
    }
}
