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
    lookAhead,
    many,
    recursiveParser,
    regex,
    sepBy,
    sequenceOf,
    str,
} from 'arcsecond';
import { cond, flatten, identity, isNil, last, T, xprodAll, xprod3 } from './_util';
import { default as _sequenceExpression } from './sequence-expression';
import { anyString } from './_parser';
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
    // Parsers
    escapedChar = (c: string) => sequenceOf([char('\\'), char(c)]).map(last),
    validChar = choice([
        escapedChar(LEFT_BRACE),
        escapedChar(RIGHT_BRACE),
        escapedChar(COMMA),
        escapedChar(PERIOD),
        regex(notReservedSymbol),
    ]),
    comma = char(COMMA),
    leftBrace = char(LEFT_BRACE),
    rightBrace = char(RIGHT_BRACE),
    betweenBraces = between(leftBrace)(rightBrace),
    prefix = lookAhead(regex(new RegExp(`${CARAT}${OPTIONAL_STRING}${UNESCAPED_LEFT_BRACE}`))).chain(parsePrefix),
    braceItem = recursiveParser(() =>
        betweenBraces(
            choice([sequenceOf([_sequenceExpression, lookAhead(rightBrace)]).map((args) => args[0]), listContent])
        )
    ),
    bracePart = choice([braceItem, validChar.map((v) => [v])]),
    braceContent = many(bracePart).map((parts) => (parts.length ? xprodAll(parts as any[][]) : [''])),
    listContent = sepBy(comma)(braceContent).map(flatten),
    braceExpression = (suffix) => sequenceOf([prefix.map(toArray), braceItem, suffix.map(toArray)]).map(xprod3);

export default braceExpression(choice([braceExpression(anyString), anyString]));
