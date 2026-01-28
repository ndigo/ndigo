/**
 * @author Jeff Rose
 */
export type CurrencyFormat = {
    decimal: string;
    decimalDigits: number;
    kDelim: string;
    symbol: string;
    symbolBegin: boolean;
    regex: RegExp;
};
export type CurrencyFormats = {
    [name: string]: CurrencyFormat;
};
/**
 * A regular expression matching an address line.
 * @constant {RegExp} module:validate.formats.ADDRESS_LINE_REGEX
 */
export declare const ADDRESS_LINE_REGEX: RegExp;
/**
 * A regular expression matching only letters and numbers.
 * @constant {RegExp} module:validate.formats.ALPHA_NUMERIC_REGEX
 */
export declare const ALPHA_NUMERIC_REGEX: RegExp;
/**
 * A regular expression matching letters, numbers, and symbols.
 * @constant {RegExp} module:validate.formats.ALPHA_NUMERIC_PLUS_REGEX
 */
export declare const ALPHA_NUMERIC_PLUS_REGEX: RegExp;
/**
 * A regular expression matching letters.
 * @constant {RegExp} module:validate.formats.ALPHA_REGEX
 */
export declare const ALPHA_REGEX: RegExp;
/**
 * A regular expression matching letters and numbers.
 * @constant {RegExp} module:validate.formats.ANY_ALPHA_NUMERIC_REGEX
 */
export declare const ANY_ALPHA_NUMERIC_REGEX: RegExp;
/**
 * A regular expression matching booleans.
 * @constant {RegExp} module:validate.formats.BOOLEAN_REGEX
 */
export declare const BOOLEAN_REGEX: RegExp;
/**
 * A regular expression matching a city.
 * @constant {RegExp} module:validate.formats.CITY_REGEX
 */
export declare const CITY_REGEX: RegExp;
/**
 * A date string
 * @constant {string} module:validate.formats.DEFAULT_DATE_FORMAT='MM/DD/YYYY'
 */
export declare const DEFAULT_DATE_FORMAT = "MM/DD/YYYY";
/**
 * A regular expression matching email addresses.
 * @constant {RegExp} module:validate.formats.EMAIL_REGEX
 */
export declare const EMAIL_REGEX: RegExp;
/**
 * A regular expression matching integers.
 * @constant {RegExp} module:validate.formats.INTEGER_REGEX
 */
export declare const INTEGER_REGEX: RegExp;
/**
 * A regular expression matching names.
 * @constant {RegExp} module:validate.formats.NAME_REGEX
 */
export declare const NAME_REGEX: RegExp;
/**
 * A regular expression matching lowercase letters.
 * @constant {RegExp} module:validate.formats.NOT_A_CAPITAL_REGEX
 */
export declare const NOT_A_CAPITAL_REGEX: RegExp;
/**
 * A regular expression matching non-numbers.
 * @constant {RegExp} module:validate.formats.NOT_A_NUMBER_REGEX
 */
export declare const NOT_A_NUMBER_REGEX: RegExp;
/**
 * A regular expression matching non-password symbols.
 * @constant {RegExp} module:validate.formats.NOT_A_PASSWORD_SYMBOL
 */
export declare const NOT_A_PASSWORD_SYMBOL: RegExp;
/**
 * A regular expression matching non-phone number email addresses.
 * @constant {RegExp} module:validate.formats.NOT_AN_ALPHA_REGEX
 */
export declare const NOT_AN_ALPHA_REGEX: RegExp;
/**
 * A regular expression matching non-phone number email addresses.
 * @constant {RegExp} module:validate.formats.NOT_PHONE_EMAIL_REGEX
 */
export declare const NOT_PHONE_EMAIL_REGEX: RegExp;
/**
 * A regular expression matching numbers.
 * @constant {RegExp} module:validate.formats.NUMERIC_REGEX
 */
export declare const NUMERIC_REGEX: RegExp;
/**
 * A regular expression matching passwords.
 * @constant {RegExp} module:validate.formats.PASSWORD_FORMAT
 */
