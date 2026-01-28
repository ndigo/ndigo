/**
 * @author Jeff Rose
 */
import { ALPHA_REGEX, ALPHA_NUMERIC_REGEX, ALPHA_NUMERIC_PLUS_REGEX, ADDRESS_LINE_REGEX, POSTAL_CODE_REGEX, ZIP_CODE_REGEX, ZIP_CODE_EXTENSION_REGEX, CITY_REGEX, DEFAULT_DATE_FORMAT, BOOLEAN_REGEX, WHITESPACE_REGEX, NOT_A_CAPITAL_REGEX, NOT_AN_ALPHA_REGEX, EMAIL_REGEX, NOT_PHONE_EMAIL_REGEX, INTEGER_REGEX, currencyFormats, REPEATING_SEQUENCE_REGEX, NOT_A_NUMBER_REGEX, NUMERIC_REGEX, PASSWORD_FORMAT, NOT_A_PASSWORD_SYMBOL, NAME_REGEX, REAL_REGEX, ANY_ALPHA_NUMERIC_REGEX, SSN_FORMAT, SSN_EXCLUDE_FORMAT, SSN_OAO_FORMAT, SSN_VALID_GROUPS_FORMAT, URL_REGEX, PHONE_NORTH_AMERICA, PHONE_OAO_FORMAT, } from './formats';
import { any, both, complement, defaultTo, equals, isEmpty, is, pipe, prop, replace, split, test, toString, ifElse, identity, propSatisfies, when, append, lte, gte, curry, } from '@blue/util';
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
const { parseFloat, parseInt } = Number, appendEmptyString = append(''), defaultToZero = defaultTo(0), defaultToMaxValue = defaultTo(Number.MAX_VALUE), isOne = equals(1), isArray = Array.isArray, isUndefined = equals(void 0), isDefined = complement(isUndefined), isString = is(String), lengthIsOne = propSatisfies(isOne, 'length'), splitOnDot = split(/\./), isSingleSpaced = complement(pipe(split(' '), any(isEmpty))), lengthOf = prop('length'), removeAnyAlphaNumber = replace(ANY_ALPHA_NUMERIC_REGEX, ''), removeLowerCase = replace(NOT_A_CAPITAL_REGEX, ''), removeNonAlpha = replace(NOT_AN_ALPHA_REGEX, ''), removeNonNumber = replace(NOT_A_NUMBER_REGEX, ''), removeNonPasswordSymbol = replace(NOT_A_PASSWORD_SYMBOL, ''), removeLeadingSlash = replace(/^\//, ''), removeTrailingSlash = replace(/\/$/, ''), removeTrailingSlashAndFlags = replace(/\/[^/]*$/, ''), removeSlashes = pipe(removeLeadingSlash, removeTrailingSlash), removeSlashesAndFlags = pipe(removeLeadingSlash, removeTrailingSlashAndFlags), removeWhitespace = replace(WHITESPACE_REGEX, ''), alphaCount = pipe(toString, removeNonAlpha, lengthOf), numberCount = pipe(toString, removeNonNumber, lengthOf), passwordSymbolCount = pipe(toString, removeNonPasswordSymbol, lengthOf), specialsCount = pipe(toString, removeAnyAlphaNumber, lengthOf), upperCaseCount = pipe(toString, removeLowerCase, lengthOf), valueCount = pipe(toString, lengthOf), patternConstraint = curry(({ regex, flags = null }, value) => {
    regex = ifElse(isString, removeSlashes, identity)(regex);
    const matcher = isString(flags)
        ? new RegExp(pipe(toString, removeSlashesAndFlags)(regex), flags)
        : new RegExp(regex);
    return test(matcher, value);
}), isAddressLine = patternConstraint({
    regex: ADDRESS_LINE_REGEX.source,
}), isAlpha = patternConstraint({ regex: ALPHA_REGEX.source }), isAlphaNumeric = patternConstraint({
    regex: ALPHA_NUMERIC_REGEX.source,
}), isAlphaNumericPlus = patternConstraint({
    regex: ALPHA_NUMERIC_PLUS_REGEX.source,
}), isBlank = pipe(toString, removeWhitespace, isEmpty), isBoolean = patternConstraint({ regex: BOOLEAN_REGEX.source }), isCapitals = (value, params = { min: 1 }) => rangeValidator(upperCaseCount(value), params), isCharacters = (value, params = { min: 1 }) => rangeValidator(alphaCount(value), params), isCity = both(isSingleSpaced, test(CITY_REGEX)), 
/**
 * Validates a value with a set of constraints, requiring a minimum to be true
 * @param {string} value value to validate
 * @param {Object} params expected parameters
 * @param {Object} params.constraint set of constraints as an array
 * @param {Object} params.constraint.type constraint name
 * @param {Object} params.constraint.params constraint params
 * @param {Object} params.min the minimum number of constraints in the set that must be true
 */
