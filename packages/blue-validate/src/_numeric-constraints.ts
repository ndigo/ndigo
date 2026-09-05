import {
    anyAlphaNumericRule,
    notACapitalRule,
    notAnAlphaRule,
    notANumberRule,
    notAPasswordSymbolRule,
    whitespaceRule,
    currencyFormats,
    integerRule,
    realRule,
    CurrencyFormat,
} from './formats';
import { toString } from '@blue/util/string';
import { serializable } from '@blue/core';

import standardConstraints from './standard-constraints';

type Counter = (value: string) => number;

const { parseFloat, parseInt } = Number;

const _pipe =
    <T>(...fns: Array<(x: T) => T>) =>
    (x: T): T =>
        fns.reduce((v: T, f) => f(v), x);

const appendEmptyString: (list: string[]) => string[] = (arr: string[]) => [...arr, ''];

const isOne = (x: any) => x === 1;

const isArray = Array.isArray;

const isUndefined = (x: any) => x === undefined;

const isDefined = (value: unknown) => !isUndefined(value);

const isString = (x: any): x is string => x instanceof String || typeof x === 'string';

const lengthIsOne = (x: any): boolean => x?.length === 1;

const _replace = (pattern: RegExp | string, replacement: string) => (s: string) => s.replace(pattern, replacement);

const _split = (sep: RegExp | string) => (s: string) => s.split(sep);

const splitOnDot = _split(/\./);

const isSingleSpaced: (value: string) => boolean = (value: string): boolean =>
    !value.split(' ').some((s) => s.length === 0);

const lengthOf: (value: any) => number = (x: any) => x?.length;

const removeAnyAlphaNumber: (s: string) => string = _replace(anyAlphaNumericRule, '');

const removeLowerCase: (s: string) => string = _replace(notACapitalRule, '');

const removeNonAlpha: (s: string) => string = _replace(notAnAlphaRule, '');

const removeNonNumber: (s: string) => string = _replace(notANumberRule, '');

const removeNonPasswordSymbol: (s: string) => string = _replace(notAPasswordSymbolRule, '');

