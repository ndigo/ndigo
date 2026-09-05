/**
 * @author Jeff Rose
 */

export type constraint = (value: any, params: any) => boolean;

const characterClass = (value: string) => `[${value}]`,
    oneOrMore = (value: string) => `${characterClass(value)}+`,
    only = (value: string) => `^${oneOrMore(value)}$`,
    LOWERCASE_ALPHA_PATTERN = 'a-z',
    ALPHA_PATTERN = `A-Z${LOWERCASE_ALPHA_PATTERN}`,
    NUMERIC_PATTERN = '0-9',
    ALPHA_NUMERIC_PATTERN = `${ALPHA_PATTERN}${NUMERIC_PATTERN}`,
    ALPHA_NUMERIC_PLUS_PATTERN = `${ALPHA_NUMERIC_PATTERN}.#&$\/,:'\- `,
    BOOLEAN_PATTERN = `(true|false)`,
    CITY_PATTERN = `${ALPHA_NUMERIC_PATTERN}. ',\-`,
    INTEGER_PATTERN = `-?${NUMERIC_PATTERN}`,
    WHITE_SPACES = characterClass(
        [
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
        ].join('')
    );
