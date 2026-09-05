/**
 * @see {@link https://en.wikipedia.org/wiki/Glob_(programming)#Syntax}
 */

const DOT_LITERAL = '\\.',
    SLASH_LITERAL = '\\/',
    NOT_SLASH = '[^/]',
    ONE_CHARACTER = '(?=.)',
    STAR = `${NOT_SLASH}*?`, // [^/]*?
    START_ANCHOR = `(?:^|${SLASH_LITERAL})`,
    GLOB_STAR = `(?:(?:(?!${START_ANCHOR}${DOT_LITERAL}).)*?)`;
// = (?:(?:(?!(?:^|\/)\\.).)*?)

const URL_POSIX_CLASSES = {
    alnum: 'a-zA-Z0-9',
    alpha: 'a-zA-Z',
    digit: '0-9',
    lower: 'a-z',
    upper: 'A-Z',
    xdigit: 'A-Fa-f0-9',
    word: 'A-Za-z0-9_',
};

/**
 * Parses a URL/route glob pattern into an anchored regular-expression source string.
 *
 * Returns `null` if the pattern cannot be parsed.
 * The returned string is suitable for `new RegExp(result)`.
 *
 * @param pattern - The URL glob pattern to parse (e.g. `/api/*`, `**`, `[:alnum:]*`).
 * @returns An anchored regex source string, or `null` if the pattern is invalid.
 */
export function parseUrlGlob(pattern: string): string | null {
    if (typeof pattern !== 'string') {
        return null;
    }

    // Handle common patterns first
    const commonPatterns = [
        { pattern: '***', result: `${ONE_CHARACTER}${STAR}` },
        { pattern: '**/**/**', result: `${GLOB_STAR}` },
        { pattern: '**/**', result: `${GLOB_STAR}` },
        { pattern: '**/*.*', result: `(?:${GLOB_STAR}${SLASH_LITERAL})?${STAR}${DOT_LITERAL}${ONE_CHARACTER}${STAR}` },
        { pattern: '**/.*', result: `(?:${GLOB_STAR}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHARACTER}${STAR}` },
        { pattern: '**/*', result: `(?:${GLOB_STAR}${SLASH_LITERAL})?${ONE_CHARACTER}${STAR}` },
        { pattern: '**', result: `${GLOB_STAR}` },
        { pattern: '*/*', result: `${STAR}${SLASH_LITERAL}${ONE_CHARACTER}${STAR}` },
        { pattern: '*.*', result: `${STAR}${DOT_LITERAL}${ONE_CHARACTER}${STAR}` },
        { pattern: '.*', result: `${DOT_LITERAL}${ONE_CHARACTER}${STAR}` },
        { pattern: '*', result: `${ONE_CHARACTER}${STAR}` },
    ];

    for (const { pattern: commonPattern, result } of commonPatterns) {
        if (pattern === commonPattern) {
            return `^(?:${result}${SLASH_LITERAL}?)$`;
        }
    }

    // Parse the pattern character by character
    const ctx = {
        pattern,
        pos: 0,
    };

    try {
        let result = parseGlobFull(ctx);

        // If the pattern starts with globStar, prepend ONE_CHARACTER to ensure at least one character exists
        if (result.startsWith('(?:(?')) {
            result = ONE_CHARACTER + result;
        }

        return `^(?:${result})$`;
    } catch (e) {
        return null;
    }
}

interface ParseContext {
    readonly pattern: string;
    pos: number;
}

function parseGlobFull(ctx: ParseContext): string {
    let result = '';

    while (ctx.pos < ctx.pattern.length) {
        const token = parseToken(ctx);
        if (token === null) {
            // unrecognized character — treat as literal
            result += escapeForRegex(ctx.pattern[ctx.pos++]);
        } else {
            result += token;
        }
    }

    return result;
}

function parseToken(ctx: ParseContext): string | null {
    const char = ctx.pattern[ctx.pos];

    // extGlob: @(...), !(...), +(...), *(...), ?(...)
    // Only treat as extGlob when the operator is immediately followed by '('
    if (
        (char === '@' || char === '!' || char === '+' || char === '*' || char === '?') &&
        ctx.pattern[ctx.pos + 1] === '('
    ) {
        return parseExtGlob(ctx);
    }

    switch (char) {
        case '*':
            return parseStar(ctx);
        case '?':
            ctx.pos++;
            return NOT_SLASH;
        case '/':
            ctx.pos++;
            return SLASH_LITERAL;
        case '.':
            ctx.pos++;
            return DOT_LITERAL;
        case '{':
            ctx.pos++;
            return '\\{';
        case '}':
            ctx.pos++;
            return '\\}';
        case '[':
            // Try POSIX class first ([:name:]), fall back to charSet
            return tryParsePosixClass(ctx) ?? parseCharSet(ctx);
        default:
            return null; // Not a special character — caller passes through as literal
    }
}

/**
 * Tries to parse a POSIX character class `[:name:]` at the current position.
 * Returns the expanded character class string (e.g. `[0-9]`) on success, or
 * `null` (with `ctx.pos` unchanged) on failure.
 */
function tryParsePosixClass(ctx: ParseContext): string | null {
    const startPos = ctx.pos;

    // Must start with '[:'
    if (ctx.pattern[ctx.pos] !== '[' || ctx.pattern[ctx.pos + 1] !== ':') return null;
    ctx.pos += 2; // consume '[:'

    // Read the class name until ':]'
    let className = '';
    while (ctx.pos < ctx.pattern.length && !(ctx.pattern[ctx.pos] === ':' && ctx.pattern[ctx.pos + 1] === ']')) {
        className += ctx.pattern[ctx.pos++];
    }

    if (ctx.pos + 1 >= ctx.pattern.length) {
        // No closing ':]' found — not a POSIX class
        ctx.pos = startPos;
        return null;
    }

    ctx.pos += 2; // consume ':]'

    if (Object.prototype.hasOwnProperty.call(URL_POSIX_CLASSES, className)) {
        return `[${URL_POSIX_CLASSES[className as keyof typeof URL_POSIX_CLASSES]}]`;
    }

    // Unknown class name — backtrack
    ctx.pos = startPos;
    return null;
}

