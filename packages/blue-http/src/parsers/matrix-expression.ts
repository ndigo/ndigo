/**
 * @author Jeff Rose
 */
import list from '@blue/util/list';
import { replace, decodeURIComponent as decode } from '@blue/util/string';
import { char, choice, possibly, regex, sepBy, sequenceOf, takeRight } from '@blue/parser';

const { fromRepeatedPairs } = list;

const matrixKeyRule = /^[^=;]+/,
    matrixValueRule = /^[^;]*/,
    replacePlusWithSpace = replace(/\+/g, ' '),
    // Takes [key, value] or [key] and returns [key, value_or_null]
    // Also handles comma-separated values for matrix strings
    mapParameterToPair = (parsed): [string, any] => {
        let key: string;
        let value: any;

        if (Array.isArray(parsed)) {
            if (parsed.length === 2) {
                key = parsed[0];
                value = parsed[1];
            } else if (parsed.length === 1) {
                key = parsed[0];
                value = null;
            }
        } else {
            key = parsed;
            value = null;
        }

        if (typeof value === 'string' && value.includes(',')) {
            value = value.split(',').map((v) => (v === '' ? null : v));
        } else if (value === '') {
            value = null;
        }

        return [key, value];
    },
    semicolon = char(';'),
    equals = char('='),
    // Match any character that is not a semicolon or an equals sign
    matrixKey = regex(matrixKeyRule).map(replacePlusWithSpace).map(decode),
    // Match any character that is not a semicolon (allows empty values)
    matrixValue = regex(matrixValueRule).map(replacePlusWithSpace).map(decode),
    // key=value
    keyValue = sequenceOf([matrixKey, takeRight(equals)(matrixValue)]),
    // key (treat value as null)
    keyOnly = matrixKey.map((k) => [k, null]),
    matrixParameter = choice([keyValue, keyOnly]),
    matrixParameterList = sepBy(semicolon)(matrixParameter);

export const matrixExpression = sequenceOf([possibly(semicolon), matrixParameterList]).map(([prefix, pairs]) =>
    fromRepeatedPairs(pairs.map(mapParameterToPair))
);

export default matrixExpression;
