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
 * @extends external:Iterable<module:core.PropertyValue>
 */
/**
 */
/**
 * @param {string} propertyName
 * @returns {module:core.PropertyValue} The property value or `null` if none
 */
const isString = is(String);
/**
 */
export const likePropertyValues = both(likeIterable, like({ propertyValues: Array, getPropertyValue: Function }));
/**
 * An object that holds information and value for an individual property.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktdmFsdWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcHJvcGVydHktdmFsdWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFDSCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBMkIsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEUsT0FBTyxFQUFhLE9BQU8sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNqRCxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDNUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBT3BDOztHQUVHO0FBRUg7R0FDRztBQUVIOzs7R0FHRztBQUVILE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQStCLENBQUM7QUFFMUQ7R0FDRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FDbEMsWUFBWSxFQUNaLElBQUksQ0FBQyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLENBQVEsQ0FDL0IsQ0FBQztBQUV4Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGFBQWE7SUFDdEIsS0FBSyxDQUFTO0lBQ2QsTUFBTSxDQUFDO0lBRVAsUUFBUSxDQUFVO0lBRWxCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8saUJBQWlCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVE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