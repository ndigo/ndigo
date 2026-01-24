/**
 * @author Jeff Rose
 */
import { ALPHA_REGEX, ALPHA_NUMERIC_REGEX, ALPHA_NUMERIC_PLUS_REGEX, ADDRESS_LINE_REGEX, POSTAL_CODE_REGEX, ZIP_CODE_REGEX, ZIP_CODE_EXTENSION_REGEX, CITY_REGEX, DEFAULT_DATE_FORMAT, BOOLEAN_REGEX, WHITESPACE_REGEX, NOT_A_CAPITAL_REGEX, NOT_AN_ALPHA_REGEX, EMAIL_REGEX, NOT_PHONE_EMAIL_REGEX, INTEGER_REGEX, currencyFormats, REPEATING_SEQUENCE_REGEX, NOT_A_NUMBER_REGEX, NUMERIC_REGEX, PASSWORD_FORMAT, NOT_A_PASSWORD_SYMBOL, NAME_REGEX, REAL_REGEX, ANY_ALPHA_NUMERIC_REGEX, SSN_FORMAT, SSN_EXCLUDE_FORMAT, SSN_OAO_FORMAT, SSN_VALID_GROUPS_FORMAT, URL_REGEX, PHONE_NORTH_AMERICA, PHONE_OAO_FORMAT, } from './formats';
import { any, both, complement, defaultTo, equals, isEmpty, is, pipe, prop, replace, split, test, toString, ifElse, identity, propSatisfies, when, append, lte, gte, curry, } from '@blue/util';
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
const { parseFloat, parseInt } = Number, appendEmptyString = append(''), defaultToZero = defaultTo(0), defaultToMaxValue = defaultTo(Number.MAX_VALUE), isOne = equals(1), isArray = Array.isArray, isUndefined = equals(void 0), isDefined = complement(isUndefined), isString = is(String), lengthIsOne = propSatisfies(isOne, 'length'), splitOnDot = split(/\./), isSingleSpaced = complement(pipe(split(' '), any(isEmpty))), lengthOf = prop('length'), removeAnyAlphaNumber = replace(ANY_ALPHA_NUMERIC_REGEX, ''), removeLowerCase = replace(NOT_A_CAPITAL_REGEX, ''), removeNonAlpha = replace(NOT_AN_ALPHA_REGEX, ''), removeNonNumber = replace(NOT_A_NUMBER_REGEX, ''), removeNonPasswordSymbol = replace(NOT_A_PASSWORD_SYMBOL, ''), removeLeadingSlash = replace(/^\//, ''), removeTrailingSlash = replace(/\/$/, ''), removeTrailingSlashAndFlags = replace(/\/[^/]*$/, ''), removeSlashes = pipe(removeLeadingSlash, removeTrailingSlash), removeSlashesAndFlags = pipe(removeLeadingSlash, removeTrailingSlashAndFlags), removeWhitespace = replace(WHITESPACE_REGEX, ''), alphaCount = pipe(toString, removeNonAlpha, lengthOf), numberCount = pipe(toString, removeNonNumber, lengthOf), passwordSymbolCount = pipe(toString, removeNonPasswordSymbol, lengthOf), specialsCount = pipe(toString, removeAnyAlphaNumber, lengthOf), upperCaseCount = pipe(toString, removeLowerCase, lengthOf), valueCount = pipe(toString, lengthOf), patternConstraint = curry(({ regex, flags = null }, value) => {
    regex = ifElse(isString, removeSlashes, identity)(regex);
    const matcher = isString(flags)
        ? new RegExp(pipe(toString, removeSlashesAndFlags)(regex), flags)
        : new RegExp(regex);
    return test(matcher, value);
}), isAddressLine = patternConstraint({ regex: ADDRESS_LINE_REGEX }), isAlpha = patternConstraint({ regex: ALPHA_REGEX }), isAlphaNumeric = patternConstraint({ regex: ALPHA_NUMERIC_REGEX }), isAlphaNumericPlus = patternConstraint({ regex: ALPHA_NUMERIC_PLUS_REGEX }), isBlank = pipe(toString, removeWhitespace, isEmpty), isBoolean = patternConstraint({ regex: BOOLEAN_REGEX }), isCapitals = (value, params = { min: 1 }) => rangeValidator(upperCaseCount(value), params), isCharacters = (value, params = { min: 1 }) => rangeValidator(alphaCount(value), params), isCity = both(isSingleSpaced, test(CITY_REGEX)), 
/**
 * Validates a value with a set of constraints, requiring a minimum to be true
 * @param {external:string} value value to validate
 * @param {external:Object} params expected parameters
 * @param {external:Object} params.constraint set of constraints as an array
 * @param {external:Object} params.constraint.type constraint name
 * @param {external:Object} params.constraint.params constraint params
 * @param {external:Object} params.min the minimum number of constraints in the set that must be true
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
 * @param {external:string} The value expected
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
}, isEmail = patternConstraint({ regex: EMAIL_REGEX }), isEnum = (value, params = {}) => {
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
}, isInteger = patternConstraint({ regex: INTEGER_REGEX }), isITINRange = (value) => {
    const text = toString(value), length = text.length;
    let n = length < 4 ? 0 : Number(text[3]);
    if (length > 4 && n >= 7) {
        n = n * 10 + Number(text[4]);
    } // fourth and fifth positions values are 70-88, 90-92, 94-99, partial validation true when not enough characters
    return length < 4 || (length === 4 && n >= 7) || (n >= 70 && n <= 88) || (n >= 90 && n <= 92) || n >= 94;
}, isLength = (value, params) => rangeValidator(valueCount(value), params), 
/**
 * Validates a number to be less than
 * @function module:validate.constraints~isMax
 * @param {external:string|external:number} value The value to be tested
 * @param {Param} params
 * @returns {external:boolean} Whether or not the `value` is less than or equal to `params.value`.
 */
