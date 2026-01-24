/**
 * @author Jeff Rose
 * @see {@link https://en.wikipedia.org/wiki/Glob_(programming)#Syntax}
 */
// @ts-ignore
import { anyCharExcept, char, choice, digits, endOfInput, letter, letters, many, many1, possibly, sepBy, sequenceOf, str } from 'arcsecond';
import { compose, cond, equals, join, joinOnEmptyString, map, identity, T, prop } from './_util';
import { asterisk, bindRegExp, exclamationPoint, leftBracket, rightBracket } from './_parser';

const
    dotLiteral = '\\.',
    slashLiteral = '\\/',

    notSlash = '[^/]',
    oneCharacter = '(?=.)',
    star = `${ notSlash }*?`,
    notDot = `(?!${ dotLiteral })`,
    startAnchor = `(?:^|${ slashLiteral })`,
    globStar = `(?:(?:(?!${ startAnchor }${ dotLiteral }).)*?)`,

    escapeValue = ( value: string ) => `\\${ value }`,
    groupValue = ( value: string ) => `(?:${ value })`,

    joinOnSlash = join( '/' ),
    toRegExp = compose( bindRegExp, groupValue ),
    toGlob = compose( ( value ) => `${ value }${ slashLiteral }?`, joinOnEmptyString ),

    // Reused character parsers
    hyphen = char( '-' ),
    slash = char( '/' ),
    questionMark = char( '?' ),

    punctuation = choice( map( char, '-!"#$%&\'()+,/:;<=>@^_`{|}~'.split( '' ) ) ),

    commonPatterns = sequenceOf( [
        choice( [
            str( '***' )      .map( () => `${ notDot }${ oneCharacter }${ star }` ),
            str( '**/**/**' ) .map( () => `${ notDot }${ globStar }` ),
            str( '**/**' )    .map( () => `${ notDot }${ globStar }` ),
            str( '**/*.*' )   .map( () => `(?:${ notDot }${ globStar }${ slashLiteral })?${ notDot }${ star }${ dotLiteral }${ oneCharacter }${ star }` ),
            str( '**/.*' )    .map( () => `(?:${ notDot }${ globStar }${ slashLiteral })?${ dotLiteral }${ oneCharacter }${ star }` ),
            str( '**/*' )     .map( () => `(?:${ notDot }${ globStar }${ slashLiteral })?${ notDot }${ oneCharacter }${ star }` ),
            str( '**' )       .map( () => `${ notDot }${ globStar }` ),
            str( '*/*' )      .map( () => `${ notDot }${ star }${ slashLiteral }${ oneCharacter }${ notDot }${ star }` ),
            str( '*.*' )      .map( () => `${ notDot }${ star }${ dotLiteral }${ oneCharacter }${ star }` ),
            str( '.*' )       .map( () => `${ dotLiteral }${ oneCharacter }${ star }` ),
            asterisk          .map( () => `${ notDot }${ oneCharacter }${ star }` )
        ] ),
        endOfInput
    ] ).map( toGlob ),

    // a-z, A-Z
    letterRange = sequenceOf( [ letter, hyphen, letter ] ).map( joinOnEmptyString ),
    // 1-10, 01-05
    digitRange = sequenceOf( [ digits, hyphen, digits ] ).map( joinOnEmptyString ),
    // [!, [^, [], [
    charSetOpen = choice( [
       sequenceOf( [ leftBracket, exclamationPoint.map( () => '^' ), possibly( rightBracket.map( escapeValue ) ) ] ).map( joinOnEmptyString ),
       sequenceOf( [ leftBracket, char( '^' ).map( escapeValue ) ] ).map( joinOnEmptyString ),
       sequenceOf( [ leftBracket, rightBracket.map( escapeValue ) ] ).map( joinOnEmptyString ),
       leftBracket
    ] ),
    charSet = sequenceOf( [
        charSetOpen,
        many( choice( [
            digitRange,
            letterRange,
            anyCharExcept( rightBracket ).map( cond( [
                [ equals( '[' ), escapeValue ],
                [ T, identity ]
            ] ) )
        ] ) ).map( joinOnEmptyString ),
        rightBracket,
        possibly( endOfInput.map( () => `${ slashLiteral }?` ) )
    ] ).map( joinOnEmptyString ),
    slashSeparated = sepBy( slash ),

    globPattern = many1( choice( [
        charSet,
        letters,
        digits,
        str( '\\*' ),
        many1( asterisk ).map( compose( cond( [
            [ equals( 2 ), () => globStar ],
            [ T, () => star ]
        ] ), prop( 'length' ) ) ),
        questionMark.map( () => notSlash ),
        leftBracket.map( escapeValue ),
        slash.map( escapeValue ),
        char( '.' ).map( escapeValue ),
        punctuation
    ] ) ).map( joinOnEmptyString ),

    globPatternList = slashSeparated( globPattern ).map( ( value ) => {
        let joined = joinOnSlash( value );
        if( joined.startsWith( '(?:(?' ) ){
            joined = oneCharacter + joined;
        }
        return joined;
    } ),

    glob = choice( [
        commonPatterns,
        globPatternList
    ] ).map( toRegExp );

export default glob;
