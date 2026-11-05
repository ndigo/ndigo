/**
 * Reference-style profile expression grammar (`name`, `!`, `&`, `|`,
 * parentheses) — parsed, never eval'd. Re-homed from `@ndigo/context` with
 * the conditional-family profile unification (AD-83).
 *
 * @module ndigo-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError } from './error.js';

/** Maximum parentheses nesting depth (panic switch for pathological input). */
const MAX_DEPTH = 10;

/**
 * Token kinds for the profile expression grammar.
 */
type Token =
    | { type: 'name'; value: string }
    | { type: 'not' }
    | { type: 'and' }
    | { type: 'or' }
    | { type: 'lparen' }
    | { type: 'rparen' };

/**
 * Tokenizes a profile expression (`name`, `!`, `&`, `|`, `(`, `)`),
 * whitespace tolerated.
 *
 * @param expression - The expression string.
 * @returns The token stream.
 * @throws {IllegalStateError} On an unknown character.
 */
const tokenize = (expression: string): Token[] => {
    const tokens: Token[] = [];
    let index = 0;
    const length = expression.length;
    while (index < length) {
        const char = expression[index];
        if (char === ' ' || char === '\t' || char === '\n') {
            index++;
            continue;
        }
        if (char === '(') {
            tokens.push({ type: 'lparen' });
            index++;
            continue;
        }
        if (char === ')') {
            tokens.push({ type: 'rparen' });
            index++;
            continue;
        }
        if (char === '&') {
            tokens.push({ type: 'and' });
            index++;
            continue;
        }
        if (char === '|') {
            tokens.push({ type: 'or' });
            index++;
            continue;
        }
        if (char === '!') {
            tokens.push({ type: 'not' });
            index++;
            continue;
        }
        // Name: run of identifier chars ([a-zA-Z0-9_\-.]).
        const start = index;
        while (index < length && /[a-zA-Z0-9_.-]/.test(expression[index])) index++;
        if (index === start) {
            throw new IllegalStateError(`Invalid character in profile expression "${expression}" at position ${index}`);
        }
        tokens.push({ type: 'name', value: expression.slice(start, index) });
    }
    return tokens;
};

/**
 * Recursive-descent evaluator over the token stream.
 *
 * Grammar (precedence low→high): `or` < `and` < `not` < name/paren.
 */
class Parser {
    #tokens: Token[];
    #index = 0;
    #expression: string;
    #depth = 0;
    #active: ReadonlySet<string>;

    constructor(tokens: Token[], expression: string, active: ReadonlySet<string>) {
        this.#tokens = tokens;
        this.#expression = expression;
        this.#active = active;
    }

    parse(): boolean {
        if (this.#tokens.length === 0) {
            throw new IllegalStateError(`Empty profile expression "${this.#expression}"`);
        }
        const result = this.#or();
        if (!this.#eof()) {
            throw new IllegalStateError(`Unexpected token in profile expression "${this.#expression}"`);
        }
        return result;
    }

    #peek(): Token | undefined {
        return this.#tokens[this.#index];
    }

    #take(): Token {
        const token = this.#peek();
        if (!token) throw new IllegalStateError(`Unexpected end of profile expression "${this.#expression}"`);
        this.#index++;
        return token;
    }

    #eof(): boolean {
        return this.#index >= this.#tokens.length;
    }

    #or(): boolean {
        let value = this.#and();
        while (this.#peek()?.type === 'or') {
            this.#take();
            const rhs = this.#and();
            value = value || rhs;
        }
        return value;
    }

    #and(): boolean {
        let value = this.#unary();
        while (this.#peek()?.type === 'and') {
            this.#take();
            const rhs = this.#unary();
            value = value && rhs;
        }
        return value;
    }

    #unary(): boolean {
        const token = this.#peek();
        if (token?.type === 'not') {
            this.#take();
            return !this.#unary();
        }
        return this.#primary();
    }

    #primary(): boolean {
        const token = this.#take();
        if (token.type === 'name') {
            return this.#active.has(token.value);
        }
        if (token.type === 'lparen') {
            this.#depth++;
            if (this.#depth > MAX_DEPTH) {
                throw new IllegalStateError(
                    `Profile expression "${this.#expression}" exceeds maximum nesting depth of ${MAX_DEPTH}`
                );
            }
            const value = this.#or();
            const closing = this.#take();
            if (closing.type !== 'rparen') {
                throw new IllegalStateError(`Unbalanced parentheses in profile expression "${this.#expression}"`);
            }
            this.#depth--;
            return value;
        }
        if (token.type === 'rparen') {
            throw new IllegalStateError(`Unbalanced parentheses in profile expression "${this.#expression}"`);
        }
        throw new IllegalStateError(`Unexpected "${token.type}" in profile expression "${this.#expression}"`);
    }
}

/**
 * Evaluates a profile expression against the active profile set.
 *
 * Grammar (the `Profiles` grammar, since 6.1): `name` | `!expr` | `expr & expr` |
 * `expr | expr` | `( expr )`; `&` binds tighter than `|`. Expressions are
 * **parsed, never eval'd** (no eval-family; P0 D8). Malformed expressions and
 * runaway nesting throw `IllegalStateError` naming the expression (fail-loud —
 * a silently-never-matching typo would ship as a missing feature).
 *
 * @param expression - The expression to evaluate.
 * @param active - The active (effective) profile set.
 * @returns `true` when the expression matches.
 * @throws {IllegalStateError} On malformed expressions or excessive nesting.
 *
 * @example
 * ```ts
 * evaluateProfileExpression('prod', new Set(['prod']))          // true
 * evaluateProfileExpression('!dev & (test | prod)', new Set(['test'])) // true
 * ```
 */
export function evaluateProfileExpression(expression: string, active: ReadonlySet<string>): boolean {
    const tokens = tokenize(expression);
    return new Parser(tokens, expression, active).parse();
}
