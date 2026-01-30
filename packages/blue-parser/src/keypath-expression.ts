/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcsecond}
 */
// @ts-ignore
import { anyCharExcept, between, char, choice, digit, digits, letter, sequenceOf } from 'arcsecond';
import { flatten, joinOnEmptyString, last } from './_util';
import { atLeastOne, optional, leftBracket, rightBracket } from './_parser';

const writeIdentifier = ([start, parts = []]: [string, string[]]) => `${start}${joinOnEmptyString(parts)}`,
    identifierStart = choice([letter, char('_'), char('$')]),
    identifierPart = choice([identifierStart, digit]),
    identifier = sequenceOf([identifierStart, optional(identifierPart)]).map(writeIdentifier as any),
    doubleQuote = char('"'),
    singleQuote = char("'"),
    betweenSingleQuotes = between(singleQuote)(singleQuote),
    betweenDoubleQuotes = between(doubleQuote)(doubleQuote),
    numericLiteral = digits,
    stringLiteral = choice([
        betweenSingleQuotes(atLeastOne(anyCharExcept(singleQuote))),
        betweenDoubleQuotes(atLeastOne(anyCharExcept(doubleQuote))),
    ]).map(joinOnEmptyString),
    literal = choice([numericLiteral.map(parseInt), stringLiteral]),
    betweenBrackets = between(leftBracket)(rightBracket),
    computedMemberExpression = sequenceOf([identifier, atLeastOne(betweenBrackets(literal))]).map(flatten),
    staticMemberExpression = sequenceOf([identifier, atLeastOne(sequenceOf([char('.'), identifier]).map(last))]).map(
        flatten
    ),
    memberExpression = choice([computedMemberExpression, staticMemberExpression]);

const keypathExpression = choice([memberExpression, identifier.map((value: string) => [value])]);

export default keypathExpression;
