/**
 * @author Jeff Rose
 */
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
 * @constant {RegExp} module:validate.formats.ADDRESS_LINE_REGEX
 */
export const ADDRESS_LINE_REGEX = /^[a-zA-Z0-9.#&$/,:'\- ]{0,40}$/;
/**
 * A regular expression matching only letters and numbers.
 * @constant {RegExp} module:validate.formats.ALPHA_NUMERIC_REGEX
 */
export const ALPHA_NUMERIC_REGEX = /^[0-9A-Za-z]*$/;
/**
 * A regular expression matching letters, numbers, and symbols.
 * @constant {RegExp} module:validate.formats.ALPHA_NUMERIC_PLUS_REGEX
 */
export const ALPHA_NUMERIC_PLUS_REGEX = /^[a-zA-Z0-9.#&$/,:'\- ]*$/;
/**
 * A regular expression matching letters.
 * @constant {RegExp} module:validate.formats.ALPHA_REGEX
 */
export const ALPHA_REGEX = /^[A-Za-z]*$/;
/**
 * A regular expression matching letters and numbers.
 * @constant {RegExp} module:validate.formats.ANY_ALPHA_NUMERIC_REGEX
 */
export const ANY_ALPHA_NUMERIC_REGEX = /[0-9A-Za-z]/g;
/**
 * A regular expression matching booleans.
 * @constant {RegExp} module:validate.formats.BOOLEAN_REGEX
 */
export const BOOLEAN_REGEX = /^(true|false)$/i;
/**
 * A regular expression matching a city.
 * @constant {RegExp} module:validate.formats.CITY_REGEX
 */
export const CITY_REGEX = /^[a-zA-Z0-9. ',-]{0,32}$/;
/**
 * A date string
 * @constant {string} module:validate.formats.DEFAULT_DATE_FORMAT='MM/DD/YYYY'
 */
export const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY';
/**
 * A regular expression matching email addresses.
 * @constant {RegExp} module:validate.formats.EMAIL_REGEX
 */
export const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9]){1,}?$/i;
/**
 * A regular expression matching integers.
 * @constant {RegExp} module:validate.formats.INTEGER_REGEX
 */
export const INTEGER_REGEX = /^-?[0-9]*$/;
/**
 * A regular expression matching names.
 * @constant {RegExp} module:validate.formats.NAME_REGEX
 */
export const NAME_REGEX = /^[a-zA-Z\. '-]*$/;
/**
 * A regular expression matching lowercase letters.
 * @constant {RegExp} module:validate.formats.NOT_A_CAPITAL_REGEX
 */
export const NOT_A_CAPITAL_REGEX = /[^A-Z]/g;
/**
 * A regular expression matching non-numbers.
 * @constant {RegExp} module:validate.formats.NOT_A_NUMBER_REGEX
 */
export const NOT_A_NUMBER_REGEX = /[^0-9]/g;
/**
 * A regular expression matching non-password symbols.
 * @constant {RegExp} module:validate.formats.NOT_A_PASSWORD_SYMBOL
 */
export const NOT_A_PASSWORD_SYMBOL = /[^!#$%+\/=@~]/g;
/**
 * A regular expression matching non-phone number email addresses.
 * @constant {RegExp} module:validate.formats.NOT_AN_ALPHA_REGEX
 */
export const NOT_AN_ALPHA_REGEX = /[^a-zA-Z]/g;
/**
 * A regular expression matching non-phone number email addresses.
 * @constant {RegExp} module:validate.formats.NOT_PHONE_EMAIL_REGEX
 */
export const NOT_PHONE_EMAIL_REGEX = /^\d{10}@/;
/**
 * A regular expression matching numbers.
 * @constant {RegExp} module:validate.formats.NUMERIC_REGEX
 */
export const NUMERIC_REGEX = /^[0-9]*$/;
/**
 * A regular expression matching passwords.
 * @constant {RegExp} module:validate.formats.PASSWORD_FORMAT
 */
export const PASSWORD_FORMAT = /^[A-Za-z0-9!#$%+/=@~]*$/;
/**
 * A regular expression matching North American phone numbers.
 * @constant {RegExp} module:validate.formats.PHONE_NORTH_AMERICA
 */
export const PHONE_NORTH_AMERICA = /^\d{10}$|^\d{3}-\d{3}-\d{4}$/;
/**
 * A regular expression matching non-blacklisted phone numbers per Online Account Opening (OAO).
 * @constant {RegExp} module:validate.formats.PHONE_OAO_FORMAT
 */
export const PHONE_OAO_FORMAT = /^(?!(?:012-?345-?6789|987-?654-?3210))(?:\d{3}(-?)\d{3}\1\d{4})$/;
/**
 * A regular expression matching postal codes.
 * @constant {RegExp} module:validate.formats.POSTAL_CODE_REGEX
 */
export const POSTAL_CODE_REGEX = /^[a-zA-Z0-9]{0,9}$/;
/**
 * A regular expression matching real numbers.
 * @constant {RegExp} module:validate.formats.REAL_REGEX
 */
export const REAL_REGEX = /^-?([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
/**
 * @constant {RegExp} module:validate.formats.REPEATING_SEQUENCE_REGEX
 * @example
 * REPEATING_SEQUENCE_REGEX.test('111a!'); // is true, Since we have repeating sequence '111'
 * REPEATING_SEQUENCE_REGEX.test('123a!'); // is false, Since we don't have a repeating sequence
 */
export const REPEATING_SEQUENCE_REGEX = /(.)\1/;
/**
 * A regular expression matching SSN Exclude Format.
 *
 * Social Security numbers to exclude format per Online Account Opening (OAO).
 *
 * This format excludes:
 * - 123456789, 123-45-6789, 987654321, 987-65-4321
 * @constant {RegExp} module:validate.formats.SSN_FORMAT
 */
export const SSN_EXCLUDE_FORMAT = /^(?!123(-?)45\1{1}6789|987(-?)65\2{1}4321).*$/;
/**
 * A regular expression matching SSN.
 * @constant {RegExp} module:validate.formats.SSN_FORMAT
 */
export const SSN_FORMAT = /^\d{9}$|^\d{3}-\d{2}-\d{4}$/;
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
export const SSN_OAO_FORMAT = /^(?!9|000|666|123(-?)45\1{1}6789|([1-578])\2{2}(-?)\2{2}\3\2{4})\d{3}(-?)(?!00)\d{2}\4(?!0000)\d{4}$/;
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
export const SSN_VALID_GROUPS_FORMAT = /^(?!000|666|9|\d{3}(?:-?)00|\d{3}(-?)\d{2}\1(?:0000)).*$/;
/**
 * A regular expression matching a URL.
 * @constant {RegExp} module:validate.formats.URL_REGEX
 */
export const URL_REGEX = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!$&'()*+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|\/|\?)*)?$/i;
/**
 * A regular expression matching whitespace.
 * @constant {RegExp} module:validate.formats.WHITESPACE_REGEX
 */
export const WHITESPACE_REGEX = new RegExp(`[${WHITE_SPACES.join('')}]`, 'g');
/**
 * A regular expression matching a zip code extension.
 * @constant {RegExp} module:validate.formats.ZIP_CODE_EXTENSION_REGEX=/^([0-9]{4})?$/
 */
export const ZIP_CODE_EXTENSION_REGEX = /^([0-9]{4})?$/;
/**
 * A regular expression matching a zip code.
 * @constant {RegExp} module:validate.formats.ZIP_CODE_REGEX=/^[0-9]{5}$/
 */
export const ZIP_CODE_REGEX = /^[0-9]{5}$/;
/**
 * An object for matching currency, specifically USD.
 * @constant {CurrencyFormats} module:validate.formats.currencyFormats
 */
export const currencyFormats = {
    USD: {
        decimal: '.',
        decimalDigits: 2,
        kDelim: ',',
        symbol: '$',
        symbolBegin: true,
        regex: /^\s*\$?((\d+|\d{1,3}(,\d{3})*)(\.\d{0,2})?|\.\d{1,2})\s*$/,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mb3JtYXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBZUg7Ozs7Ozs7O0dBUUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUgsTUFBTSxZQUFZLEdBQUc7SUFDakIsR0FBRztJQUNILElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osUUFBUTtJQUNSLFFBQVE7SUFDUixRQUFRO0lBQ1IsUUFBUTtJQUNSLFFBQVE7SUFDUixRQUFRO0lBQ1IsUUFBUTtJQUNSLFFBQVE7SUFDUixRQUFRO0lBQ1IsUUFBUTtJQUNSLFFBQVE7SUFDUixRQUFRO0lBQ1IsUUFBUTtJQUNSLFFBQVE7SUFDUixRQUFRO0lBQ1IsUUFBUTtJQUNSLFFBQVE7SUFDUixRQUFRO0lBQ1IsUUFBUTtDQUNYLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxnQ0FBZ0MsQ0FBQztBQUVuRTs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxnQkFBZ0IsQ0FBQztBQUVwRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRywyQkFBMkIsQ0FBQztBQUVwRTs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDO0FBRXpDOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLGNBQWMsQ0FBQztBQUV0RDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUM7QUFFL0M7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLDBCQUEwQixDQUFDO0FBRXJEOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQztBQUVoRDs7O0dBR0c7QUFDSCxNQUFN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