/**
 * @author Jeff Rose
 */
import { RingBuffer } from './collection';
import { serialize } from './serializable';
import { equates } from './equatable';
import { both, is, like } from '@blue/util';
import { likeIterable } from './iterable';
import { createNull } from './null';
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
const isString = is(String);
/**
 * @class module:core.likePropertyValues
 */
export const likePropertyValues = both(likeIterable, like({ propertyValues: Array, getPropertyValue: Function }));
/**
 * An object that holds information and value for an individual property.
 * @class module:core.PropertyValue
 * @implements module:core.Equatable
 * @implements module:core.Serializable
 */
export class PropertyValue {
    #name;
    #value;
    optional;
    get [Symbol.toStringTag]() {
        return `PropertyValue:${this.#name}`;
    }
    get name() {
        return this.#name;
    }
    get value() {
        return this.#value;
    }
    constructor(name, value) {
        this.#name = name;
        this.#value = value;
        this.optional = false;
    }
    equals(value) {
        if (value === this) {
            return true;
        }
        if (!(value instanceof PropertyValue)) {
            return false;
        }
        return this.name === value.name && equates(this.value, value.value);
    }
    toJSON() {
        const json = createNull();
        json.name = this.#name;
        json.value = serialize(this.#value);
        return json;
    }
    toString() {
        return this.#name;
    }
}
export class MutablePropertyValues extends RingBuffer {
    get propertyValues() {
        return [...this];
    }
    get [Symbol.toStringTag]() {
        return 'PropertyValues';
    }
    constructor(properties) {
        super(32);
        if (likeIterable(properties)) {
            for (const property of properties) {
                this.put(property);
            }
        }
    }
    addPropertyValue(nameOrPropertyValue, value) {
        if (isString(nameOrPropertyValue)) {
            this.put(new PropertyValue(nameOrPropertyValue, value));
        }
        else {
            this.put(nameOrPropertyValue);
        }
    }
    equals(value) {
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
    getValue(propertyName) {
        const pv = this.getPropertyValue(propertyName);
        return pv?.value ?? null;
    }
    getPropertyValue(propertyName) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktdmFsdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcHJvcGVydHktdmFsdWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFDSCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBMkIsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEUsT0FBTyxFQUFhLE9BQU8sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNqRCxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDNUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBT3BDOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVILE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQStCLENBQUM7QUFFMUQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQ2xDLFlBQVksRUFDWixJQUFJLENBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxDQUFRLENBQy9CLENBQUM7QUFFeEM7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sYUFBYTtJQUN0QixLQUFLLENBQVM7SUFDZCxNQUFNLENBQUM7SUFFUCxRQUFRLENBQVU7SUFFbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFD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