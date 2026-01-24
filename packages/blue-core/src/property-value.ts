/**
 * @author Jeff Rose
 */
import { RingBuffer } from './collection';
import { JSONValue, Serializable, serialize } from './serializable';
import { Equatable, equates } from './equatable';
import { both, is, like } from '@blue/util';
import { likeIterable } from './iterable';
import { createNull } from './null';

export interface PropertyValues extends Iterable<PropertyValue> {
    readonly propertyValues: PropertyValue[];
    getPropertyValue(propertyName: string): PropertyValue;
}

/**
 * @interface module:core.PropertyValues
 * @extends external:Iterable<module:core.PropertyValue>
 */

/**
 * @member {module:core.PropertyValue[]} module:core.PropertyValues#propertyValues
 */

/**
 * @function module:core.PropertyValues#getPropertyValue
 * @param {external:string} propertyName
 * @returns {module:core.PropertyValue} The property value or `null` if none
 */

const isString = is(String) as (value) => value is string;

/**
 * @class module:core.likePropertyValues
 */
export const likePropertyValues = both(
    likeIterable,
    like({ propertyValues: Array, getPropertyValue: Function }) as any
) as (value) => value is PropertyValues;

/**
 * An object that holds information and value for an individual property.
 * @class module:core.PropertyValue
 * @implements module:core.Equatable
 * @implements module:core.Serializable
 */
export class PropertyValue implements Equatable, Serializable {
    #name: string;
    #value;

    optional: boolean;

    get [Symbol.toStringTag](): string {
        return `PropertyValue:${this.#name}`;
    }

    get name(): string {
        return this.#name;
    }

    get value() {
        return this.#value;
    }

    constructor(name: string, value) {
        this.#name = name;
        this.#value = value;
        this.optional = false;
    }

    equals(value): boolean {
        if (value === this) {
            return true;
        }
        if (!(value instanceof PropertyValue)) {
            return false;
        }
        return this.name === value.name && equates(this.value, value.value);
    }

    toJSON(): JSONValue {
        const json = createNull();
        json.name = this.#name;
        json.value = serialize(this.#value);
        return json;
    }

    toString(): string {
        return this.#name;
    }
}

export class MutablePropertyValues
    extends RingBuffer<PropertyValue>
    implements ArrayLike<PropertyValue>, Equatable, Iterable<PropertyValue>, Serializable
{
    get propertyValues(): PropertyValue[] {
        return [...this];
    }

    get [Symbol.toStringTag](): string {
        return 'PropertyValues';
    }

    constructor(properties?: Iterable<PropertyValue>) {
        super(32);
        if (likeIterable(properties)) {
            for (const property of properties) {
                this.put(property);
            }
        }
    }

    addPropertyValue(name: string, value);
    addPropertyValue(pv: PropertyValue);
    addPropertyValue(nameOrPropertyValue: string | PropertyValue, value?) {
        if (isString(nameOrPropertyValue)) {
            this.put(new PropertyValue(nameOrPropertyValue, value));
        } else {
            this.put(nameOrPropertyValue);
        }
    }

    equals(value): boolean {
        let result = value === this;

        if (!result && likePropertyValues(value) && this.length === value.propertyValues.length) {
            const length = this.length;
            for (let index = 0; index < length; index++) {
                const pv = this[index];
                result = equates(value.getPropertyValue(pv.name)?.value, pv.value);
                if (!result) {
                    break;
                }
            }
        }

        return result;
    }

    getValue(propertyName: string) {
        const pv = this.getPropertyValue(propertyName);
        return pv?.value ?? null;
    }

    getPropertyValue(propertyName: string): PropertyValue {
        const length = this.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const pv = this[index];
                if (pv.name === propertyName) {
                    return pv;
                }
            }
        }
        return null;
    }
}