isConstraintSet = (value, params) => {
    const _value = value;
    return rangeValidator(params.constraints.reduce(function (previousValue, constraint) {
        return (previousValue +
            (Number(standardConstraints[constraint.type].validate(_value, constraint.params)) || 0));
    }, 0), params);
}, isDate18YearsOld = (value, params = { format: DEFAULT_DATE_FORMAT }) => {
    //const
    //    { format } = params,
    //    data	= moment( value, format, true ),
    //    valid	= data.isValid() && moment().diff( data, 'years' ) > 17;
    //return valid;
    console.log('FIX');
    return true;
}, isDateRange = (value, params = {}) => {
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
 * @param {string} The value expected
 * @param {DigitsParams} params parameters
 */
isDigits = (value, params = { integer: -1, fraction: -1 }) => {
    const { integer, fraction } = params;
    let result = false;
    value = toString(value);
    if (value.length > 0 && integer > -1 && fraction > -1) {
        const parts = pipe(removeWhitespace, splitOnDot, when(lengthIsOne, appendEmptyString))(value);
        if (integer > 0) {
            result = parts[0].length <= integer;
        }
        else {
            result = true; // we don't care about the number of digits in the integer part
        }
        if (fraction > 0) {
            result = result && parts[1].length <= fraction;
        }
    }
    return result;
}, isEmail = patternConstraint({ regex: EMAIL_REGEX.source }), isEnum = (value, params = {}) => {
    const enumeration = isString(params.value)
        ? params.value.split(' ')
        : !isArray(params.value)
            ? []
            : params.value;
    return enumeration.indexOf(value) !== -1;
}, isFuture = (value, format = DEFAULT_DATE_FORMAT) => {
    //const date = isString( value ) ?
    //    moment( value, format, true ) :
    //    moment( value );
    //return date.isValid() && date.isAfter();
    console.log('FIX');
    return true;
}, isInteger = patternConstraint({ regex: INTEGER_REGEX.source }), isITINRange = (value) => {
    const text = toString(value), length = text.length;
    let n = length < 4 ? 0 : Number(text[3]);
    if (length > 4 && n >= 7) {
        n = n * 10 + Number(text[4]);
    } // fourth and fifth positions values are 70-88, 90-92, 94-99, partial validation true when not enough characters
    return length < 4 || (length === 4 && n >= 7) || (n >= 70 && n <= 88) || (n >= 90 && n <= 92) || n >= 94;
}, isLength = (value, params) => rangeValidator(valueCount(value), params), 
/**
 * Validates a number to be less than
 * @param {string|external:number} value The value to be tested
 * @param {Param} params
 * @returns {boolean} Whether or not the `value` is less than or equal to `params.value`.
 */
isMax = (value, params = {}) => lte(parseFloat(value), parseFloat(params.value)), 
/**
 * Validates a number to be greater than
 * @param {string|external:number} value The value to be tested
 * @param {Param} params
 * @returns {boolean} Whether or not the `value` is greater than or equal to `params.value`.
 */
isMin = (value, params = {}) => gte(parseFloat(value), parseFloat(params.value)), 
/** Validates currency based on these rules (BLUEJS-741) */
isMoney = (value, params = { format: 'USD' }) => (params.currencyFormat || currencyFormats[params.format || 'USD']).regex.test(toString(value)), isMustBeginWith = (value, params = {}) => {
    value = toString(value);
    return value.length === 0 || value[0] === params.value;
}, isNonConsecutiveAlphaNumerics = (value, params = { maxSequential: 2 }) => {
    const valuesArray = toString(value).split(''), count = value.length, maxSequential = params.maxSequential;
    let currentConsecutive = 1;
    if (count < maxSequential) {
        return true;
    }
    // Check for sequentials going forward (e.g. 'abc' or '123')
    for (var i = 0; i < count - 1; ++i) {
        var currentCharCode = valuesArray[i].toLowerCase().charCodeAt(0), nextCharCode = valuesArray[i + 1].toLowerCase().charCodeAt(0);
        // numbers: 48-57
        // cap alpha: 65-90
        // lower alpha: 97-122
        if (currentCharCode === nextCharCode - 1 &&
            ((currentCharCode >= 48 && currentCharCode < 57) || (currentCharCode >= 97 && currentCharCode < 122))) {
            currentConsecutive++;
            if (currentConsecutive === maxSequential) {
                return false;
            }
        }
        else {
            currentConsecutive = 1;
        }
    }
    // Check for sequentials going backwards (e.g. '321' or 'cba')
    for (i = count - 1; i >= 1; --i) {
        var reverseCurrentCharCode = valuesArray[i].charCodeAt(0), previousCharCode = valuesArray[i - 1].charCodeAt(0);
        if (reverseCurrentCharCode === previousCharCode - 1 &&
            ((currentCharCode > 48 && currentCharCode <= 57) || (currentCharCode > 97 && currentCharCode <= 122))) {
            currentConsecutive++;
            if (currentConsecutive === maxSequential) {
                return false;
            }
        }
        else {
            currentConsecutive = 1;
        }
    }
    return true;
}, isNonRepeatingAlphaNumerics = (value, params = { maxRepeating: 2 }) => {
    let regexString = '([a-z\\d])';
    for (let i = 0; i < params.maxRepeating; ++i) {
        regexString += '\\1';
    }
    const regex = new RegExp(regexString, 'gi');
    return !regex.test(value);
}, isNonRepeatingSequence = complement(test(REPEATING_SEQUENCE_REGEX)), isNotAPhoneEmail = complement(test(NOT_PHONE_EMAIL_REGEX)), isNotBeginWith = (value, params = {}) => {
    value = toString(value);
    return value.length === 0 || value[0] !== params.value;
}, isNotBeginWith1 = (value) => isNotBeginWith(value, { value: '1' }), isNotBlank = complement(isBlank), isNumbers = (value, params = { min: 1 }) => rangeValidator(numberCount(value), params), isNumeric = patternConstraint({ regex: NUMERIC_REGEX.source }), isPasswordCharacters = patternConstraint({
    regex: PASSWORD_FORMAT.source,
}), isPasswordSymbols = (value, params = { min: 1 }) => rangeValidator(passwordSymbolCount(value), params), isPast = (value, format = DEFAULT_DATE_FORMAT) => {
    //const date = isString( value ) ?
    //    moment( value, format, true ) :
    //    moment( value );
    //return date.isValid() && date.isBefore();
    console.log('FIX');
    return true;
}, 
/**
 * Validates a regular expression pattern
 * @param {string} The value expected
 * @param {string|external:RegExp} regexp The regular expression to be used
 * @param {string} flags The flags to be used with the regular expression
 */
isPatternMatch = (value, regexp, flags) => {
    regexp = ifElse(isString, removeSlashes, identity)(regexp);
    const matcher = isString(flags)
        ? new RegExp(pipe(toString, removeSlashesAndFlags)(regexp), flags)
        : new RegExp(regexp);
    return test(matcher, value);
}, isPersonalName = patternConstraint({ regex: NAME_REGEX.source }), isPhoneNorthAmerica = patternConstraint({
    regex: PHONE_NORTH_AMERICA.source,
}), isPhoneOao = patternConstraint({
    regex: PHONE_OAO_FORMAT.source,
}), isPostalCode = patternConstraint({
    regex: POSTAL_CODE_REGEX.source,
}), 
/**
 * Validates a range
 * @param {string} The value expected
 * @param {Object} params Expected parameters
 * @param {Object} params.min Lowest amount in the range
 * @param {Object} params.max Highest amount in the range
 */
isRange = (value, params) => rangeValidator(value, params), isReal = patternConstraint({ regex: REAL_REGEX.source }), isRoutingNumber = (value) => {
    let n = 0, i = 0;
    const length = value.length;
    value = toString(value);
    for (; i < length; i += 3) {
        n +=
            parseInt(value.charAt(i), 10) * 3 +
                parseInt(value.charAt(i + 1), 10) * 7 +
                parseInt(value.charAt(i + 2), 10);
    }
    return n !== 0 && n % 10 === 0;
}, isSpecials = (value, params = { min: 1 }) => rangeValidator(specialsCount(value), params), isSsn = patternConstraint({ regex: SSN_FORMAT.source }), isSsnExclude = patternConstraint({
    regex: SSN_EXCLUDE_FORMAT.source,
}), isSsnOao = patternConstraint({ regex: SSN_OAO_FORMAT.source }), isSsnValidGroups = patternConstraint({
    regex: SSN_VALID_GROUPS_FORMAT.source,
}), 
/**
 * Validates a value as a valid step in a possible range
 * @param {string} value The value expected
 * @param {Object} params Expected parameters
 * @param {Object} params.min Lowest amount in the range
 * @param {Object} params.max Highest amount in the range
 * @param {Object} params.step Incremental or decremental step amount
 */
isStep = (value, params = { step: 1 }) => {
    const parsed = Number(value), step = Number(params.step);
    return rangeValidator(parsed, params) && parsed % step === 0;
}, isUrl = patternConstraint({ regex: URL_REGEX.source }), isValidDate = (value, format = DEFAULT_DATE_FORMAT) => {
    /*const date = isString( value ) ?
        moment( value, format, true ) :
        moment( value );
    return date.isValid();*/
    console.log('FIX');
    return true;
}, isZipCode = patternConstraint({ regex: ZIP_CODE_REGEX.source }), isZipCodeExtension = patternConstraint({
    regex: ZIP_CODE_EXTENSION_REGEX.source,
}), rangeValidator = function (value, params = {}) {
    const valueToCompare = Number(value);
    let min, max;
    // Process params
    if (isDefined(params.value)) {
        min = max = Number(params.value);
    }
    else {
        min = defaultToZero(Number(params.min));
        max = defaultToMaxValue(Number(params.max));
    }
    return valueToCompare >= min && valueToCompare <= max;
};
/**
 * @namespace module:validate.constraints
 */
const standardConstraints = {
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
        validate: (value, params = {}) => {
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
        validate: (value, params = {}) => {
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
        validate: (value, params = {}) => {
            const { format } = params;
            return isPast(value, format);
        },
    },
    /**
     */
    Pattern: {
        validate: (value, params = {}) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhcmQtY29uc3RyYWludHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3RhbmRhcmQtY29uc3RyYWludHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQ0gsV0FBVyxFQUNYLG1CQUFtQixFQUNuQix3QkFBd0IsRUFDeEIsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQixjQUFjLEVBQ2Qsd0JBQXdCLEVBQ3hCLFVBQVUsRUFDVixtQkFBbUIsRUFDbkIsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixtQkFBbUIsRUFDbkIsa0JBQWtCLEVBQ2xCLFdBQVcsRUFDWCxxQkFBcUIsRUFDckIsYUFBYSxFQUNiLGVBQWUsRUFDZix3QkFBd0IsRUFDeEIsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixlQUFlLEVBQ2YscUJBQXFCLEVBQ3JCLFVBQVUsRUFDVixVQUFVLEVBQ1YsdUJBQXVCLEVBQ3ZCLFVBQVUsRUFDVixrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLGdCQUFnQixHQUVuQixNQUFNLFdBQVcsQ0FBQztBQUNuQixPQUFPLEVBQ0gsR0FBRyxFQUNILElBQUksRUFDSixVQUFVLEVBQ1YsU0FBUyxFQUNULE1BQU0sRUFDTixPQUFPLEVBQ1AsRUFBRSxFQUNGLElBQUksRUFDSixJQUFJLEVBQ0osT0FBTyxFQUNQLEtBQUssRUFDTCxJQUFJLEVBQ0osUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEVBQ1IsYUFBYSxFQUNiLElBQUksRUFDSixNQUFNLEVBQ04sR0FBRyxFQUNILEdBQUcsRUFDSCxLQUFLLEdBQ1IsTUFBTSxZQUFZLENBQUM7QUErRHBCOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVILE1BQU0sRUFBRSxVQUFVLEVBQUUs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