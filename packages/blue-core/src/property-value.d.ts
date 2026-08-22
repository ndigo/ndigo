/**
 * @author Jeff Rose
 */
import { RingBuffer } from './ring-buffer.js';
import { JSONValue, Serializable } from './serializable.js';
import { Equatable } from './equatable.js';
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
export declare const likePropertyValues: (value: any) => value is PropertyValues;
/**
 * A named value wrapper used for property bags and metadata.
 */
export declare class PropertyValue implements Equatable, Serializable {
    #private;
    /** Whether the property is optional when consumed by higher-level APIs. */
    optional: boolean;
    /**
     * The stable string tag for this instance.
     */
    get [Symbol.toStringTag](): string;
    /** The property name. */
    get name(): string;
    /** The stored property value. */
    get value(): any;
    /**
     * Creates a new property value.
     *
     * @param name - Property name.
     * @param value - Stored value.
     */
    constructor(name: string, value: any);
    /**
     * Compares this property value to another value.
     *
     * @param value - Value to compare.
     * @returns `true` when both the name and wrapped value match.
     */
    equals(value: any): boolean;
    /**
     * Serializes the property value to JSON.
     *
     * @returns A JSON object with `name` and `value` properties.
     */
    toJSON(): JSONValue;
    /**
     * Returns the property name.
     *
     * @returns The property name.
     */
    toString(): string;
}
/**
 * A mutable collection of named property values.
 */
export declare class MutablePropertyValues extends RingBuffer<PropertyValue> implements ArrayLike<PropertyValue | undefined>, Equatable, Iterable<PropertyValue>, Serializable {
    /** All property values in iteration order. */
    get propertyValues(): PropertyValue[];
    /**
     * The stable string tag for this collection.
     */
    get [Symbol.toStringTag](): string;
    /**
     * Creates a collection seeded with existing property values.
     *
     * @param properties - Optional source collection to copy into this buffer.
     */
    constructor(properties?: Iterable<PropertyValue>);
    /**
     * Adds a property value to the collection.
     *
     * @param name - Property name.
     * @param value - Property value.
     */
    addPropertyValue(name: string, value: any): void;
    /**
     * Adds a pre-built property value to the collection.
     *
     * @param pv - Property value to add.
     */
    addPropertyValue(pv: PropertyValue): void;
    /**
     * Compares this collection to another property collection.
     *
     * @param value - Value to compare.
     * @returns `true` when both collections contain the same property names and values.
     */
    equals(value: any): boolean;
    /**
     * Retrieves only the wrapped value for a named property.
     *
     * @param propertyName - Property name to resolve.
     * @returns The stored value, or `null` when the property is missing.
     */
    getValue(propertyName: string): any;
    /**
     * Finds a property value by name.
     *
     * @param propertyName - Property name to resolve.
     * @returns The matching property value, or `null` when no match exists.
     */
    getPropertyValue(propertyName: string): PropertyValue | null;
}
