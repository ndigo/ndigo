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
import {
    any,
    both,
    complement,
    defaultTo,
    equals,
    isEmpty,
    is,
    pipe,
    prop,
    replace,
    split,
    test,
    toString,
    ifElse,
    identity,
    propSatisfies,
    when,
    append,
    lte,
    gte,
    curry,
} from '@blue/util';
import { serializable } from '@blue/core';

type Counter = (value) => number;

type temporal = string | Date;
type pattern = string | RegExp;

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
 * @typedef {external:Object} Params
 * @property {*} value
 */

/**
 * @typedef {Params} DateParams
 * @property {external:string} format
 */

/**
 * @typedef {Params} DigitsParams
 * @property {external:number} integer The maximum number of integral digits accepted for this number.
 * @property {external:number} fraction The number of fractional digits accepted for this number.
 */

/**
 * @typedef {Params} MoneyParams
 * @property {external:number} currencyFormat
 * @property {external:number} integer
 */

/**
 * @typedef {Params} NonConsecutiveAlphaNumericsParams
 * @property {external:number} maxSequential
 */

/**
 * @typedef {Params} NonRepeatingAlphaNumericsParams
 * @property {external:number} maxRepeating
 */

/**
 * @typedef {Params} PatternParams
 * @property {external:string|external:RegExp} regex
 * @property {external:string} flags
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
    }),
    isAddressLine: constraint = patternConstraint({ regex: ADDRESS_LINE_REGEX }),
    isAlpha: constraint = patternConstraint({ regex: ALPHA_REGEX }),
    isAlphaNumeric: constraint = patternConstraint({ regex: ALPHA_NUMERIC_REGEX }),
    isAlphaNumericPlus: constraint = patternConstraint({ regex: ALPHA_NUMERIC_PLUS_REGEX }),
    isBlank: constraint = pipe(toString, removeWhitespace, isEmpty),
    isBoolean: constraint = patternConstraint({ regex: BOOLEAN_REGEX }),
    isCapitals: constraint = (value, params: RangeParams = { min: 1 }) => rangeValidator(upperCaseCount(value), params),
    isCharacters: constraint = (value, params: RangeParams = { min: 1 }) => rangeValidator(alphaCount(value), params),
    isCity: constraint = both(isSingleSpaced, test(CITY_REGEX)),
    /**
     * Validates a value with a set of constraints, requiring a minimum to be true
     * @param {external:string} value value to validate
     * @param {external:Object} params expected parameters
     * @param {external:Object} params.constraint set of constraints as an array
     * @param {external:Object} params.constraint.type constraint name
     * @param {external:Object} params.constraint.params constraint params
     * @param {external:Object} params.min the minimum number of constraints in the set that must be true
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
        console.log('FIX');
        return true;
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
        console.log('FIX');
        return true;
    },
    /**
     * Validates digits to have a certain amount of decimal numbers and/or integer numbers
     * @param {external:string} The value expected
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
    isEmail: constraint = patternConstraint({ regex: EMAIL_REGEX }),
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
        console.log('FIX');
        return true;
    },
    isInteger: constraint = patternConstraint({ regex: INTEGER_REGEX }),
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
     * @function module:validate.constraints~isMax
     * @param {external:string|external:number} value The value to be tested
     * @param {Param} params
     * @returns {external:boolean} Whether or not the `value` is less than or equal to `params.value`.
     */
    isMax: constraint<string> = (value, params: Params = {}) => lte(parseFloat(value as any), parseFloat(params.value)),
    /**
     * Validates a number to be greater than
     * @function module:validate.constraints~isMin
     * @param {external:string|external:number} value The value to be tested
     * @param {Param} params
     * @returns {external:boolean} Whether or not the `value` is greater than or equal to `params.value`.
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
    isNonRepeatingSequence: constraint = complement(test(REPEATING_SEQUENCE_REGEX)),
    isNotAPhoneEmail: constraint = complement(test(NOT_PHONE_EMAIL_REGEX)),
    isNotBeginWith: constraint = (value: string, params: Params = {}) => {
        value = toString(value);
        return value.length === 0 || value[0] !== params.value;
    },
    isNotBeginWith1: constraint = (value: string | number) => isNotBeginWith(value, { value: '1' }),
    isNotBlank: constraint = complement(isBlank),
    isNumbers: constraint = (value, params: RangeParams = { min: 1 }) => rangeValidator(numberCount(value), params),
    isNumeric: constraint = patternConstraint({ regex: NUMERIC_REGEX }),
    isPasswordCharacters: constraint = patternConstraint({ regex: PASSWORD_FORMAT }),
    isPasswordSymbols: constraint = (value, params: RangeParams = { min: 1 }) =>
        rangeValidator(passwordSymbolCount(value), params),
    isPast = (value: temporal, format: string = DEFAULT_DATE_FORMAT): boolean => {
        //const date = isString( value ) ?
        //    moment( value, format, true ) :
        //    moment( value );
        //return date.isValid() && date.isBefore();
        console.log('FIX');
        return true;
    },
    /**
     * Validates a regular expression pattern
     * @param {external:string} The value expected
     * @param {external:string|external:RegExp} regexp The regular expression to be used
     * @param {external:string} flags The flags to be used with the regular expression
     */
    isPatternMatch = (value: string, regexp: pattern, flags?: string): boolean => {
        regexp = ifElse(isString, removeSlashes, identity)(regexp);

        const matcher: RegExp = isString(flags)
            ? new RegExp(pipe(toString, removeSlashesAndFlags)(regexp), flags)
            : new RegExp(regexp);

        return test(matcher, value);
    },
    isPersonalName: constraint = patternConstraint({ regex: NAME_REGEX }),
    isPhoneNorthAmerica: constraint = patternConstraint({ regex: PHONE_NORTH_AMERICA }),
    isPhoneOao: constraint = patternConstraint({ regex: PHONE_OAO_FORMAT }),
    isPostalCode: constraint = patternConstraint({ regex: POSTAL_CODE_REGEX }),
    /**
     * Validates a range
     * @param {external:string} The value expected
     * @param {external:Object} params Expected parameters
     * @param {external:Object} params.min Lowest amount in the range
     * @param {external:Object} params.max Highest amount in the range
     */
    isRange: constraint = (value, params: RangeParams) => rangeValidator(value, params),
    isReal: constraint = patternConstraint({ regex: REAL_REGEX }),
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
    isSsn: constraint = patternConstraint({ regex: SSN_FORMAT }),
    isSsnExclude: constraint = patternConstraint({ regex: SSN_EXCLUDE_FORMAT }),
    isSsnOao: constraint = patternConstraint({ regex: SSN_OAO_FORMAT }),
    isSsnValidGroups: constraint = patternConstraint({ regex: SSN_VALID_GROUPS_FORMAT }),
    /**
     * Validates a value as a valid step in a possible range
     * @function module:validate.constraints.Step.validator
     * @param {external:string} value The value expected
     * @param {external:Object} params Expected parameters
     * @param {external:Object} params.min Lowest amount in the range
     * @param {external:Object} params.max Highest amount in the range
     * @param {external:Object} params.step Incremental or decremental step amount
     */
    isStep: constraint = (value, params: StepParams = { step: 1 }) => {
        const parsed = Number(value),
            step = Number(params.step);

        return rangeValidator(parsed, params) && parsed % step === 0;
    },
    isUrl: constraint = patternConstraint({ regex: URL_REGEX }),
    isValidDate = (value: temporal, format = DEFAULT_DATE_FORMAT): boolean => {
        /*const date = isString( value ) ?
            moment( value, format, true ) :
            moment( value );
        return date.isValid();*/
        console.log('FIX');
        return true;
    },
    isZipCode: constraint = patternConstraint({ regex: ZIP_CODE_REGEX }),
    isZipCodeExtension: constraint = patternConstraint({ regex: ZIP_CODE_EXTENSION_REGEX }),
    rangeValidator: constraint = function (value, params: RangeParams = {}): boolean {
        let min: number, max: number;

        // Process params
        if (isDefined(params.value)) {
            min = max = Number(params.value);
        } else {
            min = defaultToZero(Number(params.min));
            max = defaultToMaxValue(Number(params.max));
        }

        value = Number(value);

        return value >= min && value <= max;
    };