function parseStar(ctx: ParseContext): string {
    const startPos = ctx.pos;

    // Consume all consecutive stars
    while (ctx.pos < ctx.pattern.length && ctx.pattern[ctx.pos] === '*') {
        ctx.pos++;
    }

    const starCount = ctx.pos - startPos;

    if (starCount === 1) {
        return STAR; // Single star: [^/]*?
    } else if (starCount === 2) {
        return GLOB_STAR; // Double star: cross-segment glob star
    } else {
        // More than 2 stars - treat as multiple single stars
        return STAR.repeat(starCount);
    }
}

function parseCharSet(ctx: ParseContext): string {
    const startPos = ctx.pos;

    ctx.pos++; // consume '['

    let result = '[';

    // Check for negation patterns
    if (ctx.pos < ctx.pattern.length && ctx.pattern[ctx.pos] === '!') {
        result += '^';
        ctx.pos++;
    } else if (ctx.pos < ctx.pattern.length && ctx.pattern[ctx.pos] === '^') {
        // Handle literal ^ inside character set
        result += '\\^';
        ctx.pos++;
    }

    // Parse character set contents
    while (ctx.pos < ctx.pattern.length) {
        const char = ctx.pattern[ctx.pos];

        if (char === ']') {
            ctx.pos++; // consume ']'
            break;
        } else if (char === '[' && ctx.pos + 1 < ctx.pattern.length && ctx.pattern[ctx.pos + 1] === '[') {
            // Handle escaped '['
            result += '\\[';
            ctx.pos += 2; // consume both '[' characters
        } else if (
            char === '-' &&
            ctx.pos > startPos + 1 &&
            ctx.pos + 1 < ctx.pattern.length &&
            ctx.pattern[ctx.pos + 1] !== ']'
        ) {
            // Handle character ranges like a-z
            const prevChar = ctx.pattern[ctx.pos - 1];
            const nextChar = ctx.pattern[ctx.pos + 1];

            if (prevChar !== ']' && nextChar !== ']') {
                result += char;
                ctx.pos++;
            } else {
                // Not a valid range, treat as literal
                result += '\\-';
                ctx.pos++;
            }
        } else {
            result += char;
            ctx.pos++;
        }
    }

    result += ']';

    // Add optional slash suffix if at end of input
    if (ctx.pos >= ctx.pattern.length) {
        result += `${SLASH_LITERAL}?`;
    }

    return result;
}

/** Splits a string by top-level `|` characters, ignoring pipes inside nested `(...)`. */
function splitByTopLevelPipe(content: string): string[] {
    const parts: string[] = [];
    let depth = 0,
        start = 0;

    for (let i = 0; i < content.length; i++) {
        if (content[i] === '(') {
            depth++;
        } else if (content[i] === ')') {
            depth--;
        } else if (content[i] === '|' && depth === 0) {
            parts.push(content.slice(start, i));
            start = i + 1;
        }
    }

    parts.push(content.slice(start));
    return parts;
}

function parseExtGlob(ctx: ParseContext): string {
    const operator = ctx.pattern[ctx.pos];
    ctx.pos++; // consume operator

    if (ctx.pos < ctx.pattern.length && ctx.pattern[ctx.pos] === '(') {
        ctx.pos++; // consume '('

        // Parse the pattern inside parentheses
        let patternContent = '';
        let parenCount = 1;

        while (ctx.pos < ctx.pattern.length && parenCount > 0) {
            const char = ctx.pattern[ctx.pos];

            if (char === '(') {
                parenCount++;
            } else if (char === ')') {
                parenCount--;
                if (parenCount === 0) {
                    break;
                }
            }

            patternContent += char;
            ctx.pos++;
        }

        if (parenCount > 0) {
            // Unclosed parenthesis, treat as literal
            return `\\${operator}\\(`;
        }

        // Consume the closing ')'
        ctx.pos++;

        // Split by top-level '|' (not inside nested parens), parse each alternative,
        // then join with '|' to produce regex alternation
        const alternatives = splitByTopLevelPipe(patternContent);
        const innerPattern = alternatives.map((alt) => parseGlobFull({ pattern: alt, pos: 0 })).join('|');

        // Handle different extGlob operators
        switch (operator) {
            case '@':
                // Match exactly one of the alternatives
                return `(${innerPattern})`;
            case '!':
                // Negation - match anything but the pattern
                return `(?:(?!(?:${innerPattern})$)[^/]*?)`;
            case '+':
                // One or more
                return `(?:${innerPattern})+`;
            case '*':
                // Zero or more
                return `(?:${innerPattern})*`;
            case '?':
                // Zero or one
                return `(?:${innerPattern})?`;
            default:
                // Unknown operator, treat as literal
                return `\\${operator}\\(${innerPattern}\\)`;
        }
    } else {
        // Not followed by '(', treat as literal
        return `\\${operator}`;
    }
}

function escapeForRegex(char: string): string {
    switch (char) {
        case '.':
        case '/':
        case '*':
        case '+':
        case '?':
        case '^':
        case '$':
        case '(':
        case ')':
        case '[':
        case ']':
        case '{':
        case '}':
        case '|':
        case '\\':
            return `\\${char}`;
        default:
            return char;
    }
}
