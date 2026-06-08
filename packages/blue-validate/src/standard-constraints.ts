/**
 * @author Jeff Rose
 */

import {
    alphaRule,
    alphaNumericRule,
    alphaNumericPlusRule,
    addressLineRule,
    postalCodeRule,
    zipCodeRule,
    zipCodeExtensionRule,
    cityRule,
    DEFAULT_DATE_FORMAT,
    booleanRule,
    whitespaceRule,
    notACapitalRule,
    notAnAlphaRule,
    emailRule,
    notPhoneEmailRule,
    integerRule,
    currencyFormats,
    repeatingSequenceRule,
    notANumberRule,
    numericRule,
    passwordRule,
    notAPasswordSymbolRule,
    nameRule,
    realRule,
    anyAlphaNumericRule,
    ssnRule,
    ssnExcludeRule,
    ssnOaoRule,
    ssnValidGroupsRule,
    urlRule,
    phoneNorthAmericaRule,
    phoneOaoRule,
    CurrencyFormat,
} from './formats';
import { replace, split, toString } from '@blue/util/string';
import { is } from '@blue/util/types';
import { serializable } from '@blue/core';

type Counter = (value: string) => number;

type Temporal = string | Date;
type Pattern = string | RegExp;

const dateRule = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

const daysInMonth = (year: number, month: number): number => {
    // month is 1-12
    return new Date(year, month, 0).getDate();
};

