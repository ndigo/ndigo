/**
 * Typed profile-expression builder (AD-34 D5; re-homed into `@ndigo/core`
 * with the conditional-family profile unification — AD-83).
 *
 * The profile grammar (`dev`, `!ci`, `a & b`, `(a | b) & c`) stays the
 * canonical, serializable form (`@whenProfile`, env-driven activation,
 * metadata), but in-code profile gates get compile-time composition instead
 * of string surgery. Every builder validates through the existing grammar at
 * build time and produces a canonical expression string, parenthesizing
 * compound children when the grammar's precedence would change the meaning:
 *
 * ```ts
 * Profile.and('dev', Profile.not('ci'))        // 'dev & !ci'
 * Profile.and(Profile.or('dev', 'ci'), 'ops') // '(dev | ci) & ops'
 * ```
 *
 * Terms compose and can be passed anywhere a profile expression string is
 * accepted (`@whenProfile(...)`, `environment.acceptsProfiles(...)`).
 */
import { IllegalStateError } from './error.js';
import { evaluateProfileExpression } from './profile-expression.js';

/**
 * The precedence-role a composed term plays in the grammar (loose → tight):
 * names and raw strings are treated as loose compounds when they contain
 * operator characters, so they parenthesize safely under every context.
 */
export type TermKind = 'name' | 'not' | 'and' | 'or' | 'compound';

const namePattern = /^[a-zA-Z0-9_.:-]+$/u;

/**
 * A composed profile expression. Immutable; `String(term)` yields the
 * canonical expression string, so terms drop into `@whenProfile(...)` and
 * `acceptsProfiles(...)` seamlessly.
 */
export class ProfileTerm {
    readonly #source: string;
    readonly #kind: TermKind;

    constructor(source: string, kind: TermKind) {
        this.#source = source;
        this.#kind = kind;
    }

    /**
     * The canonical expression string, e.g. `'dev & !ci'`.
     */
    toString(): string {
        return this.#source;
    }

    get kind(): TermKind {
        return this.#kind;
    }
}

/**
 * Accepts either a raw expression string or a composed term.
 */
export type ProfileExpressionInput = string | ProfileTerm;

const asTerm = (value: ProfileExpressionInput): ProfileTerm => {
    if (value instanceof ProfileTerm) {
        return value;
    }
    // Validation through the existing grammar: malformed input throws here,
    // at build time, instead of at profile activation.
    validateProfileExpression(value);
    const kind: TermKind = namePattern.test(value) ? 'name' : 'compound';
    return new ProfileTerm(value.trim(), kind);
};

/**
 * Validates a profile expression against the existing grammar.
 *
 * @param expression - The expression to validate.
 * @returns The trimmed expression (canonical form).
 * @throws On malformed expressions.
 */
export function validateProfileExpression(expression: string): string {
    const trimmed = expression.trim();
    evaluateProfileExpression(trimmed, new Set());
    return trimmed;
}

const wrapIf = (term: ProfileTerm, wrap: boolean): string => (wrap ? `(${term})` : String(term));

/**
 * Profiles that are all active (`a & b & …`). Compound children with a
 * looser precedence than `&` parenthesize: `and(or('a', 'b'), 'c')` →
 * `'(a | b) & c'`.
 */
export function and(...terms: ProfileExpressionInput[]): ProfileTerm {
    if (terms.length === 0) {
        throw new IllegalStateError('Profile.and requires at least one term');
    }
    const parts = terms.map((value) => {
        const term = asTerm(value);
        return wrapIf(term, term.kind === 'or' || term.kind === 'compound');
    });
    return new ProfileTerm(parts.join(' & '), 'and');
}

/**
 * Profiles where any is active (`a | b | …`). `&`/`!` bind tighter, so no
 * parenthesization is needed; raw compound strings stay wrapped for safety.
 */
export function or(...terms: ProfileExpressionInput[]): ProfileTerm {
    if (terms.length === 0) {
        throw new IllegalStateError('Profile.or requires at least one term');
    }
    const parts = terms.map((value) => {
        const term = asTerm(value);
        return wrapIf(term, term.kind === 'compound');
    });
    return new ProfileTerm(parts.join(' | '), 'or');
}

/**
 * Negates a profile (`!a`, `!(a & b)` — compound children parenthesize).
 */
export function not(term: ProfileExpressionInput): ProfileTerm {
    const inner = asTerm(term);
    const text = inner.kind === 'name' ? `!${inner}` : `!(${inner})`;
    return new ProfileTerm(text, 'not');
}

/**
 * The builder entry point — compose or validate profile expressions.
 */
export const Profile = Object.freeze({
    and,
    or,
    not,
    parse: validateProfileExpression,
});