export declare const PASSWORD_FORMAT: RegExp;
/**
 * A regular expression matching North American phone numbers.
 * @constant {RegExp} module:validate.formats.PHONE_NORTH_AMERICA
 */
export declare const PHONE_NORTH_AMERICA: RegExp;
/**
 * A regular expression matching non-blacklisted phone numbers per Online Account Opening (OAO).
 * @constant {RegExp} module:validate.formats.PHONE_OAO_FORMAT
 */
export declare const PHONE_OAO_FORMAT: RegExp;
/**
 * A regular expression matching postal codes.
 * @constant {RegExp} module:validate.formats.POSTAL_CODE_REGEX
 */
export declare const POSTAL_CODE_REGEX: RegExp;
/**
 * A regular expression matching real numbers.
 * @constant {RegExp} module:validate.formats.REAL_REGEX
 */
export declare const REAL_REGEX: RegExp;
/**
 * @constant {RegExp} module:validate.formats.REPEATING_SEQUENCE_REGEX
 * @example
 * REPEATING_SEQUENCE_REGEX.test('111a!'); // is true, Since we have repeating sequence '111'
 * REPEATING_SEQUENCE_REGEX.test('123a!'); // is false, Since we don't have a repeating sequence
 */
export declare const REPEATING_SEQUENCE_REGEX: RegExp;
/**
 * A regular expression matching SSN Exclude Format.
 *
 * Social Security numbers to exclude format per Online Account Opening (OAO).
 *
 * This format excludes:
 * - 123456789, 123-45-6789, 987654321, 987-65-4321
 * @constant {RegExp} module:validate.formats.SSN_FORMAT
 */
export declare const SSN_EXCLUDE_FORMAT: RegExp;
/**
 * A regular expression matching SSN.
 * @constant {RegExp} module:validate.formats.SSN_FORMAT
 */
export declare const SSN_FORMAT: RegExp;
/**
 * A regular expression matching SSN OAO Format.
 *
 * Social Security number format per Online Account Opening (OAO).
 *
 * This format excludes:
 * - Area group numbers (first three digits) of 000, 666, 900-999
 * - 123456789 and 123-45-6789
 * - Any SSN where all digits are the same digit, 111-11-1111, 222-22-2222, ...
 * - Group numbers of all zeroes, 000, 00, 0000
 * @constant {RegExp} module:validate.formats.SSN_OAO_FORMAT
 */
export declare const SSN_OAO_FORMAT: RegExp;
/**
 * A regular expression matching SSN valid groups.
 *
 * Social Security valid group numbers format per Online Account Opening (OAO).
 *
 * This format excludes:
 * - Area group numbers (first three digits) of 000, 666, 900-999
 * - Group numbers of all zeroes, 000, 00, 0000
 * @constant {RegExp} module:validate.formats.SSN_VALID_GROUPS_FORMAT
 */
export declare const SSN_VALID_GROUPS_FORMAT: RegExp;
/**
 * A regular expression matching a URL.
 * @constant {RegExp} module:validate.formats.URL_REGEX
 */
export declare const URL_REGEX: RegExp;
/**
 * A regular expression matching whitespace.
 * @constant {RegExp} module:validate.formats.WHITESPACE_REGEX
 */
export declare const WHITESPACE_REGEX: RegExp;
/**
 * A regular expression matching a zip code extension.
 * @constant {RegExp} module:validate.formats.ZIP_CODE_EXTENSION_REGEX=/^([0-9]{4})?$/
 */
export declare const ZIP_CODE_EXTENSION_REGEX: RegExp;
/**
 * A regular expression matching a zip code.
 * @constant {RegExp} module:validate.formats.ZIP_CODE_REGEX=/^[0-9]{5}$/
 */
export declare const ZIP_CODE_REGEX: RegExp;
/**
 * An object for matching currency, specifically USD.
 * @constant {CurrencyFormats} module:validate.formats.currencyFormats
 */
export declare const currencyFormats: CurrencyFormats;
//# sourceMappingURL=formats.d.ts.map