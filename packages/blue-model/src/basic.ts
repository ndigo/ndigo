/**
 * @author Jeff Rose
 */
import { isPrimitive } from '@blue/core';
import { __, T } from '@blue/util/function';
import { filter, length, uniq } from '@blue/util/list';
import { both, complement, isEmpty } from '@blue/util/logic';
import { equals, gt, lt } from '@blue/util/relation';
import { trim } from '@blue/util/string';
import { isNumber, isString } from '@blue/util/types';
import { isFuture, isPast } from '@blue/util/date';
import { BasicModel } from 'objectmodel';
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
    isNotEmpty = complement(isEmpty),
    isNormalized = (str: string) => str.normalize() === str,
    isTrimmed = (str: string) => trim(str) === str,
    isUnique = (arr: Array<any>) => equals(uniq(arr), arr);

// eslint-disable-next-line no-undef
export const Primitive = BasicModel([BigInt, Boolean, Number, String, Symbol, null, undefined])
    .assert(isPrimitive)
    .as('Primitive');

// Booleans-like
export const Falsy = BasicModel(Primitive).assert(isFalsy).as('Falsy');
export const Truthy = BasicModel([Primitive, Object]).assert(isTruthy).as('Truthy');

// Numbers
export const Integer = BasicModel(Number).assert(isInteger).as('Integer');
export const SafeInteger = BasicModel(Number).assert(isSafeInteger).as('SafeInteger');
export const FiniteNumber = BasicModel(Number).assert(isFinite).as('FiniteNumber');
export const PositiveNumber = BasicModel(Number).assert(isPositiveNumber).as('PositiveNumber');
export const NegativeNumber = BasicModel(Number).assert(isNegativeNumber).as('NegativeNumber');
export const PositiveInteger = PositiveNumber.extend().assert(isInteger).as('PositiveInteger');
export const NegativeInteger = NegativeNumber.extend().assert(isInteger).as('NegativeInteger');

// Strings
export const FullString = BasicModel(String)
    .assert(isNotBlank as any)
    .as('FullString');
export const NormalizedString = BasicModel(String)
    .assert(isNormalized as any)
    .as('NormalizedString');
export const TrimmedString = BasicModel(String)
    .assert(isTrimmed as any)
    .as('TrimmedString');

// Dates
export const PastDate = BasicModel(Date)
    .assert(isPast as any)
    .as('PastDate');
export const FutureDate = BasicModel(Date)
    .assert(isFuture as any)
    .as('FutureDate');

// Arrays
export const FullArray = BasicModel(Array)
    .assert(isNotEmpty as any)
    .as('FullArray');
export const UniqueArray = BasicModel(Array)
    .assert(isUnique as any)
    .as('UniqueArray');
export const DenseArray = BasicModel(Array)
    .assert(isDense as any)
    .as('DenseArray');

// Others
export const PromiseOf = (model) => (p) => BasicModel(Promise)(p).then((x) => model(x));
