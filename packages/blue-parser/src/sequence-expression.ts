/**
 * @author Jeff Rose
 * @see {@link https://github.com/francisrstokes/arcsecond}
 * @see {@link https://hackernoon.com/arcsecond-parsing-in-javascript-made-easy-af1894bdcec9}
 */
// @ts-ignore
import {
    anyCharExcept,
    char,
    choice,
    digit,
    digits,
    endOfInput,
    exactly,
    letters,
    lookAhead,
    possibly,
    sequenceOf,
    str,
} from 'arcsecond';
import { joinOnEmptyString, length, map, pipe, rangeN, defaultTo } from './_util';
import noop from './no-op';
import { atLeastOne, optional, plusSign } from './_parser';

type SequencePoint = [string, number, string];

const dots = '..',
    startsWithPlusOrMinus = /^([+-])/,
    { abs, max } = Math,
    defaultToEmptyList = defaultTo([]),
    emptyResults = noop.map(defaultToEmptyList),
    exactlyOrEmpty = (length, parser) => (length ? exactly(length)(parser) : emptyResults),
    determineZeroCount = ([parsedZeroes, nextToken]: [string[], string]) => {
        const length = parsedZeroes.length;
        return length && Number.isNaN(parseInt(nextToken))
            ? exactlyOrEmpty(length - 1, zero)
            : exactlyOrEmpty(length, zero);
    },
    numericPad =
        (padding: number) =>
        (value: number): string => {
            let text = String(value),
                sign: string;
            const signed = startsWithPlusOrMinus.exec(text);
            if (signed) {
                sign = signed[0];
                text = text.slice(1);
            } else {
                sign = '';
            }
            return `${sign}${text.padStart(padding - sign.length, '0')}`;
        },
    parseStep = ([sign, step]) => parseInt(step) || 1,
    positiveOrNegativeOne = (a: number, b: number): number => (a > b ? -1 : 1),
    // @ts-ignore
    range = (a: number, b: number, step: number) => rangeN(step, a, b + positiveOrNegativeOne(a, b)),
    singleStep = ['..', 1],
    toArray = ([[startSign, startPadding, startValue], op1, [endSign, endPadding, endValue], [op2, step]]: [
        SequencePoint,
        string,
        SequencePoint,
        [string, number],
    ]) => {
        const startLength = startValue.length,
            endLength = endValue.length;
        let a: number, b: number, mapper: (value) => string;

        if (!startSign && !startPadding && startLength === 1 && !endSign && !endPadding && endLength === 1) {
            a = startValue.codePointAt(0);
            b = endValue.codePointAt(0);
            mapper = String.fromCodePoint;
        } else {
            a = Number(`${startSign}${startValue}`);
            b = Number(`${endSign}${endValue}`);

            if (startPadding || endPadding) {
                const padding = abs(
                    max(startPadding + startLength + startSign.length, endPadding + endLength + endSign.length)
                );
                mapper = numericPad(padding);
            } else {
                mapper = String;
            }
        }

        return map(mapper, range(a, b, step));
    },
    toSequencePoint = (value): SequencePoint => ['', 0, value],
    optionalSign = possibly(choice([char('-'), plusSign])).map(defaultTo('')),
    sequenceOperator = str(dots).errorMap(({ index }) => `ParseError (position ${index}): Expecting '${dots}'`),
    zero = char('0'),
    zeroes = optional(zero),
    nonDigits = atLeastOne(anyCharExcept(digit)).map(pipe(defaultToEmptyList, joinOnEmptyString)),
    optionalZeroes = possibly(
        lookAhead(sequenceOf([zeroes, choice([digits, endOfInput, nonDigits])]))
            // Based on the results of lookAhead(), chain a parser to get the correct number of zeroes
            .chain(determineZeroCount)
            // Return the number of zeroes parsed
            .map(length)
    ),
    paddedDigits = sequenceOf([optionalSign, optionalZeroes, digits]),
    sequencePoint = choice([paddedDigits, letters.map(toSequencePoint)]).errorMap(
        ({ index }) =>
            `ParseError (position ${index}): Expecting a sequence point, which can be a digit, with optional padding, or letter`
    ),
    sequenceStep = sequenceOf([optionalSign, digits]).map(parseStep),
    optionalStepSuffix = possibly(sequenceOf([sequenceOperator, sequenceStep])).map(defaultTo(singleStep)),
    sequenceExpression = sequenceOf([sequencePoint, sequenceOperator, sequencePoint, optionalStepSuffix]).map(toArray);

export default sequenceExpression;
