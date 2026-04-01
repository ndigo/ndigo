/**
 * @author Jeff Rose
 */
// @ts-ignore
import {
    between,
    char,
    choice,
    digits,
    endOfInput,
    letters,
    possibly,
    recursiveParser,
    sepBy,
    sequenceOf,
} from 'arcsecond';
import { cond, either, equals, join, joinOnEmptyString, map, T, identity } from './_util';
import { asterisk, atLeastOne, exclamationPoint, plusSign } from './_parser';

const dotLiteral = '\\.',
    slashLiteral = '\\/',
    notSlash = '[^/]',
    star = `${notSlash}*?`,
    startAnchor = `(?:^|${slashLiteral})`,
    globStar = `(?:(?:(?!${startAnchor}${dotLiteral}).)*?)`,
    escapeValue = (value: string) => `\\${value}`,
    groupValue = (value: string) => `(?:${value})`,
    //bindValue = ( value: string ) => `^${ value }$`,

    punctuation = choice(map(char, '\\-!"#$%&\'(+,./:;<=>?@[]^_`{|}~'.split(''))),
    equalsAtOrNull = either(equals('@'), equals(null)),
    joinOnPipe = join('|'),
    //toRegex = compose( newRegex, bindValue, groupValue ),

    mapExtGlob = ([[operator, patternList], eos]: [[string, string[]], boolean]): string => {
        const patterns = joinOnPipe(patternList);
        let extGlobStar = star;

        if (patterns.length > 1 && patterns.indexOf('/') !== -1 && patterns.indexOf(star) === -1) {
            extGlobStar = globStar;
        }

        const negationPrefix = '(?:(?!(?:',
            negationSuffix = `)$))${extGlobStar}`;
        return cond([
            [equalsAtOrNull, () => `(${patterns})`],
            [equals('!'), () => `${negationPrefix}${patterns}${negationSuffix}`],
            [T, (operator: string) => `${groupValue(patterns)}${operator}`],
        ])(operator);
    },
    // Reused character parsers
    leftParenthesis = char('('),
    rightParenthesis = char(')'),
    questionMark = char('?'),
    betweenParentheses = between(leftParenthesis)(rightParenthesis),
    pipeSeparated = sepBy(char('|')),
    extGlobPattern = recursiveParser(() =>
        atLeastOne(
            choice([
                extGlob,
                letters,
                digits,
                asterisk.map(() => star),
                questionMark.map(() => notSlash),
                punctuation.map(
                    cond([
                        [equals('.'), escapeValue],
                        [T, identity],
                    ])
                ),
            ])
        ).map(joinOnEmptyString)
    ),
    extGlobPatternList = betweenParentheses(pipeSeparated(extGlobPattern)),
    extGlobSequence = (value) => [possibly(value), extGlobPatternList] as any,
    onlyOne = sequenceOf(extGlobSequence(char('@'))),
    zeroOrMore = sequenceOf(extGlobSequence(asterisk)),
    oneOrMore = sequenceOf(extGlobSequence(plusSign)),
    zeroOrOne = sequenceOf(extGlobSequence(questionMark)),
    anythingBut = sequenceOf(extGlobSequence(exclamationPoint)),
    extGlob = sequenceOf([
        choice([anythingBut, onlyOne, oneOrMore, zeroOrMore, zeroOrOne]),
        possibly(endOfInput.map(T)),
    ]).map(mapExtGlob as any);

/** Parses extended glob syntax into a regular-expression source string. */
export default extGlob;
