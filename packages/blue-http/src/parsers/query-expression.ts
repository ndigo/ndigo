/**
 * @author Jeff Rose
 */
import list from '@blue/util/list';
import { replace, decodeURIComponent as decode } from '@blue/util/string';
import { char, choice, possibly, regex, sepBy, sequenceOf } from '@blue/parser';

const { fromRepeatedPairs } = list;

const queryKeyRule = /^[A-Za-z+:/?[\]0-9%]+/,
    queryValueRule = /^[A-Za-z+:/?[\]0-9%=]+/,
    replacePlusWithSpace = replace(/\+/g, ' '),
    // Removes '=' from the value array
    // e.g. [ "foo", [ "=", "bar" ] ] -> [ "foo", "bar" ]
    filterEquals = ([key, value]) => [key, Array.isArray(value) ? value[1] : value],
    ampersand = char('&'),
    semicolon = char(';'),
    delimiter = choice([ampersand, semicolon]),
    equals = char('='),
    prefix = choice([ampersand, char('?'), char('#')]),
    // Matches query parameter keys: alphanumeric and specific URL characters
    queryKey = regex(queryKeyRule).map(replacePlusWithSpace).map(decode),
    // Matches query parameter values: keys plus equals sign
    queryValue = regex(queryValueRule).map(replacePlusWithSpace).map(decode),
    separatedByDelimiter = sepBy(delimiter),
    queryParameter = sequenceOf([queryKey, sequenceOf([possibly(equals), possibly(queryValue)])]).map(filterEquals),
    queryParameterList = separatedByDelimiter(queryParameter);

export const queryExpression = sequenceOf([possibly(prefix), queryParameterList]).map(([_prefix, pairs]) => {
    return fromRepeatedPairs(pairs as [any, any][]);
});

export default queryExpression;