const removeLeadingSlash: (s: string) => string = _replace(/^\//, '');

const removeTrailingSlash: (s: string) => string = _replace(/\/$/, '');

const removeTrailingSlashAndFlags: (s: string) => string = _replace(/\/[^/]*$/, '');

const removeSlashes: (s: string) => string = _pipe(removeLeadingSlash, removeTrailingSlash);

const removeSlashesAndFlags: (s: string) => string = _pipe(removeLeadingSlash, removeTrailingSlashAndFlags);

const removeWhitespace: (s: string) => string = _replace(whitespaceRule, '');

const alphaCount: Counter = (value: string) => lengthOf(removeNonAlpha(toString(value)));

const numberCount: Counter = (value: string) => lengthOf(removeNonNumber(toString(value)));

const passwordSymbolCount: Counter = (value: string) => lengthOf(removeNonPasswordSymbol(toString(value)));

const specialsCount: Counter = (value: string) => lengthOf(removeAnyAlphaNumber(toString(value)));

const upperCaseCount: Counter = (value: string) => lengthOf(removeLowerCase(toString(value)));

const valueCount: Counter = (value: string) => lengthOf(toString(value));

export type Params<T = any> = {
    value?: T;
};

export type DigitsParams = Params & {
    fraction?: number;
    integer?: number;
};

export type MoneyParams = Params & {
    currencyFormat?: CurrencyFormat;
    format?: string;
};

export type PatternParams = Params & {
    regex?: RegExp | string;
    flags?: string;
};

export type RangeParams = Params & {
    max?: any;
    min?: any;
    value?: number;
};

export type SetParams = RangeParams & {
    constraints?: any[];
};

export type StepParams = RangeParams & {
    step: number;
};

export type constraint<T = serializable> = (value: T, params?: Params) => boolean;

export type Constraint<T = serializable> = {
    validate: constraint<T>;
};

export type ValidationConstraints = {
    [name: string]: Constraint;
};

/**
 * Creates a constraint that validates a value against a regex pattern.
 * @param {PatternParams} params - Pattern parameters including regex and optional flags
 * @returns {constraint} A constraint function
 * `security` WARNING: The `regex` parameter should not contain untrusted user input.
 *   Patterns with nested quantifiers (e.g., /(a+)+/) can cause ReDoS (Regex Denial of Service).
 *   Only use with developer-controlled patterns.
 * @internal
 */
const patternConstraint =
    ({ regex, flags }: PatternParams) =>
    (value: serializable, params?: Params): boolean => {
        if (typeof value !== 'string' && typeof value !== 'number') {
            return false;
        }
        if (regex === undefined) {
            return false;
        }

        const normalizedRegex = isString(regex) ? removeSlashes(regex as string) : regex;

        const matcher: RegExp =
            isString(flags) && flags.length > 0
                ? new RegExp(removeSlashesAndFlags(String(normalizedRegex)), flags)
                : new RegExp(normalizedRegex);

        return matcher.test(String(value));
    };

/**
 * Validates a range
 * @param {string} The value expected
 * @param {Object} params Expected parameters
 * @param {Object} params.min Lowest amount in the range
 * @param {Object} params.max Highest amount in the range
 */
const rangeValidator: constraint = function (value, params: RangeParams = {}): boolean {
    const valueToCompare = Number(value);
    let min: number, max: number;

    // Process params
    if (isDefined(params.value)) {
        min = max = Number(params.value);
    } else {
        const rawMin = Number(params.min ?? 0);
        const rawMax = Number(params.max ?? Number.MAX_VALUE);
        min = Number.isNaN(rawMin) ? 0 : rawMin;
        max = Number.isNaN(rawMax) ? Number.MAX_VALUE : rawMax;
    }

    return valueToCompare >= min && valueToCompare <= max;
};

/**
 * Validates digits to have a certain amount of decimal numbers and/or integer numbers
 * @param {string} The value expected
 * @param {DigitsParams} params parameters
 */
const isDigits: constraint = (value, params: DigitsParams = { integer: -1, fraction: -1 }): boolean => {
    const { integer = -1, fraction = -1 } = params;
    let result = false;

    const strValue = toString(value);
    if (strValue.length > 0 && integer > -1 && fraction > -1) {
        const rawParts = splitOnDot(removeWhitespace(strValue));
        const parts: string[] = rawParts.length === 1 ? [...rawParts, ''] : rawParts;

        if (integer > 0) {
            result = parts[0].length <= integer;
        } else {
            result = true; // we don't care about the number of digits in the integer part
        }

        if (fraction > 0) {
            result = result && parts[1].length <= fraction;
        }
    }

    return result;
};

const isInteger: constraint = patternConstraint({ regex: integerRule.source });

const isITINRange: constraint = (value) => {
    const text = toString(value),
        length: number = text.length;
    let n = length < 4 ? 0 : Number(text[3]);

    if (length > 4 && n >= 7) {
        n = n * 10 + Number(text[4]);
    } // fourth and fifth positions values are 70-88, 90-92, 94-99, partial validation true when not enough characters

    return length < 4 || (length === 4 && n >= 7) || (n >= 70 && n <= 88) || (n >= 90 && n <= 92) || n >= 94;
};

/**
 * Validates a number to be less than
 * @param {string} The value expected
 * @param {Object} params Expected parameters
 * @param {Object} params.value Upper bound value for the range
 */
const isMax: constraint = (value, params: Params = {}) => parseFloat(value as any) <= parseFloat(params.value);

/**
 * Validates a number to be greater than
 * @param {string} The value expected
 * @param {Object} params Expected parameters
 * @param {Object} params.value Lower bound value for the range
 */
const isMin: constraint = (value, params: Params = {}) => parseFloat(value as any) >= parseFloat(params.value);

/** Validates currency based on these rules (BLUEJS-741) */
const isMoney: constraint = (value, params: MoneyParams = { format: 'USD' }) =>
    (params.currencyFormat || currencyFormats[params.format || 'USD']).regex.test(toString(value));

const isNumbers: constraint = (value: serializable, params?: Params) =>
    rangeValidator(numberCount(value as string), { min: 1, ...(params as RangeParams) });

/**
 * Validates a range
 * @param {string} The value expected
 * @param {Object} params Expected parameters
 * @param {Object} params.min Lowest amount in the range
 * @param {Object} params.max Highest amount in the range
 */
const isRange: constraint = (value: serializable, params: Params = {}) => rangeValidator(value, params as RangeParams);

const isReal: constraint = patternConstraint({ regex: realRule.source });

const isRoutingNumber: constraint = (value): boolean => {
    let n = 0,
        i = 0;
    const strValue = toString(value);
    const length = strValue.length;

    value = toString(value);

    for (; i < length; i += 3) {
        n +=
            parseInt(strValue.charAt(i), 10) * 3 +
            parseInt(strValue.charAt(i + 1), 10) * 7 +
            parseInt(strValue.charAt(i + 2), 10);
    }

    return n !== 0 && n % 10 === 0;
};

const isSpecials: constraint = (value: serializable, params?: Params) =>
    rangeValidator(specialsCount(value as string), { min: 1, ...(params as RangeParams) });

/**
 * Validates a value as a valid step in a possible range
 * @param {string} value The value expected
 * @param {Object} params Expected parameters
 * @param {Object} params.min Lowest amount in the range
 * @param {Object} params.max Highest amount in the range
 * @param {Object} params.step Incremental or decremental step amount
 */
const isStep: constraint = (value: serializable, params?: Params) => {
    const parsed = Number(value),
        step = Number((params as StepParams | undefined)?.step ?? 1);

    return rangeValidator(parsed, params) && parsed % step === 0;
};

/**
 * Validates a value with a set of constraints, requiring a minimum to be true
 * @param {string} value value to validate
 * @param {Object} params expected parameters
 * @param {Object} params.constraint set of constraints as an array
 * @param {Object} params.constraint.type constraint name
 * @param {Object} params.constraint.params constraint params
 * @param {Object} params.min the minimum number of constraints in the set that must be true
 */
const isConstraintSet: constraint = (value, params: SetParams = {}) => {
    const _value = value;
    return rangeValidator(
        (params.constraints ?? []).reduce(function (previousValue, constraint) {
            const type = constraint.type;
            if (!type || !Object.prototype.hasOwnProperty.call(standardConstraints, type)) {
                return previousValue;
            }
            return previousValue + (Number(standardConstraints[type].validate(_value, constraint.params)) || 0);
        }, 0),
        params
    );
};

export {
    parseFloat,
    parseInt,
    _pipe,
    appendEmptyString,
    isOne,
    isArray,
    isUndefined,
    isDefined,
    isString,
    lengthIsOne,
    _replace,
    _split,
    splitOnDot,
    isSingleSpaced,
    lengthOf,
    removeAnyAlphaNumber,
    removeLowerCase,
    removeNonAlpha,
    removeNonNumber,
    removeNonPasswordSymbol,
    removeLeadingSlash,
    removeTrailingSlash,
    removeTrailingSlashAndFlags,
    removeSlashes,
    removeSlashesAndFlags,
    removeWhitespace,
    alphaCount,
    numberCount,
    passwordSymbolCount,
    specialsCount,
    upperCaseCount,
    valueCount,
    patternConstraint,
    rangeValidator,
    isDigits,
    isInteger,
    isITINRange,
    isMax,
    isMin,
    isMoney,
    isNumbers,
    isRange,
    isReal,
    isRoutingNumber,
    isSpecials,
    isStep,
    isConstraintSet,
    toString,
};