isMax = (value, params = {}) => lte(parseFloat(value), parseFloat(params.value)), 
/**
 * Validates a number to be greater than
 * @function module:validate.constraints~isMin
 * @param {external:string|external:number} value The value to be tested
 * @param {Param} params
 * @returns {external:boolean} Whether or not the `value` is greater than or equal to `params.value`.
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
}, isNotBeginWith1 = (value) => isNotBeginWith(value, { value: '1' }), isNotBlank = complement(isBlank), isNumbers = (value, params = { min: 1 }) => rangeValidator(numberCount(value), params), isNumeric = patternConstraint({ regex: NUMERIC_REGEX }), isPasswordCharacters = patternConstraint({ regex: PASSWORD_FORMAT }), isPasswordSymbols = (value, params = { min: 1 }) => rangeValidator(passwordSymbolCount(value), params), isPast = (value, format = DEFAULT_DATE_FORMAT) => {
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
isPatternMatch = (value, regexp, flags) => {
    regexp = ifElse(isString, removeSlashes, identity)(regexp);
    const matcher = isString(flags)
        ? new RegExp(pipe(toString, removeSlashesAndFlags)(regexp), flags)
        : new RegExp(regexp);
    return test(matcher, value);
}, isPersonalName = patternConstraint({ regex: NAME_REGEX }), isPhoneNorthAmerica = patternConstraint({ regex: PHONE_NORTH_AMERICA }), isPhoneOao = patternConstraint({ regex: PHONE_OAO_FORMAT }), isPostalCode = patternConstraint({ regex: POSTAL_CODE_REGEX }), 
/**
 * Validates a range
 * @param {external:string} The value expected
 * @param {external:Object} params Expected parameters
 * @param {external:Object} params.min Lowest amount in the range
 * @param {external:Object} params.max Highest amount in the range
 */
