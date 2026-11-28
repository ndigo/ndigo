/**
 * Path pattern characters shared by the glob matchers.
 */
export const DOT = '.',
    SLASH = '/',
    STAR = '*',
    GLOBSTAR = `${STAR}${STAR}`,
    DOT_STAR = `${DOT}${STAR}`,
    SLASH_STAR = `${SLASH}${STAR}`,
    SLASH_GLOBSTAR = `${SLASH}${GLOBSTAR}`;
