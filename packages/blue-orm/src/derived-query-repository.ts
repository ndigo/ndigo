/** @author Jeff Rose */

import { ColumnDefinition } from './metadata';

/**
 * Spring Data-style derived-query method-name parsing for in-memory
 * repositories.
 *
 * Supported method-name patterns:
 * - `findBy<Property>(value)` — equality on a declared `@column`/`@primaryColumn`
 * - `findBy<Property>And<Property>(a, b)` — conjunction of two equalities
 *
 * Property names resolve case-insensitively against the entity's declared
 * columns.
 *
 * The evaluation side lives in `InMemoryDerivedQueryRepository` (repository.ts).
 *
 * @since 1.0.0
 */
export type DerivedQueryResult<T> = T[];

const findByPattern = /^findBy([A-Z][A-Za-z0-9]*)$/;
const findByAndPattern = /^findBy([A-Z][A-Za-z0-9]*)And([A-Z][A-Za-z0-9]*)$/;

/**
 * Parses a derived method name into a list of property filters.
 *
 * @param methodName - The method name (e.g. `findByName`).
 * @param columns - The entity's declared columns.
 * @returns A list of `{ property, valueIndex }` filters, or `null` if the
 *   method name is not a supported derived query.
 */
export function parseDerivedQuery(
    methodName: string,
    columns: ColumnDefinition[]
): Array<{ property: string; valueIndex: number }> | null {
    const props = columns.map((c) => c.fieldName);

    const matches = (candidate: string): string | undefined =>
        props.find((p) => p.toLowerCase() === candidate.toLowerCase());

    // Check the AND form FIRST — the single-property regex also matches
    // `findByNameAndId` (as a single group `NameAndId`), which would shadow
    // the conjunction form.
    const and = methodName.match(findByAndPattern);
    if (and) {
        const p1 = matches(and[1] ?? '');
        const p2 = matches(and[2] ?? '');
        return p1 && p2
            ? [
                  { property: p1, valueIndex: 0 },
                  { property: p2, valueIndex: 1 },
              ]
            : null;
    }

    const single = methodName.match(findByPattern);
    if (single) {
        const prop = matches(single[1] ?? '');
        return prop ? [{ property: prop, valueIndex: 0 }] : null;
    }

    return null;
}
