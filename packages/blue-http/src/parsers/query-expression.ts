/**
 * @author Jeff Rose
 */
import { fromRepeatedPairs, replace, decodeURIComponent as decode } from '@blue/util';
import { char, choice, coroutine, possibly, regex, sepByN, sequenceOf } from '@blue/parser';

const replacePlusWithSpace = replace(/\+/g, ' '),
    // Removes '=' from the value array
    // e.g. [ "foo", [ "=", "bar" ] ] -> [ "foo", "bar" ]
    filterEquals = ([key, value]) => [key, Array.isArray(value) ? value[1] : value],
    ampersand = char('&'),
    equals = char('='),
    prefix = choice([ampersand, char('?'), char('#')]),
    queryKey = regex(/^[A-Za-z+:/?[\]0-9%]+/)
        .map(replacePlusWithSpace)
        .map(decode),
    queryValue = regex(/^[A-Za-z+:/?[\]0-9%=]+/)
        .map(replacePlusWithSpace)
        .map(decode),
    separatedByAmpersand = sepByN(0)(ampersand),
    queryParameter = sequenceOf([queryKey, sequenceOf([possibly(equals), possibly(queryValue)])]).map(filterEquals),
    queryParameterList = separatedByAmpersand(queryParameter);

export const queryExpression = coroutine(function* () {
    yield possibly(prefix);
    const pairs = yield queryParameterList;
    return fromRepeatedPairs(pairs);
});

export default queryExpression;
