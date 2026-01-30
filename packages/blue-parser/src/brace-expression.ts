/**
 * @author Jeff Rose
 * @see {@link https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html}
 * @see {@link https://github.com/juliangruber/brace-expansion}
 * @see {@link https://wiki-dev.bash-hackers.org/syntax/expansion/brace}
 */
// @ts-ignore
import {
    between,
    char,
    choice,
    coroutine,
    endOfInput,
    everyCharUntil,
    lookAhead,
    many,
    recursiveParser,
    regex,
    sepBy,
    sequenceOf,
    str,
} from 'arcsecond';
import { cond, flatten, identity, isNil, joinOnEmptyString, last, map, pipe, T, xprod } from './_util';
import { default as _sequenceExpression } from './sequence-expression';
import { anyString, optional } from './_parser';
import noop from './no-op';

const // String constants
    CARAT = '^',
    COMMA = ',',
    LEFT_BRACE = '{',
    OPTIONAL_STRING = '[^{]*',
    PERIOD = '.',
    RIGHT_BRACE = '}',
    UNESCAPED = '(?<!\\\\)',
    UNESCAPED_LEFT_BRACE = `${UNESCAPED}${LEFT_BRACE}`,
    // Regular expressions
    notReservedSymbol = new RegExp(`${CARAT}[${CARAT}${COMMA}${LEFT_BRACE}${RIGHT_BRACE}]`),
    // Utility methods
    { isArray } = Array,
    parsePrefix = (value) => (value?.length - 1 > 0 ? str(value.slice(0, -1)) : noop),
    toArray = cond([
        [isArray, identity],
        [isNil, () => []],
        [T, (v) => [v]],
    ]),
    xprodAndJoinOnString = (list1: any[], list2: any[]): string[] => pipe(xprod(list1), map(joinOnEmptyString))(list2),
    xprodAll = (list1: any[], list2?: any[], ...lists: any[][]): string[] =>
        list2 && list2.length ? xprodAll(xprodAndJoinOnString(list1, list2), ...lists) : list1,
    xprod3 = ([prefix, expression, suffix]) =>
        prefix.length
            ? xprodAll(prefix, expression, suffix)
            : suffix.length
              ? xprodAll(expression, suffix)
              : expression,
    // Parsers
    escapedChar = (c: string) => sequenceOf([char('\\'), char(c)]).map(last),
    validChar = choice([
        escapedChar(LEFT_BRACE),
        escapedChar(RIGHT_BRACE),
        escapedChar(COMMA),
        escapedChar(PERIOD),
        regex(notReservedSymbol),
    ]),
    validString = optional(validChar).map(joinOnEmptyString),
    comma = char(COMMA),
    leftBrace = char(LEFT_BRACE),
    rightBrace = char(RIGHT_BRACE),
    reservedSymbol = choice([leftBrace, rightBrace, comma, endOfInput]),
    betweenBraces = between(leftBrace)(rightBrace),
    prefix = lookAhead(regex(new RegExp(`${CARAT}${OPTIONAL_STRING}${UNESCAPED_LEFT_BRACE}`))).chain(parsePrefix),
    braceItem = recursiveParser(() =>
        betweenBraces(
            choice([sequenceOf([_sequenceExpression, lookAhead(rightBrace)]).map((args) => args[0]), listContent])
        )
    ),
    bracePart = choice([braceItem, validChar.map((v) => [v])]),
    braceContent = many(bracePart).map((parts) => (parts.length ? xprodAll(...parts) : [''])),
    listContent = sepBy(comma)(braceContent).map(flatten),
    braceExpression = (suffix) => sequenceOf([prefix.map(toArray), braceItem, suffix.map(toArray)]).map(xprod3);



export default braceExpression(choice([braceExpression(anyString), anyString]));