const normalizeToDate = (value: Temporal, format: string = DEFAULT_DATE_FORMAT): Date | null => {
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

    const match = dateRule.exec(text);
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

const createConstraint = (validate: constraint): Constraint => ({
    validate,
});

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
    _pipe =
        <T>(...fns: Array<(x: T) => T>) =>
        (x: T): T =>
            fns.reduce((v: T, f) => f(v), x),
    appendEmptyString: (list: string[]) => string[] = (arr: string[]) => [...arr, ''],
    isOne = (x: any) => x === 1,
    isArray = Array.isArray,
    isUndefined = (x: any) => x === undefined,
    isDefined = (value: unknown) => !isUndefined(value),
    isString = (x: any): x is string => x instanceof String || typeof x === 'string',
    lengthIsOne = (x: any): boolean => x?.length === 1,
    splitOnDot = split(/\./),
    isSingleSpaced: (value: string) => boolean = (value: string): boolean => !value.split(' ').some(s => s.length === 0),
    lengthOf: (value: any) => number = (x: any) => x?.length,
    removeAnyAlphaNumber: (s: string) => string = replace(anyAlphaNumericRule, ''),
    removeLowerCase: (s: string) => string = replace(notACapitalRule, ''),
    removeNonAlpha: (s: string) => string = replace(notAnAlphaRule, ''),
    removeNonNumber: (s: string) => string = replace(notANumberRule, ''),
    removeNonPasswordSymbol: (s: string) => string = replace(notAPasswordSymbolRule, ''),
    removeLeadingSlash: (s: string) => string = replace(/^\//, ''),
    removeTrailingSlash: (s: string) => string = replace(/\/$/, ''),
    removeTrailingSlashAndFlags: (s: string) => string = replace(/\/[^/]*$/, ''),
    removeSlashes: (s: string) => string = _pipe(removeLeadingSlash, removeTrailingSlash),
    removeSlashesAndFlags: (s: string) => string = _pipe(removeLeadingSlash, removeTrailingSlashAndFlags),
    removeWhitespace: (s: string) => string = replace(whitespaceRule, ''),
    alphaCount: Counter = (value: string) => lengthOf(removeNonAlpha(toString(value))),
    numberCount: Counter = (value: string) => lengthOf(removeNonNumber(toString(value))),
    passwordSymbolCount: Counter = (value: string) => lengthOf(removeNonPasswordSymbol(toString(value))),
    specialsCount: Counter = (value: string) => lengthOf(removeAnyAlphaNumber(toString(value))),
    upperCaseCount: Counter = (value: string) => lengthOf(removeLowerCase(toString(value))),
    valueCount: Counter = (value: string) => lengthOf(toString(value)),
    patternConstraint =
        ({ regex, flags }: PatternParams) =>
        (value: serializable, params?: Params): boolean => {
            if (typeof value !== 'string') {
                return false;
            }
            if (regex === undefined) {
                return false;
            }
            
            const normalizedRegex = isString(regex) ? removeSlashes(regex as string) : regex;
    
            const matcher: RegExp = isString(flags)
                ? new RegExp(removeSlashesAndFlags(String(normalizedRegex)), flags)
                : new RegExp(normalizedRegex);
    
            return matcher.test(value);
        },
    isAddressLine: constraint = patternConstraint({
        regex: addressLineRule.source,
    }),
    isAlpha: constraint = patternConstraint({ regex: alphaRule.source }),
    isAlphaNumeric: constraint = patternConstraint({
        regex: alphaNumericRule.source,
    }),
    isAlphaNumericPlus: constraint = patternConstraint({
        regex: alphaNumericPlusRule.source,
    }),
    isBlank: constraint = (value: serializable): boolean => removeWhitespace(toString(value)).length === 0,
    isBoolean: constraint = patternConstraint({ regex: booleanRule }),
    isCapitals: constraint = (value: serializable, params?: Params) => rangeValidator(upperCaseCount(value as string), { min: 1, ...(params as RangeParams) }),
    isCharacters: constraint = (value: serializable, params?: Params) => rangeValidator(alphaCount(value as string), { min: 1, ...(params as RangeParams) }),
    isCity: constraint = (value) => isSingleSpaced(value as string) && cityRule.test(value as string),
    /**
     * Validates a value with a set of constraints, requiring a minimum to be true
     * @param {string} value value to validate
     * @param {Object} params expected parameters
     * @param {Object} params.constraint set of constraints as an array
     * @param {Object} params.constraint.type constraint name
     * @param {Object} params.constraint.params constraint params
     * @param {Object} params.min the minimum number of constraints in the set that must be true
     */
    isConstraintSet: constraint = (value, params: SetParams = {}) => {
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
    },
    isDate18YearsOld: constraint = (value, params: DateParams = { format: DEFAULT_DATE_FORMAT }) => {
        //const
        //    { format } = params,
        //    data	= moment( value, format, true ),
        //    valid	= data.isValid() && moment().diff( data, 'years' ) > 17;
        //return valid;
        const format = params.format || DEFAULT_DATE_FORMAT;
        const date = normalizeToDate(value as any, format);
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
        const date = normalizeToDate(value as any, format);
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
    isDigits: constraint = (value, params: DigitsParams = { integer: -1, fraction: -1 }): boolean => {
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
    },
    isEmail: constraint = patternConstraint({ regex: emailRule }),
    isEnum: constraint = (value, params: Params = {}): boolean => {
        const enumeration = isString(params.value)
            ? params.value.split(' ')
            : !isArray(params.value)
              ? []
              : params.value;

        return enumeration.indexOf(value) !== -1;
    },
    isFuture = (value: serializable, format: string = DEFAULT_DATE_FORMAT): boolean => {
        //const date = isString( value ) ?
        //    moment( value, format, true ) :
        //    moment( value );
        //return date.isValid() && date.isAfter();
        const date = normalizeToDate(value as any, format);
        if (!date) {
            return false;
        }

        const target = startOfDay(date).getTime();
        const today = startOfDay(new Date()).getTime();
        return target > today;
    },
    isInteger: constraint = patternConstraint({ regex: integerRule.source }),
    isITINRange: constraint = (value) => {
        const text = toString(value),
            length: number = text.length;
        let n = length < 4 ? 0 : Number(text[3]);

        if (length > 4 && n >= 7) {
            n = n * 10 + Number(text[4]);
        } // fourth and fifth positions values are 70-88, 90-92, 94-99, partial validation true when not enough characters

        return length < 4 || (length === 4 && n >= 7) || (n >= 70 && n <= 88) || (n >= 90 && n <= 92) || n >= 94;
    },
    isLength: constraint = (value, params: Params = {}) => rangeValidator(valueCount(toString(value)), params as RangeParams),
    /**
     * Validates a number to be less than
     * @param {string|external:number} value The value to be tested
     * @param {Param} params
     * @returns {boolean} Whether or not the `value` is less than or equal to `params.value`.
     */
    isMax: constraint = (value, params: Params = {}) => parseFloat(value as any) <= parseFloat(params.value),
    /**
     * Validates a number to be greater than
     * @param {string|external:number} value The value to be tested
     * @param {Param} params
     * @returns {boolean} Whether or not the `value` is greater than or equal to `params.value`.
     */
    isMin: constraint = (value, params: Params = {}) => parseFloat(value as any) >= parseFloat(params.value),
    /** Validates currency based on these rules (BLUEJS-741) */
    isMoney: constraint = (value, params: MoneyParams = { format: 'USD' }) =>
        (params.currencyFormat || currencyFormats[params.format || 'USD']).regex.test(toString(value)),
    isMustBeginWith: constraint = (value, params: Params = {}) => {
        const strValue = toString(value);
        return strValue.length === 0 || strValue[0] === params.value;
    },
    isNonConsecutiveAlphaNumerics: constraint = (
        value,
        params?: Params
    ) => {
        const valuesArray = toString(value).split(''),
            count = toString(value).length,
            maxSequential = (params as NonConsecutiveAlphaNumericsParams | undefined)?.maxSequential ?? 2;
        let currentConsecutive = 1;

        if (count < maxSequential) {
            return true;
        }

        // Check for sequentials going forward (e.g. 'abc' or '123')
        for (let i = 0; i < count - 1; ++i) {
            const currentCharCode = valuesArray[i].toLowerCase().charCodeAt(0),
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

        // Reset counter before checking backward sequences
        currentConsecutive = 1;

        // Check for sequentials going backwards (e.g. '321' or 'cba')
        for (let i = count - 1; i >= 1; --i) {
            const reverseCurrentCharCode = valuesArray[i].toLowerCase().charCodeAt(0),
                previousCharCode = valuesArray[i - 1].toLowerCase().charCodeAt(0);

            if (
                reverseCurrentCharCode === previousCharCode - 1 &&
                ((reverseCurrentCharCode >= 48 && reverseCurrentCharCode <= 57) ||
                    (reverseCurrentCharCode >= 97 && reverseCurrentCharCode <= 122))
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
    isNonRepeatingAlphaNumerics: constraint = (
        value,
        params?: Params
    ) => {
        let regexString = '([a-z\\d])';
        const maxRepeating = (params as NonRepeatingAlphaNumericsParams | undefined)?.maxRepeating ?? 2;
        for (let i = 0; i < maxRepeating; ++i) {
            regexString += '\\1';
        }
        const regex = new RegExp(regexString, 'gi');
        return !regex.test(toString(value));
    },
    isNonRepeatingSequence: constraint = ((value: serializable) => {
        if (typeof value !== 'string') return false;
        return !repeatingSequenceRule.test(value);
    }),
    isNotAPhoneEmail: constraint = ((value: serializable) => {
        if (typeof value !== 'string') return false;
        return !notPhoneEmailRule.test(value);
    }),
    isNotBeginWith: constraint = (value: serializable, params: Params = {}) => {
        const strValue = toString(value);
        return strValue.length === 0 || strValue[0] !== params.value;
    },
    isNotBeginWith1: constraint = (value: serializable) => isNotBeginWith(value, { value: '1' }),
    isNotBlank: constraint = (value) => {
        const strValue = toString(value);
        return !isBlank(value);
    },
    isNumbers: constraint = (value: serializable, params?: Params) => rangeValidator(numberCount(value as string), { min: 1, ...(params as RangeParams) }),
    isNumeric: constraint = patternConstraint({ regex: numericRule.source }),
    isPasswordCharacters: constraint = patternConstraint({
        regex: passwordRule.source,
    }),
    isPasswordSymbols: constraint = (value: serializable, params?: Params) =>
        rangeValidator(passwordSymbolCount(value as string), { min: 1, ...(params as RangeParams) }),
    isPast = (value: serializable, format: string = DEFAULT_DATE_FORMAT): boolean => {
        //const date = isString( value ) ?
        //    moment( value, format, true ) :
        //    moment( value );
        //return date.isValid() && date.isBefore();
        const date = normalizeToDate(value as any, format);
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
    isPatternMatch = (value: string, regexp: Pattern, flags?: string): boolean => {
        regexp = isString(regexp) ? removeSlashes(regexp as string) : regexp;

        const matcher: RegExp = isString(flags)
            ? new RegExp(removeSlashesAndFlags(String(regexp)), flags)
            : new RegExp(regexp);

        return matcher.test(value);
    },
    isPersonalName: constraint = patternConstraint({ regex: nameRule.source }),
    isPhoneNorthAmerica: constraint = patternConstraint({
        regex: phoneNorthAmericaRule.source,
    }),
    isPhoneOao: constraint = patternConstraint({
        regex: phoneOaoRule.source,
    }),
    isPostalCode: constraint = patternConstraint({
        regex: postalCodeRule.source,
    }),
    /**
     * Validates a range
     * @param {string} The value expected
     * @param {Object} params Expected parameters
     * @param {Object} params.min Lowest amount in the range
     * @param {Object} params.max Highest amount in the range
     */
    isRange: constraint = (value: serializable, params: Params = {}) => rangeValidator(value, params as RangeParams),
    isReal: constraint = patternConstraint({ regex: realRule.source }),
    isRoutingNumber: constraint = (value): boolean => {
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
    },
    isSpecials: constraint = (value: serializable, params?: Params) => rangeValidator(specialsCount(value as string), { min: 1, ...(params as RangeParams) }),
    isSsn: constraint = patternConstraint({ regex: ssnRule.source }),
    isSsnExclude: constraint = patternConstraint({
        regex: ssnExcludeRule.source,
    }),
    isSsnOao: constraint = patternConstraint({ regex: ssnOaoRule.source }),
    isSsnValidGroups: constraint = patternConstraint({
        regex: ssnValidGroupsRule.source,
    }),
    /**
     * Validates a value as a valid step in a possible range
     * @param {string} value The value expected
     * @param {Object} params Expected parameters
     * @param {Object} params.min Lowest amount in the range
     * @param {Object} params.max Highest amount in the range
     * @param {Object} params.step Incremental or decremental step amount
     */
    isStep: constraint = (value: serializable, params?: Params) => {
        const parsed = Number(value),
            step = Number((params as StepParams | undefined)?.step ?? 1);

        return rangeValidator(parsed, params) && parsed % step === 0;
    },
    isUrl: constraint = patternConstraint({ regex: urlRule.source }),
    isValidDate = (value: Temporal, format = DEFAULT_DATE_FORMAT): boolean => {
        /*const date = isString( value ) ?
            moment( value, format, true ) :
            moment( value );
        return date.isValid();*/
        return !!normalizeToDate(value, format);
    },
    isZipCode: constraint = patternConstraint({ regex: zipCodeRule.source }),
    isZipCodeExtension: constraint = patternConstraint({
        regex: zipCodeExtensionRule.source,
    }),
    rangeValidator: constraint = function (value, params: RangeParams = {}): boolean {
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
 * @namespace module:validate.constraints
 */
const standardConstraints: ValidationConstraints = {
    /**
     */
    AddressLine: createConstraint(isAddressLine),

    /**
     */
    Alpha: createConstraint(isAlpha),

    /**
     */
    AlphaNumeric: createConstraint(isAlphaNumeric),

    /**
     */
    AlphaNumericPlus: createConstraint(isAlphaNumericPlus),

    /**
     */
    Blank: createConstraint(isBlank),

    /**
     */
    Boolean: createConstraint(isBoolean),

    /**
     */
    Capitals: createConstraint(isCapitals),

    /**
     */
    Characters: createConstraint(isCharacters),

    /**
     */
    City: createConstraint(isCity),

    /**
     */
    ConstraintSet: createConstraint(isConstraintSet),

    /**
     */
    Date: createConstraint((value: serializable, params: DateParams = {}) => {
        const { format } = params;
        return isValidDate(value as Temporal, format);
    }),

    /**
     */
    Date18YearsOld: createConstraint(isDate18YearsOld),

    /**
     */
    DateRange: createConstraint(isDateRange),

    /**
     */
    Digits: createConstraint(isDigits),

    /**
     */
    Email: createConstraint(isEmail),

    /**
     */
    Enum: createConstraint(isEnum),

    /**
     */
    Future: createConstraint((value: serializable, params: DateParams = {}) => {
        const { format } = params;
        return isFuture(value, format);
    }),

    /**
     */
    Integer: createConstraint(isInteger),

    /**
     */
    ITINRange: createConstraint(isITINRange),

    /**
     */
    Length: createConstraint(isLength),

    /**
     */
    Max: createConstraint(isMax),

    /**
     */
    Min: createConstraint(isMin),

    /**
     */
    Money: createConstraint(isMoney),

    /**
     */
    MustBeginWith: createConstraint(isMustBeginWith),

    /**
     */
    NotBlank: createConstraint(isNotBlank),

    /**
     */
    NotBeginWith: createConstraint(isNotBeginWith),

    /**
     */
    NotBeginWith1: createConstraint(isNotBeginWith1),

    /**
     */
    NonConsecutiveAlphaNumerics: createConstraint(isNonConsecutiveAlphaNumerics),

    /**
     */
    NonRepeatingAlphaNumerics: createConstraint(isNonRepeatingAlphaNumerics),

    /**
     */
    NonRepeatingSequence: createConstraint(isNonRepeatingSequence),

    /**
     */
    NotPhoneEmail: createConstraint(isNotAPhoneEmail),

    /**
     */
    Numbers: createConstraint(isNumbers),

    /**
     */
    Numeric: createConstraint(isNumeric),

    /**
     */
    PasswordCharacters: createConstraint(isPasswordCharacters),

    /**
     */
    PasswordSymbols: createConstraint(isPasswordSymbols),

    /**
     */
    Past: createConstraint((value: serializable, params: DateParams = {}) => {
        const { format } = params;
        return isPast(value, format);
    }),

    /**
     */
    Pattern: createConstraint((value: serializable, params: PatternParams = {}) => {
        const { regex, flags } = params;
        return isPatternMatch(toString(value), regex ?? '', flags ?? '');
    }),

    /**
     */
    PersonalName: createConstraint(isPersonalName),

    /**
     */
    PhoneNorthAmerica: createConstraint(isPhoneNorthAmerica),

    /**
     */
    PhoneOao: createConstraint(isPhoneOao),

    /**
     */
    PostalCode: createConstraint(isPostalCode),

    /**
     */
    Range: createConstraint(isRange),

    /**
     */
    Real: createConstraint(isReal),

    /**
     */
    RoutingNumber: createConstraint(isRoutingNumber),

    /**
     */
    Ssn: createConstraint(isSsn),

    /**
     */
    SsnExclude: createConstraint(isSsnExclude),

    /**
     */
    SsnOao: createConstraint(isSsnOao),

    /**
     */
    SsnValidGroups: createConstraint(isSsnValidGroups),

    /**
     */
    Specials: createConstraint(isSpecials),

    /**
     */
    Step: createConstraint(isStep),

    /**
     */
    URL: createConstraint(isUrl),

    /**
     */
    ZipCode: createConstraint(isZipCode),

    /**
     */
    ZipCodeExtension: createConstraint(isZipCodeExtension),
};

export default standardConstraints;