/**
 * @namespace module:validate.constraints
 */
const standardConstraints: ValidationConstraints = {
    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.AddressLine
     */
    AddressLine: {
        validate: isAddressLine,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Alpha
     */
    Alpha: {
        validate: isAlpha,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.AlphaNumeric
     */
    AlphaNumeric: {
        validate: isAlphaNumeric,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.AlphaNumericPlus
     */
    AlphaNumericPlus: {
        validate: isAlphaNumericPlus,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Blank
     */
    Blank: {
        validate: isBlank,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Boolean
     */
    Boolean: {
        validate: isBoolean,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Capitals
     */
    Capitals: {
        validate: isCapitals,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Characters
     */
    Characters: {
        validate: isCharacters,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.City
     */
    City: {
        validate: isCity,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.ConstraintSet
     */
    ConstraintSet: {
        validate: isConstraintSet,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Date
     */
    Date: {
        validate: (value: temporal, params: DateParams = {}) => {
            const { format } = params;
            return isValidDate(value, format);
        },
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Date18YearsOld
     */
    Date18YearsOld: {
        validate: isDate18YearsOld,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.DateRange
     */
    DateRange: {
        validate: isDateRange,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Digits
     */
    Digits: {
        validate: isDigits,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Email
     */
    Email: {
        validate: isEmail,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Enum
     */
    Enum: {
        validate: isEnum,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Future
     */
    Future: {
        validate: (value: temporal, params: DateParams = {}) => {
            const { format } = params;
            return isFuture(value, format);
        },
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Integer
     */
    Integer: {
        validate: isInteger,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.ITINRange
     */
    ITINRange: {
        validate: isITINRange,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Length
     */
    Length: {
        validate: isLength,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Max
     */
    Max: {
        validate: isMax,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Min
     */
    Min: {
        validate: isMin,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Money
     */
    Money: {
        validate: isMoney,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.MustBeginWith
     */
    MustBeginWith: {
        validate: isMustBeginWith,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.NotBlank
     */
    NotBlank: {
        validate: isNotBlank,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.NotBeginWith
     */
    NotBeginWith: {
        validate: isNotBeginWith,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.NotBeginWith1
     */
    NotBeginWith1: {
        validate: isNotBeginWith1,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.NonConsecutiveAlphaNumerics
     */
    NonConsecutiveAlphaNumerics: {
        validate: isNonConsecutiveAlphaNumerics,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.NonRepeatingAlphaNumerics
     */
    NonRepeatingAlphaNumerics: {
        validate: isNonRepeatingAlphaNumerics,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.NonRepeatingSequence
     */
    NonRepeatingSequence: {
        validate: isNonRepeatingSequence,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.NotPhoneEmail
     */
    NotPhoneEmail: {
        validate: isNotAPhoneEmail,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Numbers
     */
    Numbers: {
        validate: isNumbers,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Numeric
     */
    Numeric: {
        validate: isNumeric,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.PasswordCharacters
     */
    PasswordCharacters: {
        validate: isPasswordCharacters,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.PasswordSymbols
     */
    PasswordSymbols: {
        validate: isPasswordSymbols,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Past
     */
    Past: {
        validate: (value: temporal, params: DateParams = {}) => {
            const { format } = params;
            return isPast(value, format);
        },
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Pattern
     */
    Pattern: {
        validate: (value: string, params: PatternParams = {}) => {
            const { regex, flags } = params;
            return isPatternMatch(value, regex, flags);
        },
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.PersonalName
     */
    PersonalName: {
        validate: isPersonalName,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.PhoneNorthAmerica
     */
    PhoneNorthAmerica: {
        validate: isPhoneNorthAmerica,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.PhoneOao
     */
    PhoneOao: {
        validate: isPhoneOao,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.PostalCode
     */
    PostalCode: {
        validate: isPostalCode,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Range
     */
    Range: {
        validate: isRange,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Real
     */
    Real: {
        validate: isReal,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.RoutingNumber
     */
    RoutingNumber: {
        validate: isRoutingNumber,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Ssn
     */
    Ssn: {
        validate: isSsn,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.SsnExclude
     */
    SsnExclude: {
        validate: isSsnExclude,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.SsnOao
     */
    SsnOao: {
        validate: isSsnOao,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.SsnValidGroups
     */
    SsnValidGroups: {
        validate: isSsnValidGroups,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Specials
     */
    Specials: {
        validate: isSpecials,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Step
     */
    Step: {
        validate: isStep,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.URL
     */
    URL: {
        validate: isUrl,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.ZipCode
     */
    ZipCode: {
        validate: isZipCode,
    },

    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.ZipCodeExtension
     */
    ZipCodeExtension: {
        validate: isZipCodeExtension,
    },
};

export default standardConstraints;
