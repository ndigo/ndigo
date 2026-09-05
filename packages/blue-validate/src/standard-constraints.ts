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
    booleanRule,
    emailRule,
    notPhoneEmailRule,
    repeatingSequenceRule,
    numericRule,
    passwordRule,
    nameRule,
    ssnRule,
    ssnExcludeRule,
    ssnOaoRule,
    ssnValidGroupsRule,
    urlRule,
    phoneNorthAmericaRule,
    phoneOaoRule,
} from './formats';

import {
    isString,
    isArray,
    isSingleSpaced,
    removeSlashes,
    removeSlashesAndFlags,
    removeWhitespace,
    valueCount,
    upperCaseCount,
    alphaCount,
    passwordSymbolCount,
    patternConstraint,
    rangeValidator,
    isConstraintSet,
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
} from './_numeric-constraints';

import {
    DateParams,
    Temporal,
    isDate18YearsOld,
    isDateRange,
    isFuture,
    isPast,
    isValidDate,
} from './_date-constraints';

import { toString } from '@blue/util/string';
import { serializable } from '@blue/core';

type Counter = (value: string) => number;

type Pattern = string | RegExp;

type NonConsecutiveAlphaNumericsParams = import('./_numeric-constraints').Params & {
    maxSequential: number;
};

type NonRepeatingAlphaNumericsParams = import('./_numeric-constraints').Params & {
    maxRepeating: number;
};

type PatternParams = import('./_numeric-constraints').Params & {
    regex?: RegExp | string;
    flags?: string;
};

export type Params<T = any> = import('./_numeric-constraints').Params<T>;

export type constraint<T = serializable> = import('./_numeric-constraints').constraint<T>;

export type Constraint<T = serializable> = import('./_numeric-constraints').Constraint<T>;

export type ValidationConstraints = import('./_numeric-constraints').ValidationConstraints;

const createConstraint = (validate: constraint): Constraint => ({
    validate,
});

const isAddressLine: constraint = patternConstraint({
    regex: addressLineRule.source,
});

const isAlpha: constraint = patternConstraint({ regex: alphaRule.source });

const isAlphaNumeric: constraint = patternConstraint({
    regex: alphaNumericRule.source,
});

const isAlphaNumericPlus: constraint = patternConstraint({
    regex: alphaNumericPlusRule.source,
});

const isBlank: constraint = (value: serializable): boolean => removeWhitespace(toString(value)).length === 0;

const isBoolean: constraint = patternConstraint({ regex: booleanRule });

const isCapitals: constraint = (value: serializable, params?: Params) =>
    rangeValidator(upperCaseCount(value as string), {
        min: 1,
        ...(params as import('./_numeric-constraints').RangeParams),
    });

const isCharacters: constraint = (value: serializable, params?: Params) =>
    rangeValidator(alphaCount(value as string), {
        min: 1,
        ...(params as import('./_numeric-constraints').RangeParams),
    });

const isCity: constraint = (value) => isSingleSpaced(value as string) && cityRule.test(value as string);

const isEmail: constraint = patternConstraint({ regex: emailRule });

const isEnum: constraint = (value, params: Params = {}): boolean => {
    const enumeration = isString(params.value) ? params.value.split(' ') : !isArray(params.value) ? [] : params.value;

    return enumeration.indexOf(value) !== -1;
};

const isLength: constraint = (value, params: Params = {}) =>
    rangeValidator(valueCount(toString(value)), params as import('./_numeric-constraints').RangeParams);

const isMustBeginWith: constraint = (value, params: Params = {}) => {
    const strValue = toString(value);
    return strValue.length === 0 || strValue[0] === params.value;
};

const isNonConsecutiveAlphaNumerics: constraint = (value, params?: Params) => {
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
};

const isNonRepeatingAlphaNumerics: constraint = (value, params?: Params) => {
    let regexString = '([a-z\\d])';
    const maxRepeating = (params as NonRepeatingAlphaNumericsParams | undefined)?.maxRepeating ?? 2;
    for (let i = 0; i < maxRepeating; ++i) {
        regexString += '\\1';
    }
    const regex = new RegExp(regexString, 'gi');
    return !regex.test(toString(value));
};

const isNonRepeatingSequence: constraint = ((value: serializable) => {
    if (typeof value !== 'string') return false;
    return !repeatingSequenceRule.test(value);
}) as constraint;

const isNotAPhoneEmail: constraint = ((value: serializable) => {
    if (typeof value !== 'string') return false;
    return !notPhoneEmailRule.test(value);
}) as constraint;

const isNotBeginWith: constraint = (value: serializable, params: Params = {}) => {
    const strValue = toString(value);
    return strValue.length === 0 || strValue[0] !== params.value;
};

const isNotBeginWith1: constraint = (value: serializable) => isNotBeginWith(value, { value: '1' });

const isNotBlank: constraint = (value) => {
    return !isBlank(value);
};

const isNumeric: constraint = patternConstraint({ regex: numericRule.source });

const isPasswordCharacters: constraint = patternConstraint({
    regex: passwordRule.source,
});

const isPasswordSymbols: constraint = (value: serializable, params?: Params) =>
    rangeValidator(passwordSymbolCount(value as string), {
        min: 1,
        ...(params as import('./_numeric-constraints').RangeParams),
    });

/**
 * Validates a regular expression pattern
 * @param {string} value The value expected
 * @param {string|external:RegExp} regexp The regular expression to be used
 * @param {string} flags The flags to be used with the regular expression
 */
const isPatternMatch = (value: string, regexp: Pattern, flags?: string): boolean => {
    regexp = isString(regexp) ? removeSlashes(regexp as string) : regexp;

    const matcher: RegExp =
        isString(flags) && flags.length > 0
            ? new RegExp(removeSlashesAndFlags(String(regexp)), flags)
            : new RegExp(regexp);

    return matcher.test(value);
};

const isPersonalName: constraint = patternConstraint({ regex: nameRule.source });

const isPhoneNorthAmerica: constraint = patternConstraint({
    regex: phoneNorthAmericaRule.source,
});

const isPhoneOao: constraint = patternConstraint({
    regex: phoneOaoRule.source,
});

const isPostalCode: constraint = patternConstraint({
    regex: postalCodeRule.source,
});

const isSsn: constraint = patternConstraint({ regex: ssnRule.source });

const isSsnExclude: constraint = patternConstraint({
    regex: ssnExcludeRule.source,
});

const isSsnOao: constraint = patternConstraint({ regex: ssnOaoRule.source });

const isSsnValidGroups: constraint = patternConstraint({
    regex: ssnValidGroupsRule.source,
});

const isUrl: constraint = patternConstraint({ regex: urlRule.source });

const isZipCode: constraint = patternConstraint({ regex: zipCodeRule.source });

const isZipCodeExtension: constraint = patternConstraint({
    regex: zipCodeExtensionRule.source,
});

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
