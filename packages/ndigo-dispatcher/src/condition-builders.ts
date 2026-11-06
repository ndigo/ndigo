/**
 * Typed route-condition builders (AD-34 D6).
 *
 * Mapping conditions (`queryParams: 'filter=all'`, `matrixParams: 'color'`)
 * are canonical expression strings — they deserialize from JSON mapping
 * tables and drive the registry's merge/compare ordering, so the string form
 * stays. These builders produce those canonical strings with the parser as
 * the validator: every built expression round-trips through the real
 * `AbstractNameValueExpression` grammar (name/value/negation verified) with
 * names and values scanned for the grammar characters, so a name containing
 * `=` or ending with `!` — or a value containing `=` / `!` — fails at build
 * time instead of silently changing meaning.
 *
 * ```ts
 * @requestMapping({ value: '/items/:id', queryParams: queryParamCondition('filter', 'all') })
 * @requestMapping({ value: '/x', queryParams: queryParamCondition('flag', undefined, { negate: true }) })
 * ```
 */
import { IllegalStateError } from '@ndigo/core';
import { QueryParamExpression } from './query-param-condition';
import { MatrixParamExpression } from './matrix-param-condition';

/**
 * Options shared by the condition builders.
 */
export interface ConditionBuilderOptions {
    /**
     * Negate the expression (`name!=value` / `!name`). Defaults to `false`.
     */
    negate?: boolean;
}

/**
 * Round-trip validation: build the canonical string, then require the real
 * parser to recover exactly the requested name, value and negation. Any
 * drift — a name containing `=` or ending with `!`, or a value containing
 * the `=`/`!` characters — throws instead of silently changing meaning.
 */
function buildCondition(
    kind: 'query' | 'matrix',
    name: string,
    value: string | undefined,
    options: ConditionBuilderOptions = {}
): string {
    const negate = options.negate === true;
    const canonical = value === undefined ? `${negate ? '!' : ''}${name}` : `${name}${negate ? '!' : ''}=${value}`;

    const parsed = kind === 'query' ? new QueryParamExpression(canonical) : new MatrixParamExpression(canonical);
    const valueHasGrammarCharacter = typeof value === 'string' && (value.includes('=') || value.includes('!'));
    if (parsed.name !== name || parsed.isNegated !== negate || parsed.value !== value || valueHasGrammarCharacter) {
        throw new IllegalStateError(
            `Cannot build ${kind}-param condition from name ${JSON.stringify(name)} value ${JSON.stringify(value)}: ` +
                'names must not contain "=" or end with "!", and values must not contain the = or ! characters'
        );
    }
    return canonical;
}

/**
 * Builds a query-parameter condition expression (`?filter=all` →
 * `'filter=all'`; presence check when `value` is omitted → `'flag'`;
 * negation → `'!flag'` / `'flag!=x'`).
 */
export function queryParamCondition(name: string, value?: string, options?: ConditionBuilderOptions): string {
    return buildCondition('query', name, value, options);
}

/**
 * Builds a matrix-parameter condition expression (`/path;color=red` →
 * `'color=red'`; presence check when `value` is omitted → `'color'`;
 * negation → `'!color'` / `'color!=x'`).
 */
export function matrixParamCondition(name: string, value?: string, options?: ConditionBuilderOptions): string {
    return buildCondition('matrix', name, value, options);
}
