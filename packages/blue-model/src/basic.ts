/**
 * @author Jeff Rose
 */
import { isPrimitive } from '@blue/core';
import { isNumber, isString } from '@blue/util/types';
import { isFuture, isPast } from '@blue/util/date';
import { BasicModel } from 'objectmodel';
/**
 * Re-exports the base ObjectModel constructor for building BlueJS models.
 */
export { BasicModel } from 'objectmodel';

const { isFinite, isInteger, isSafeInteger } = Number,
    isDense = (arr: Array<any>): boolean => {
        for (let i = 0; i < arr.length; i++) {
            if (!(i in arr)) return false;
        }
        return true;
    },
    greaterThanZero = (x: number) => x > 0,
    lessThanZero = (x: number) => x < 0,
    isFalsy = (x: any) => !x,
    isTruthy = (x: any) => !!x,
    isNotBlank = (value: unknown) => !(isString(value) && (value as string).length === 0),
    isNegativeNumber = ((value: any) => isNumber(value) && lessThanZero(value)) as (value: any) => value is number,
    isPositiveNumber = ((value: any) => isNumber(value) && greaterThanZero(value)) as (value: any) => value is number,
    isNormalized = (str: string) => str.normalize() === str,
    isTrimmed = (str: string) => str.trim() === str,
    isUnique = (arr: Array<any>) => new Set(arr).size === arr.length;

/**
 * Matches primitive values accepted by ObjectModel.
 */
// eslint-disable-next-line no-undef
export const Primitive = BasicModel([BigInt, Boolean, Number, String, Symbol, null, undefined])
    .assert(isPrimitive)
    .as('Primitive') as any;

// Booleans-like
/**
 * Matches values that are falsey at runtime.
 */
export const Falsy = BasicModel(Primitive).assert(isFalsy).as('Falsy') as any;
/**
 * Matches values that are truthy at runtime.
 */
export const Truthy = BasicModel([Primitive, Object]).assert(isTruthy).as('Truthy') as any;

// Numbers
/**
 * Matches integer numbers.
 */
export const Integer = BasicModel(Number).assert(isInteger).as('Integer') as any;
/**
 * Matches integers that are safe to represent exactly in JavaScript.
 */
export const SafeInteger = BasicModel(Number).assert(isSafeInteger).as('SafeInteger') as any;
/**
 * Matches finite numeric values.
 */
export const FiniteNumber = BasicModel(Number).assert(isFinite).as('FiniteNumber') as any;
/**
 * Matches numeric values greater than zero.
 */
export const PositiveNumber = BasicModel(Number).assert(isPositiveNumber).as('PositiveNumber') as any;
/**
 * Matches numeric values less than zero.
 */
export const NegativeNumber = BasicModel(Number).assert(isNegativeNumber).as('NegativeNumber') as any;
/**
 * Matches positive integers.
 */
export const PositiveInteger = PositiveNumber.extend().assert(isInteger).as('PositiveInteger') as any;
/**
 * Matches negative integers.
 */
export const NegativeInteger = NegativeNumber.extend().assert(isInteger).as('NegativeInteger') as any;

// Strings
/**
 * Matches strings that are not blank.
 */
export const FullString = BasicModel(String)
    .assert(isNotBlank as any)
    .as('FullString') as any;
/**
 * Matches strings already in normalized Unicode form.
 */
export const NormalizedString = BasicModel(String)
    .assert(isNormalized as any)
    .as('NormalizedString') as any;
/**
 * Matches strings without leading or trailing whitespace.
 */
export const TrimmedString = BasicModel(String)
    .assert(isTrimmed as any)
    .as('TrimmedString') as any;

// Dates
/**
 * Matches dates in the past.
 */
export const PastDate = BasicModel(Date)
    .assert(isPast as any)
    .as('PastDate') as any;
/**
 * Matches dates in the future.
 */
export const FutureDate = BasicModel(Date)
    .assert(isFuture as any)
    .as('FutureDate') as any;

// Arrays
/**
 * Matches arrays that contain at least one item.
 */
export const FullArray = BasicModel(Array)
    .assert(((arr: any[]) => arr.length > 0) as any)
    .as('FullArray') as any;
/**
 * Matches arrays whose values are unique.
 */
export const UniqueArray = BasicModel(Array)
    .assert(isUnique as any)
    .as('UniqueArray') as any;
/**
 * Matches arrays without sparse holes.
 */
export const DenseArray = BasicModel(Array)
    .assert(isDense as any)
    .as('DenseArray') as any;

// Others
/**
 * Creates a promise model that validates the resolved value with another model.
 *
 * @param model - Model used to validate the fulfilled value.
 * @returns A function that wraps a promise and validates its resolution.
 */
export const PromiseOf = (model: any) => (p: any) => BasicModel(Promise)(p).then((x: any) => model(x));
