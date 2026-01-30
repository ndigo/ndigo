/**
 * @author Jeff Rose
 */

import {
    ALPHA_REGEX,
    ALPHA_NUMERIC_REGEX,
    ALPHA_NUMERIC_PLUS_REGEX,
    ADDRESS_LINE_REGEX,
    POSTAL_CODE_REGEX,
    ZIP_CODE_REGEX,
    ZIP_CODE_EXTENSION_REGEX,
    CITY_REGEX,
    DEFAULT_DATE_FORMAT,
    BOOLEAN_REGEX,
    WHITESPACE_REGEX,
    NOT_A_CAPITAL_REGEX,
    NOT_AN_ALPHA_REGEX,
    EMAIL_REGEX,
    NOT_PHONE_EMAIL_REGEX,
    INTEGER_REGEX,
    currencyFormats,
    REPEATING_SEQUENCE_REGEX,
    NOT_A_NUMBER_REGEX,
    NUMERIC_REGEX,
    PASSWORD_FORMAT,
    NOT_A_PASSWORD_SYMBOL,
    NAME_REGEX,
    REAL_REGEX,
    ANY_ALPHA_NUMERIC_REGEX,
    SSN_FORMAT,
    SSN_EXCLUDE_FORMAT,
    SSN_OAO_FORMAT,
    SSN_VALID_GROUPS_FORMAT,
    URL_REGEX,
    PHONE_NORTH_AMERICA,
    PHONE_OAO_FORMAT,
    CurrencyFormat,
} from './formats';
import { curry, identity, pipe } from '@blue/util/function';
import { any, append } from '@blue/util/list';
import { both, complement, defaultTo, isEmpty, ifElse, when } from '@blue/util/logic';
import { prop } from '@blue/util/object';
import { equals, gte, lte } from '@blue/util/relation';
import { replace, split, test, toString } from '@blue/util/string';
import { is } from '@blue/util/types';
import { propSatisfies } from '@blue/util/logic';
import { serializable } from '@blue/core';

type Counter = (value) => number;

type temporal = string | Date;
type pattern = string | RegExp;

const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

const daysInMonth = (year: number, month: number): number => {
    // month is 1-12
    return new Date(year, month, 0).getDate();
};