isRange = (value, params) => rangeValidator(value, params), isReal = patternConstraint({ regex: REAL_REGEX }), isRoutingNumber = (value) => {
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
}, isSpecials = (value, params = { min: 1 }) => rangeValidator(specialsCount(value), params), isSsn = patternConstraint({ regex: SSN_FORMAT }), isSsnExclude = patternConstraint({ regex: SSN_EXCLUDE_FORMAT }), isSsnOao = patternConstraint({ regex: SSN_OAO_FORMAT }), isSsnValidGroups = patternConstraint({ regex: SSN_VALID_GROUPS_FORMAT }), 
/**
 * Validates a value as a valid step in a possible range
 * @function module:validate.constraints.Step.validator
 * @param {external:string} value The value expected
 * @param {external:Object} params Expected parameters
 * @param {external:Object} params.min Lowest amount in the range
 * @param {external:Object} params.max Highest amount in the range
 * @param {external:Object} params.step Incremental or decremental step amount
 */
isStep = (value, params = { step: 1 }) => {
    const parsed = Number(value), step = Number(params.step);
    return rangeValidator(parsed, params) && parsed % step === 0;
}, isUrl = patternConstraint({ regex: URL_REGEX }), isValidDate = (value, format = DEFAULT_DATE_FORMAT) => {
    /*const date = isString( value ) ?
        moment( value, format, true ) :
        moment( value );
    return date.isValid();*/
    console.log('FIX');
    return true;
}, isZipCode = patternConstraint({ regex: ZIP_CODE_REGEX }), isZipCodeExtension = patternConstraint({ regex: ZIP_CODE_EXTENSION_REGEX }), rangeValidator = function (value, params = {}) {
    let min, max;
    // Process params
    if (isDefined(params.value)) {
        min = max = Number(params.value);
    }
    else {
        min = defaultToZero(Number(params.min));
        max = defaultToMaxValue(Number(params.max));
    }
    value = Number(value);
    return value >= min && value <= max;
};
/**
 * @namespace module:validate.constraints
 */
const standardConstraints = {
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
        validate: (value, params = {}) => {
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
        validate: (value, params = {}) => {
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
        validate: (value, params = {}) => {
            const { format } = params;
            return isPast(value, format);
        },
    },
    /**
     * @member {module:validate.constraints~Constraint} module:validate.constraints.Pattern
     */
    Pattern: {
        validate: (value, params = {}) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhcmQtY29uc3RyYWludHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3RhbmRhcmQtY29uc3RyYWludHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQ0gsV0FBVyxFQUNYLG1CQUFtQixFQUNuQix3QkFBd0IsRUFDeEIsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQixjQUFjLEVBQ2Qsd0JBQXdCLEVBQ3hCLFVBQVUsRUFDVixtQkFBbUIsRUFDbkIsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixtQkFBbUIsRUFDbkIsa0JBQWtCLEVBQ2xCLFdBQVcsRUFDWCxxQkFBcUIsRUFDckIsYUFBYSxFQUNiLGVBQWUsRUFDZix3QkFBd0IsRUFDeEIsa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixlQUFlLEVBQ2YscUJBQXFCLEVBQ3JCLFVBQVUsRUFDVixVQUFVLEVBQ1YsdUJBQXVCLEVBQ3ZCLFVBQVUsRUFDVixrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLGdCQUFnQixHQUVuQixNQUFNLFdBQVcsQ0FBQztBQUNuQixPQUFPLEVBQ0gsR0FBRyxFQUNILElBQUksRUFDSixVQUFVLEVBQ1YsU0FBUyxFQUNULE1BQU0sRUFDTixPQUFPLEVBQ1AsRUFBRSxFQUNGLElBQUksRUFDSixJQUFJLEVBQ0osT0FBTyxFQUNQLEtBQUssRUFDTCxJQUFJLEVBQ0osUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEVBQ1IsYUFBYSxFQUNiLElBQUksRUFDSixNQUFNLEVBQ04sR0FBRyxFQUNILEdBQUcsRUFDSCxLQUFLLEdBQ1IsTUFBTSxZQUFZLENBQUM7QUErRHBCOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVILE1BQU0sRUFBRSxVQUFVLEVBQUUs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