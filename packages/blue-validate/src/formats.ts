/**
 * @author Jeff Rose
 */

/**
 * Defines the structure for a currency format, including symbols, delimiters, and regex patterns.
 * @property {string} decimal - The character used for the decimal separator (e.g., '.').
 * @property {number} decimalDigits - The number of digits expected after the decimal point.
 * @property {string} kDelim - The character used for the thousands delimiter (e.g., ',').
 * @property {string} symbol - The currency symbol (e.g., '$').
 * @property {boolean} symbolBegin - True if the symbol appears before the amount, false otherwise.
 * @property {RegExp} regex - A regular expression to validate the currency format.
 */
export type CurrencyFormat = {
    decimal: string;
    decimalDigits: number;
    kDelim: string;
    symbol: string;
    symbolBegin: boolean;
    regex: RegExp;
};

/**
 * A collection of `CurrencyFormat` objects, keyed by currency name (e.g., 'USD').
 */
export type CurrencyFormats = {
    [name: string]: CurrencyFormat;
};

/**
 * @typedef {Object} CurrencyFormat
 * @property {string} decimal
 * @property {number} decimalDigits
 * @property {string} kDelim
 * @property {string} symbol
 * @property {boolean} symbolBegin
 * @property {RegExp} regex
 */

/**
 * @typedef {Object<external:string,CurrencyFormat>} CurrencyFormats
 */

/**
 * @namespace module:validate.formats
 */

const WHITE_SPACES = [
    ' ',
    '\n',
    '\r',
    '\t',
    '\f',
    '\v',
    '\u00A0',
    '\u1680',
    '\u180E',
    '\u2000',
    '\u2001',
    '\u2002',
    '\u2003',
    '\u2004',
    '\u2005',
    '\u2006',
    '\u2007',
    '\u2008',
    '\u2009',
    '\u200A',
    '\u2028',
    '\u2029',
    '\u202F',
    '\u205F',
    '\u3000',
];

/**
 * A regular expression matching an address line.
 */
export const addressLineRule = /^[a-zA-Z0-9.#&$/,:'\- ]{0,40}$/;

/**
 * A regular expression matching only letters and numbers.
 */
export const alphaNumericRule = /^[0-9A-Za-z]*$/;

/**
 * A regular expression matching letters, numbers, and symbols.
 */
export const alphaNumericPlusRule = /^[a-zA-Z0-9.#&$/,:'\- ]*$/;

/**
 * A regular expression matching letters.
 */
export const alphaRule = /^[A-Za-z]*$/;

/**
 * A regular expression matching letters and numbers.
 */
export const anyAlphaNumericRule = /[0-9A-Za-z]/g;

/**
 * A regular expression matching booleans.
 */
export const booleanRule = /^(true|false)$/i;

/**
 * A regular expression matching a city.
 */
export const cityRule = /^[a-zA-Z0-9. ',-]{0,32}$/;

/**
 * The default date format string.
 */
export const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY';

/**
 * A regular expression matching email addresses.
 */
export const emailRule =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9]){1,}?$/i;

/**
 * A regular expression matching integers.
 */
export const integerRule = /^-?[0-9]*$/;

/**
 * A regular expression matching names.
 */
export const nameRule = /^[a-zA-Z\. '-]*$/;

/**
 * A regular expression matching lowercase letters.
 */
export const notACapitalRule = /[^A-Z]/g;

/**
 * A regular expression matching non-numbers.
 */
export const notANumberRule = /[^0-9]/g;

/**
 * A regular expression matching non-password symbols.
 */
export const notAPasswordSymbolRule = /[^!#$%+\/=@~]/g;

/**
 * A regular expression matching non-phone number email addresses.
 */
export const notAnAlphaRule = /[^a-zA-Z]/g;

/**
 * A regular expression matching non-phone number email addresses.
 */
export const notPhoneEmailRule = /^\d{10}@/;

/**
 * A regular expression matching numbers.
 */
export const numericRule = /^[0-9]*$/;

/**
 * A regular expression matching passwords.
 */
export const passwordRule = /^[A-Za-z0-9!#$%+/=@~]*$/;

/**
 * A regular expression matching North American phone numbers.
 */
export const phoneNorthAmericaRule = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;

/**
 * A regular expression matching non-blacklisted phone numbers per Online Account Opening (OAO).
 */
export const phoneOaoRule = /^(?!(?:012-?345-?6789|987-?654-?3210))(?:\d{3}(-?)\d{3}\1\d{4})$/;

/**
 * A regular expression matching postal codes.
 */
export const postalCodeRule = /^[a-zA-Z0-9]{0,9}$/;

/**
 * A regular expression matching real numbers.
 */
export const realRule = /^-?([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;

/**
 * A regular expression matching repeating sequences of characters.
 * @example
 * repeatingSequenceRule.test('111a!'); // is true, Since we have repeating sequence '111'
 * repeatingSequenceRule.test('123a!'); // is false, Since we don't have a repeating sequence
 */
export const repeatingSequenceRule = /(.)\1/;

/**
 * A regular expression matching SSN Exclude Format.
 *
 * Social Security numbers to exclude format per Online Account Opening (OAO).
 *
 * This format excludes:
 * - 123456789, 123-45-6789, 987654321, 987-65-4321
 */
export const ssnExcludeRule = /^(?!123(-?)45\1{1}6789|987(-?)65\2{1}4321).*$/;

/**
 * A regular expression matching SSN.
 */
export const ssnRule = /^\d{9}$|^\d{3}-\d{2}-\d{4}$/;

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
 */
export const ssnOaoRule =
    /^(?!9|000|666|123(-?)45\1{1}6789|([1-578])\2{2}(-?)\2{2}\3\2{4})\d{3}(-?)(?!00)\d{2}\4(?!0000)\d{4}$/;

/**
 * A regular expression matching SSN valid groups.
 *
 * Social Security valid group numbers format per Online Account Opening (OAO).
 *
 * This format excludes:
 * - Area group numbers (first three digits) of 000, 666, 900-999
 * - Group numbers of all zeroes, 000, 00, 0000
 */
export const ssnValidGroupsRule = /^(?!000|666|9|\d{3}(?:-?)00|\d{3}(-?)\d{2}\1(?:0000)).*$/;

/**
 * A regular expression matching a URL.
 */
export const urlRule =
    /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!$&'()*+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|\/|\?)*)?$/i;

/**
 * A regular expression matching whitespace.
 */
export const whitespaceRule = new RegExp(`[${WHITE_SPACES.join('')}]`, 'g');

/**
 * A regular expression matching a zip code extension.
 */
export const zipCodeExtensionRule = /^([0-9]{4})?$/;

/**
 * A regular expression matching a zip code.
 */
export const zipCodeRule = /^[0-9]{5}$/;

/**
 * An object containing predefined currency formats, keyed by currency code (e.g., 'USD').
 */
export const currencyFormats: CurrencyFormats = {
    USD: {
        decimal: '.',
        decimalDigits: 2,
        kDelim: ',',
        symbol: '$',
        symbolBegin: true,
        regex: /^\s*\$?((\d+|\d{1,3}(,\d{3})*)(\.\d{0,2})?|\.\d{1,2})\s*$/,
    },
};
