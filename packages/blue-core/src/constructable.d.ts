/**
 * @author Jeff Rose
 */
/**
 * Represents a constructor type, allowing for the creation of new instances of a class.
 * @template T - The type of the instance created by the constructor. Defaults to an empty object.
 */
export type Constructable<T = {}> = new (...args: any[]) => T;
/**
 * Type guard to check if a value is a `Constructable` (i.e., a class constructor).
 * @param value - The value to check.
 * @returns `true` if the value is `Constructable`, `false` otherwise.
 * @remarks This is not a perfect test as `prototype` is optional on some constructables.
 */
export declare const likeConstructable: (value: unknown) => value is Constructable;
