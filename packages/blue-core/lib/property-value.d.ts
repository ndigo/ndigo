import { RingBuffer } from './collection';
import { JSONValue, Serializable } from './serializable';
import { Equatable } from './equatable';
export interface PropertyValues extends Iterable<PropertyValue> {
    readonly propertyValues: PropertyValue[];
    getPropertyValue(propertyName: string): PropertyValue;
}
/**
 * @class module:core.likePropertyValues
 */
export declare const likePropertyValues: (value: any) => value is PropertyValues;
/**
 * An object that holds information and value for an individual property.
 * @class module:core.PropertyValue
 * @implements module:core.Equatable
 * @implements module:core.Serializable
 */
export declare class PropertyValue implements Equatable, Serializable {
    #private;
    optional: boolean;
    get [Symbol.toStringTag](): string;
    get name(): string;
    get value(): any;
    constructor(name: string, value: any);
    equals(value: any): boolean;
    toJSON(): JSONValue;
    toString(): string;
}
export declare class MutablePropertyValues
    extends RingBuffer<PropertyValue>
    implements ArrayLike<PropertyValue>, Equatable, Iterable<PropertyValue>, Serializable
{
    get propertyValues(): PropertyValue[];
    get [Symbol.toStringTag](): string;
    constructor(properties?: Iterable<PropertyValue>);
    addPropertyValue(name: string, value: any): any;
    addPropertyValue(pv: PropertyValue): any;
    equals(value: any): boolean;
    getValue(propertyName: string): any;
    getPropertyValue(propertyName: string): PropertyValue;
}
//# sourceMappingURL=property-value.d.ts.map