const normalizeToDate = (value: temporal, format: string = DEFAULT_DATE_FORMAT): Date | null => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (!is(String)(value)) {
        return null;
    }

    const text = String(value).trim();

    // Only strict-parse the default date format for now.
    if (format !== DEFAULT_DATE_FORMAT) {
        return null;
    }

    const match = DATE_PATTERN.exec(text);
    if (!match) {
        return null;
    }

    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);

    if (month < 1 || month > 12) {
        return null;
    }

    const maxDay = daysInMonth(year, month);
    if (day < 1 || day > maxDay) {
        return null;
    }

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date: Date): Date => {
    const copy = new Date(date.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
};

export type Params<T = any> = {
    value?: T;
};

type DateParams = Params & {
    format?: string;
};

type DigitsParams = Params & {
    fraction?: number;
    integer?: number;
};

type MoneyParams = Params & {
    currencyFormat?: CurrencyFormat;
    format?: string;
};

type NonConsecutiveAlphaNumericsParams = Params & {
    maxSequential: number;
};

type NonRepeatingAlphaNumericsParams = Params & {
    maxRepeating: number;
};

type PatternParams = Params & {
    regex?: RegExp | string;
    flags?: string;
};

type RangeParams = Params & {
    max?: any;
    min?: any;
    value?: number;
};

type SetParams = RangeParams & {
    constraints?: any[];
};

type StepParams = RangeParams & {
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
 * @typedef {Object} Params
 * @property {*} value
 */

/**
 * @typedef {Params} DateParams
 * @property {string} format
 */

/**
 * @typedef {Params} DigitsParams
 * @property {number} integer The maximum number of integral digits accepted for this number.
 * @property {number} fraction The number of fractional digits accepted for this number.
 */

/**
 * @typedef {Params} MoneyParams
 * @property {number} currencyFormat
 * @property {number} integer
 */

/**
 * @typedef {Params} NonConsecutiveAlphaNumericsParams
 * @property {number} maxSequential
 */

/**
 * @typedef {Params} NonRepeatingAlphaNumericsParams
 * @property {number} maxRepeating
 */

/**
 * @typedef {Params} PatternParams
 * @property {string|external:RegExp} regex
 * @property {string} flags
 */

const { parseFloat, parseInt } = Number,
    appendEmptyString: (list: string[]) => string[] = append(''),
    defaultToZero = defaultTo(0),
    defaultToMaxValue = defaultTo(Number.MAX_VALUE),
    isOne = equals(1),
    isArray = Array.isArray,
    isUndefined = equals(void 0),
    isDefined = complement(isUndefined),
    isString = is(String) as (value) => value is string,
    lengthIsOne: (value: any) => boolean = propSatisfies(isOne, 'length'),
    splitOnDot = split(/\./),
    isSingleSpaced: (value: string) => boolean = complement(pipe(split(' '), any(isEmpty))),
    lengthOf: (value: any) => number = prop('length'),
    removeAnyAlphaNumber = replace(ANY_ALPHA_NUMERIC_REGEX, ''),
    removeLowerCase = replace(NOT_A_CAPITAL_REGEX, ''),
    removeNonAlpha = replace(NOT_AN_ALPHA_REGEX, ''),
    removeNonNumber = replace(NOT_A_NUMBER_REGEX, ''),
    removeNonPasswordSymbol = replace(NOT_A_PASSWORD_SYMBOL, ''),
    removeLeadingSlash = replace(/^\//, ''),
    removeTrailingSlash = replace(/\/$/, ''),
    removeTrailingSlashAndFlags = replace(/\/[^/]*$/, ''),
    removeSlashes = pipe(removeLeadingSlash, removeTrailingSlash),
    removeSlashesAndFlags = pipe(removeLeadingSlash, removeTrailingSlashAndFlags),
    removeWhitespace = replace(WHITESPACE_REGEX, ''),
    alphaCount: Counter = pipe(toString, removeNonAlpha, lengthOf),
    numberCount: Counter = pipe(toString, removeNonNumber, lengthOf),
    passwordSymbolCount: Counter = pipe(toString, removeNonPasswordSymbol, lengthOf),
    specialsCount: Counter = pipe(toString, removeAnyAlphaNumber, lengthOf),
    upperCaseCount: Counter = pipe(toString, removeLowerCase, lengthOf),
    valueCount: Counter = pipe(toString, lengthOf),
    patternConstraint = curry(({ regex, flags = null }: PatternParams, value: string): boolean => {
        regex = ifElse(isString, removeSlashes, identity)(regex);

        const matcher: RegExp = isString(flags)
            ? new RegExp(pipe(toString, removeSlashesAndFlags)(regex), flags)
            : new RegExp(regex);

        return test(matcher, value);
    }) as unknown as constraint<serializable>,
    isAddressLine: constraint = patternConstraint({
        regex: ADDRESS_LINE_REGEX.source,
    }) as unknown as constraint<serializable>,
    isAlpha: constraint = patternConstraint({ regex: ALPHA_REGEX.source }) as unknown as constraint<serializable>,
    isAlphaNumeric: constraint = patternConstraint({
        regex: ALPHA_NUMERIC_REGEX.source,
    }) as unknown as constraint<serializable>,
    isAlphaNumericPlus: constraint = patternConstraint({
        regex: ALPHA_NUMERIC_PLUS_REGEX.source,
    }) as unknown as constraint<serializable>,
    isBlank: constraint = pipe(toString, removeWhitespace, isEmpty) as unknown as constraint<serializable>,
    isBoolean: constraint = patternConstraint({ regex: BOOLEAN_REGEX }) as unknown as constraint<serializable>,
    isCapitals: constraint = (value, params: RangeParams = { min: 1 }) => rangeValidator(upperCaseCount(value), params),
    isCharacters: constraint = (value, params: RangeParams = { min: 1 }) => rangeValidator(alphaCount(value), params),
    isCity: constraint = both(isSingleSpaced, test(CITY_REGEX)),
    /**
     * Validates a value with a set of constraints, requiring a minimum to be true
     * @param {string} value value to validate
     * @param {Object} params expected parameters
     * @param {Object} params.constraint set of constraints as an array
     * @param {Object} params.constraint.type constraint name
     * @param {Object} params.constraint.params constraint params
     * @param {Object} params.min the minimum number of constraints in the set that must be true
     */
    isConstraintSet: constraint = (value, params: SetParams) => {
        const _value = value;
        return rangeValidator(
            params.constraints.reduce(function (previousValue, constraint) {
                return (
                    previousValue +
                    (Number(standardConstraints[constraint.type].validate(_value, constraint.params)) || 0)
                );
            }, 0),
            params
        );
    },
    isDate18YearsOld: constraint = (value, params: DateParams = { format: DEFAULT_DATE_FORMAT }) => {
        //const
        //    { format } = params,
        //    data	= moment( value, format, true ),
        //    valid	= data.isValid() && moment().diff( data, 'years' ) > 17;
        //return valid;
        const format = params.format || DEFAULT_DATE_FORMAT;
        const date = normalizeToDate(value, format);
        if (!date) {
            return false;
        }

        const today = startOfDay(new Date());
        const dob = startOfDay(date);

        let age = today.getFullYear() - dob.getFullYear();
        const monthDelta = today.getMonth() - dob.getMonth();
        if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
            age -= 1;
        }

        return age >= 18;
    },
    isDateRange: constraint = (value, params: DateParams & RangeParams = {}) => {
        // const
        //     format	= params.format || DEFAULT_DATE_FORMAT,
        //     date	= moment( value, format, true );
        // let valid: boolean = date.isValid();
        // if( valid && isDefined( params.value ) ){
        //     valid = date.isSame( moment( params.value, format, true ) );
        // }
        // if( valid && isDefined( params.min ) ){
        //     const min = moment( params.min, format, true );
        //     valid = date.isSame( min ) || date.isAfter( min );
        // }
        // if( valid && isDefined( params.max ) ){
        //     const max = moment( params.max, format, true );
        //     valid = date.isSame( max ) || date.isBefore( max );
        // }
        // return valid;
        const format = params.format || DEFAULT_DATE_FORMAT;
        const date = normalizeToDate(value, format);
        if (!date) {
            return false;
        }

        const target = startOfDay(date).getTime();

        if (isDefined(params.value)) {
            const expected = normalizeToDate(params.value as any, format);
            return !!expected && target === startOfDay(expected).getTime();
        }

        if (isDefined(params.min)) {
            const minDate = normalizeToDate(params.min as any, format);
            if (!minDate) {
                return false;
            }
            if (target < startOfDay(minDate).getTime()) {
                return false;
            }
        }

        if (isDefined(params.max)) {
            const maxDate = normalizeToDate(params.max as any, format);
            if (!maxDate) {
                return false;
            }
            if (target > startOfDay(maxDate).getTime()) {
                return false;
            }
        }

        return true;
    },
    /**
     * Validates digits to have a certain amount of decimal numbers and/or integer numbers
     * @param {string} The value expected
     * @param {DigitsParams} params parameters
     */
    isDigits: constraint<string> = (value, params: DigitsParams = { integer: -1, fraction: -1 }): boolean => {
        const { integer, fraction } = params;
        let result = false;

        value = toString(value);

        if (value.length > 0 && integer > -1 && fraction > -1) {
            const parts: string[] = pipe(removeWhitespace, splitOnDot, when(lengthIsOne, appendEmptyString))(value);

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
    },
    isEmail: constraint = patternConstraint({ regex: EMAIL_REGEX }) as unknown as constraint<serializable>,
    isEnum: constraint = (value, params: Params = {}): boolean => {
        const enumeration = isString(params.value)
            ? params.value.split(' ')
            : !isArray(params.value)
              ? []
              : params.value;

        return enumeration.indexOf(value) !== -1;
    },
    isFuture = (value: temporal, format: string = DEFAULT_DATE_FORMAT): boolean => {
        //const date = isString( value ) ?
        //    moment( value, format, true ) :
        //    moment( value );
        //return date.isValid() && date.isAfter();
        const date = normalizeToDate(value, format);
        if (!date) {
            return false;
        }

        const target = startOfDay(date).getTime();
        const today = startOfDay(new Date()).getTime();
        return target > today;
    },
    isInteger: constraint = patternConstraint({ regex: INTEGER_REGEX.source }) as unknown as constraint<serializable>,
    isITINRange: constraint = (value) => {
        const text = toString(value),
            length: number = text.length;
        let n = length < 4 ? 0 : Number(text[3]);

        if (length > 4 && n >= 7) {
            n = n * 10 + Number(text[4]);
        } // fourth and fifth positions values are 70-88, 90-92, 94-99, partial validation true when not enough characters

        return length < 4 || (length === 4 && n >= 7) || (n >= 70 && n <= 88) || (n >= 90 && n <= 92) || n >= 94;
    },
    isLength: constraint = (value, params: RangeParams) => rangeValidator(valueCount(value), params),
    /**
     * Validates a number to be less than
     * @param {string|external:number} value The value to be tested
     * @param {Param} params
     * @returns {boolean} Whether or not the `value` is less than or equal to `params.value`.
     */
    isMax: constraint<string> = (value, params: Params = {}) => lte(parseFloat(value as any), parseFloat(params.value)),
    /**
     * Validates a number to be greater than
     * @param {string|external:number} value The value to be tested
     * @param {Param} params
     * @returns {boolean} Whether or not the `value` is greater than or equal to `params.value`.
     */
    isMin: constraint<string> = (value, params: Params = {}) => gte(parseFloat(value as any), parseFloat(params.value)),
    /** Validates currency based on these rules (BLUEJS-741) */
    isMoney: constraint<string> = (value, params: MoneyParams = { format: 'USD' }) =>
        (params.currencyFormat || currencyFormats[params.format || 'USD']).regex.test(toString(value)),
    isMustBeginWith: constraint<string> = (value, params: Params = {}) => {
        value = toString(value);
        return value.length === 0 || value[0] === params.value;
    },
    isNonConsecutiveAlphaNumerics: constraint<string> = (
        value,
        params: NonConsecutiveAlphaNumericsParams = { maxSequential: 2 }
    ) => {
        const valuesArray = toString(value).split(''),
            count = value.length,
            maxSequential = params.maxSequential;
        let currentConsecutive = 1;

        if (count < maxSequential) {
            return true;
        }

        // Check for sequentials going forward (e.g. 'abc' or '123')
        for (var i = 0; i < count - 1; ++i) {
            var currentCharCode = valuesArray[i].toLowerCase().charCodeAt(0),
                nextCharCode = valuesArray[i + 1].toLowerCase().charCodeAt(0);

            // numbers: 48-57
            // cap alpha: 65-90
            // lower alpha: 97-122
            if (
                currentCharCode === nextCharCode - 1 &&
                ((currentCharCode >= 48 && currentCharCode < 57) || (currentCharCode >= 97 && currentCharCode < 122))
            ) {
                currentConsecutive++;
                if (currentConsecutive === maxSequential) {
                    return false;
                }
            } else {
                currentConsecutive = 1;
            }
        }

        // Check for sequentials going backwards (e.g. '321' or 'cba')
        for (i = count - 1; i >= 1; --i) {
            var reverseCurrentCharCode = valuesArray[i].charCodeAt(0),
                previousCharCode = valuesArray[i - 1].charCodeAt(0);

            if (
                reverseCurrentCharCode === previousCharCode - 1 &&
                ((currentCharCode > 48 && currentCharCode <= 57) || (currentCharCode > 97 && currentCharCode <= 122))
            ) {
                currentConsecutive++;
                if (currentConsecutive === maxSequential) {
                    return false;
                }
            } else {
                currentConsecutive = 1;
            }
        }

        return true;
    },
    isNonRepeatingAlphaNumerics: constraint<string> = (
        value,
        params: NonRepeatingAlphaNumericsParams = { maxRepeating: 2 }
    ) => {
        let regexString = '([a-z\\d])';
        for (let i = 0; i < params.maxRepeating; ++i) {
            regexString += '\\1';
        }
        const regex = new RegExp(regexString, 'gi');
        return !regex.test(value);
    },
    isNonRepeatingSequence: constraint = complement(
        test(REPEATING_SEQUENCE_REGEX)
    ) as unknown as constraint<serializable>,
    isNotAPhoneEmail: constraint = complement(test(NOT_PHONE_EMAIL_REGEX)) as unknown as constraint<serializable>,
    isNotBeginWith: constraint = (value: string, params: Params = {}) => {
        value = toString(value);
        return value.length === 0 || value[0] !== params.value;
    },
    isNotBeginWith1: constraint = (value: string | number) => isNotBeginWith(value, { value: '1' }),
    isNotBlank: constraint = complement(isBlank),
    isNumbers: constraint = (value, params: RangeParams = { min: 1 }) => rangeValidator(numberCount(value), params),
    isNumeric: constraint = patternConstraint({ regex: NUMERIC_REGEX.source }) as unknown as constraint<serializable>,
    isPasswordCharacters: constraint = patternConstraint({
        regex: PASSWORD_FORMAT.source,
    }) as unknown as constraint<serializable>,
    isPasswordSymbols: constraint = (value, params: RangeParams = { min: 1 }) =>
        rangeValidator(passwordSymbolCount(value), params),
    isPast = (value: temporal, format: string = DEFAULT_DATE_FORMAT): boolean => {
        //const date = isString( value ) ?
        //    moment( value, format, true ) :
        //    moment( value );
        //return date.isValid() && date.isBefore();
        const date = normalizeToDate(value, format);
        if (!date) {
            return false;
        }

        const target = startOfDay(date).getTime();
        const today = startOfDay(new Date()).getTime();
        return target < today;
    },
    /**
     * Validates a regular expression pattern
     * @param {string} The value expected
     * @param {string|external:RegExp} regexp The regular expression to be used
     * @param {string} flags The flags to be used with the regular expression
     */
    isPatternMatch = (value: string, regexp: pattern, flags?: string): boolean => {
        regexp = ifElse(isString, removeSlashes, identity)(regexp);

        const matcher: RegExp = isString(flags)
            ? new RegExp(pipe(toString, removeSlashesAndFlags)(regexp), flags)
            : new RegExp(regexp);

        return test(matcher, value);
    },
    isPersonalName: constraint = patternConstraint({ regex: NAME_REGEX.source }) as unknown as constraint<serializable>,
    isPhoneNorthAmerica: constraint = patternConstraint({
        regex: PHONE_NORTH_AMERICA.source,
    }) as unknown as constraint<serializable>,
    isPhoneOao: constraint = patternConstraint({
        regex: PHONE_OAO_FORMAT.source,
    }) as unknown as constraint<serializable>,
    isPostalCode: constraint = patternConstraint({
        regex: POSTAL_CODE_REGEX.source,
    }) as unknown as constraint<serializable>,
    /**
     * Validates a range
     * @param {string} The value expected
     * @param {Object} params Expected parameters
     * @param {Object} params.min Lowest amount in the range
     * @param {Object} params.max Highest amount in the range
     */
    isRange: constraint = (value, params: RangeParams) => rangeValidator(value, params),
    isReal: constraint = patternConstraint({ regex: REAL_REGEX.source }) as unknown as constraint<serializable>,
    isRoutingNumber: constraint<string> = (value): boolean => {
        let n = 0,
            i = 0;
        const length = value.length;

        value = toString(value);

        for (; i < length; i += 3) {
            n +=
                parseInt(value.charAt(i), 10) * 3 +
                parseInt(value.charAt(i + 1), 10) * 7 +
                parseInt(value.charAt(i + 2), 10);
        }

        return n !== 0 && n % 10 === 0;
    },
    isSpecials: constraint = (value, params: RangeParams = { min: 1 }) => rangeValidator(specialsCount(value), params),
    isSsn: constraint = patternConstraint({ regex: SSN_FORMAT.source }) as unknown as constraint<serializable>,
    isSsnExclude: constraint = patternConstraint({
        regex: SSN_EXCLUDE_FORMAT.source,
    }) as unknown as constraint<serializable>,
    isSsnOao: constraint = patternConstraint({ regex: SSN_OAO_FORMAT.source }) as unknown as constraint<serializable>,
    isSsnValidGroups: constraint = patternConstraint({
        regex: SSN_VALID_GROUPS_FORMAT.source,
    }) as unknown as constraint<serializable>,
    /**
     * Validates a value as a valid step in a possible range
     * @param {string} value The value expected
     * @param {Object} params Expected parameters
     * @param {Object} params.min Lowest amount in the range
     * @param {Object} params.max Highest amount in the range
     * @param {Object} params.step Incremental or decremental step amount
     */
    isStep: constraint = (value, params: StepParams = { step: 1 }) => {
        const parsed = Number(value),
            step = Number(params.step);

        return rangeValidator(parsed, params) && parsed % step === 0;
    },
    isUrl: constraint = patternConstraint({ regex: URL_REGEX.source }) as unknown as constraint<serializable>,
    isValidDate = (value: temporal, format = DEFAULT_DATE_FORMAT): boolean => {
        /*const date = isString( value ) ?
            moment( value, format, true ) :
            moment( value );
        return date.isValid();*/
        return !!normalizeToDate(value, format);
    },
    isZipCode: constraint = patternConstraint({ regex: ZIP_CODE_REGEX.source }) as unknown as constraint<serializable>,
    isZipCodeExtension: constraint = patternConstraint({
        regex: ZIP_CODE_EXTENSION_REGEX.source,
    }) as unknown as constraint<serializable>,
    rangeValidator: constraint = function (value, params: RangeParams = {}): boolean {
        const valueToCompare = Number(value);
        let min: number, max: number;

        // Process params
        if (isDefined(params.value)) {
            min = max = Number(params.value);
        } else {
            min = defaultToZero(Number(params.min));
            max = defaultToMaxValue(Number(params.max));
        }

        return valueToCompare >= min && valueToCompare <= max;
    };

/**
 * @namespace module:validate.constraints
 */
const standardConstraints: ValidationConstraints = {
    /**
     */
    AddressLine: {
        validate: isAddressLine,
    },

    /**
     */
    Alpha: {
        validate: isAlpha,
    },

    /**
     */
    AlphaNumeric: {
        validate: isAlphaNumeric,
    },

    /**
     */
    AlphaNumericPlus: {
        validate: isAlphaNumericPlus,
    },

    /**
     */
    Blank: {
        validate: isBlank,
    },

    /**
     */
    Boolean: {
        validate: isBoolean,
    },

    /**
     */
    Capitals: {
        validate: isCapitals,
    },

    /**
     */
    Characters: {
        validate: isCharacters,
    },

    /**
     */
    City: {
        validate: isCity,
    },

    /**
     */
    ConstraintSet: {
        validate: isConstraintSet,
    },

    /**
     */
    Date: {
        validate: (value: temporal, params: DateParams = {}) => {
            const { format } = params;
            return isValidDate(value, format);
        },
    },

    /**
     */
    Date18YearsOld: {
        validate: isDate18YearsOld,
    },

    /**
     */
    DateRange: {
        validate: isDateRange,
    },

    /**
     */
    Digits: {
        validate: isDigits,
    },

    /**
     */
    Email: {
        validate: isEmail,
    },

    /**
     */
    Enum: {
        validate: isEnum,
    },

    /**
     */
    Future: {
        validate: (value: temporal, params: DateParams = {}) => {
            const { format } = params;
            return isFuture(value, format);
        },
    },

    /**
     */
    Integer: {
        validate: isInteger,
    },

    /**
     */
    ITINRange: {
        validate: isITINRange,
    },

    /**
     */
    Length: {
        validate: isLength,
    },

    /**
     */
    Max: {
        validate: isMax,
    },

    /**
     */
    Min: {
        validate: isMin,
    },

    /**
     */
    Money: {
        validate: isMoney,
    },

    /**
     */
    MustBeginWith: {
        validate: isMustBeginWith,
    },

    /**
     */
    NotBlank: {
        validate: isNotBlank,
    },

    /**
     */
    NotBeginWith: {
        validate: isNotBeginWith,
    },

    /**
     */
    NotBeginWith1: {
        validate: isNotBeginWith1,
    },

    /**
     */
    NonConsecutiveAlphaNumerics: {
        validate: isNonConsecutiveAlphaNumerics,
    },

    /**
     */
    NonRepeatingAlphaNumerics: {
        validate: isNonRepeatingAlphaNumerics,
    },

    /**
     */
    NonRepeatingSequence: {
        validate: isNonRepeatingSequence,
    },

    /**
     */
    NotPhoneEmail: {
        validate: isNotAPhoneEmail,
    },

    /**
     */
    Numbers: {
        validate: isNumbers,
    },

    /**
     */
    Numeric: {
        validate: isNumeric,
    },

    /**
     */
    PasswordCharacters: {
        validate: isPasswordCharacters,
    },

    /**
     */
    PasswordSymbols: {
        validate: isPasswordSymbols,
    },

    /**
     */
    Past: {
        validate: (value: temporal, params: DateParams = {}) => {
            const { format } = params;
            return isPast(value, format);
        },
    },

    /**
     */
    Pattern: {
        validate: (value: string, params: PatternParams = {}) => {
            const { regex, flags } = params;
            return isPatternMatch(value, regex, flags);
        },
    },

    /**
     */
    PersonalName: {
        validate: isPersonalName,
    },

    /**
     */
    PhoneNorthAmerica: {
        validate: isPhoneNorthAmerica,
    },

    /**
     */
    PhoneOao: {
        validate: isPhoneOao,
    },

    /**
     */
    PostalCode: {
        validate: isPostalCode,
    },

    /**
     */
    Range: {
        validate: isRange,
    },

    /**
     */
    Real: {
        validate: isReal,
    },

    /**
     */
    RoutingNumber: {
        validate: isRoutingNumber,
    },

    /**
     */
    Ssn: {
        validate: isSsn,
    },

    /**
     */
    SsnExclude: {
        validate: isSsnExclude,
    },

    /**
     */
    SsnOao: {
        validate: isSsnOao,
    },

    /**
     */
    SsnValidGroups: {
        validate: isSsnValidGroups,
    },

    /**
     */
    Specials: {
        validate: isSpecials,
    },

    /**
     */
    Step: {
        validate: isStep,
    },

    /**
     */
    URL: {
        validate: isUrl,
    },

    /**
     */
    ZipCode: {
        validate: isZipCode,
    },

    /**
     */
    ZipCodeExtension: {
        validate: isZipCodeExtension,
    },
};

export default standardConstraints;
