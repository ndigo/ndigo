/**
 * Property value bags: `PropertyValues`, `MutablePropertyValues`, and `PropertyValue`.
 */
import { RingBuffer } from './ring-buffer.js';
import { JSONValue, Serializable, serialize } from './serializable.js';
import { Equatable, equates } from './equatable.js';
import { is, like } from '@ndigo/util/types';
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
    getPropertyValue(propertyName: string): PropertyValue | null;
}

const isString = is(String) as (value: unknown) => value is string;

/**
 * Tests whether a value behaves like a `PropertyValues` collection.
 *
 * @param value - Value to test.
 * @returns `true` when the value is iterable and exposes property lookup helpers.
 */
const _likePropertyValuesShape = like({ propertyValues: Array, getPropertyValue: Function });

/**
 * Tests whether a value behaves like a `PropertyValues` collection.
 * @param value - Value to test.
 * @returns `true` when the value is iterable and exposes property lookup helpers.
 */
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
        return this.name === value.name && equates(this.value, value.value);
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
 *
 * @example
 * ```ts
 * const values = new MutablePropertyValues();
 * values.addPropertyValue('name', 'Ada');
 * values.getPropertyValue('name'); // PropertyValue { name: 'name', value: 'Ada' }
 * ```
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
     * Adds one or more property values, growing the backing buffer instead of
     * silently evicting the oldest entries. Unlike `RingBuffer`, a
     * `MutablePropertyValues` is an unbounded collection — a form can legitimately
     * carry far more than the ring's 32-slot default (KRN-REV-CORE-02).
     *
     * @param items - The property values to add.
     * @returns The new length of the collection.
     */
    override put(...items: PropertyValue[]): number {
        const required = this.length + items.length;
        if (required > this._capacity) {
            this._grow(required);
        }
        return super.put(...items);
    }

    /**
     * Re-buckets the ring into a larger power-of-two capacity, preserving the
     * oldest-first order, so no previously bound property is lost to the wrap.
     *
     * @param minimum - The smallest capacity that must fit the current contents.
     */
    private _grow(minimum: number): void {
        const existing: PropertyValue[] = [...this];
        const previousCapacity = this._capacity;
        this.capacity = minimum;
        this._head = 0;
        this._tail = 0;
        this._full = 0;
        // Drop the old slots so `Object.keys()` (used by the binder's keypath
        // walk) does not resurrect evicted or duplicate entries.
        for (let index = 0; index < previousCapacity; index++) {
            delete this[index];
        }
        super.put(...existing);
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

    /** Adds a property value. @param nameOrPropertyValue - Property name or value. @param value - Property value (when name given). */
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
     * @returns `true` when both collections contain the same multiset of name/value pairs,
     * regardless of order; duplicate pairs must occur equally often.
     */
    equals(value: unknown): boolean {
        if (value === this) {
            return true;
        }
        if (!likeIterable(value)) {
            return false;
        }
        const collection = value as Partial<PropertyValues>;
        const properties = collection.propertyValues;
        if (!Array.isArray(properties) || typeof collection.getPropertyValue !== 'function') {
            return false;
        }
        const length = this.length;
        if (length !== properties.length) {
            return false;
        }
        if (length === 0) {
            return true;
        }
        const matched = new Uint8Array(length);
        for (let index = 0; index < length; index++) {
            const property = this[index];
            if (!property) {
                return false;
            }
            let match = -1;
            for (let otherIndex = 0; otherIndex < length; otherIndex++) {
                if (!matched[otherIndex] && property.equals(properties[otherIndex])) {
                    match = otherIndex;
                    break;
                }
            }
            if (match === -1) {
                return false;
            }
            matched[match] = 1;
        }
        return true;
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
