/**
 * @author Jeff Rose
 */
import { isPrimitive } from '@blue/core';
import { __, T } from '@blue/util/function';
import { filter, length, uniq } from '@blue/util/list';
import { both, complement, isEmpty, isNotEmpty } from '@blue/util/logic';
import { equals, gt, lt } from '@blue/util/relation';
import { trim } from '@blue/util/string';
import { isNumber, isString } from '@blue/util/types';
import { isFuture, isPast } from '@blue/util/date';
import { BasicModel } from 'objectmodel';
/**
 * Re-exports the base ObjectModel constructor for building BlueJS models.
 */
export { BasicModel } from 'objectmodel';

const { isFinite, isInteger, isSafeInteger } = Number,
    isDense = (arr: Array<any>) => equals(length(filter(T, arr)), length(arr)),
    greaterThanZero = gt(__, 0),
    lessThanZero = lt(__, 0),
    isFalsy = (x) => !x,
    isTruthy = (x) => !!x,
    isNotBlank = complement(both(isString, isEmpty)),
    isNegativeNumber = both(isNumber, lessThanZero) as (value) => value is number,
    isPositiveNumber = both(isNumber, greaterThanZero) as (value) => value is number,
    isNormalized = (str: string) => str.normalize() === str,
    isTrimmed = (str: string) => trim(str) === str,
    isUnique = (arr: Array<any>) => equals(uniq(arr), arr);

/**
 * Matches primitive values accepted by ObjectModel.
 */
// eslint-disable-next-line no-undef
export const Primitive = BasicModel([BigInt, Boolean, Number, String, Symbol, null, undefined])
    .assert(isPrimitive)
    .as('Primitive');

// Booleans-like
/**
 * Matches values that are falsey at runtime.
 */
export const Falsy = BasicModel(Primitive).assert(isFalsy).as('Falsy');
/**
 * Matches values that are truthy at runtime.
 */
export const Truthy = BasicModel([Primitive, Object]).assert(isTruthy).as('Truthy');

// Numbers
/**
 * Matches integer numbers.
 */
export const Integer = BasicModel(Number).assert(isInteger).as('Integer');
/**
 * Matches integers that are safe to represent exactly in JavaScript.
 */
export const SafeInteger = BasicModel(Number).assert(isSafeInteger).as('SafeInteger');
/**
 * Matches finite numeric values.
 */
export const FiniteNumber = BasicModel(Number).assert(isFinite).as('FiniteNumber');
/**
 * Matches numeric values greater than zero.
 */
export const PositiveNumber = BasicModel(Number).assert(isPositiveNumber).as('PositiveNumber');
/**
 * Matches numeric values less than zero.
 */
export const NegativeNumber = BasicModel(Number).assert(isNegativeNumber).as('NegativeNumber');
/**
 * Matches positive integers.
 */
export const PositiveInteger = PositiveNumber.extend().assert(isInteger).as('PositiveInteger');
/**
 * Matches negative integers.
 */
export const NegativeInteger = NegativeNumber.extend().assert(isInteger).as('NegativeInteger');

// Strings
/**
 * Matches strings that are not blank.
 */
export const FullString = BasicModel(String)
    .assert(isNotBlank as any)
    .as('FullString');
/**
 * Matches strings already in normalized Unicode form.
 */
export const NormalizedString = BasicModel(String)
    .assert(isNormalized as any)
    .as('NormalizedString');
/**
 * Matches strings without leading or trailing whitespace.
 */
export const TrimmedString = BasicModel(String)
    .assert(isTrimmed as any)
    .as('TrimmedString');

// Dates
/**
 * Matches dates in the past.
 */
export const PastDate = BasicModel(Date)
    .assert(isPast as any)
    .as('PastDate');
/**
 * Matches dates in the future.
 */
export const FutureDate = BasicModel(Date)
    .assert(isFuture as any)
    .as('FutureDate');

// Arrays
/**
 * Matches arrays that contain at least one item.
 */
export const FullArray = BasicModel(Array)
    .assert(isNotEmpty as any)
    .as('FullArray');
/**
 * Matches arrays whose values are unique.
 */
export const UniqueArray = BasicModel(Array)
    .assert(isUnique as any)
    .as('UniqueArray');
/**
 * Matches arrays without sparse holes.
 */
export const DenseArray = BasicModel(Array)
    .assert(isDense as any)
    .as('DenseArray');

// Others
/**
 * Creates a promise model that validates the resolved value with another model.
 *
 * @param model - Model used to validate the fulfilled value.
 * @returns A function that wraps a promise and validates its resolution.
 */
export const PromiseOf = (model) => (p) => BasicModel(Promise)(p).then((x) => model(x));
