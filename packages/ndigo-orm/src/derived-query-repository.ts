/**
 * Convention-derived query method-name parsing (ORM completion plan,
 * Wave 4).
 *
 * Supported method-name patterns:
 * - `findBy<Property>(value)` — equality on a declared `@column`/`@primaryColumn`
 * - `findBy<Property>And<Property>(a, b, …)` — conjunction of equalities
 * - trailing `OrderBy<Property>[Asc|Desc]` — single sort clause
 * - trailing `First` / `Top<N>` — result limit
 *
 * Property names resolve case-insensitively against the entity's declared
 * columns. A declared property that itself contains a capitalized `And`
 * (e.g. `BandAndLoop`) still matches as a single property when the
 * split-based parse fails — preserving the legacy single-property fallback.
 *
 * The evaluation side lives in `InMemoryDerivedQueryRepository`
 * (repository.ts) and `DrizzleDerivedQueryRepository` (`@ndigo/orm-drizzle`).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ColumnDefinition } from './metadata';
import { SortOrder } from './page';

/**
 * The result of a derived query: always a list, since the method name decides
 * filtering, ordering and the optional `First`/`TopN` limit rather than the
 * return type.
 */
export type DerivedQueryResult<T> = T[];

/**
 * A parsed derived-query method name: equality filters plus optional
 * ordering (single clause) and limit (`First`/`TopN`).
 */
export interface DerivedQuery {
    filters: Array<{ property: string; valueIndex: number }>;
    orderBy?: SortOrder[];
    limit?: number;
}

const ORDER_BY_MARKER = 'OrderBy';

/**
 * Parses a derived method name into filters, ordering, and limit.
 *
 * @param methodName - The method name (e.g. `findByNameOrderByAgeDesc`).
 * @param columns - The entity's declared columns.
 * @returns The parsed query, or `null` if the method name is not a
 *   supported derived query.
 */
export function parseDerivedQuery(methodName: string, columns: ColumnDefinition[]): DerivedQuery | null {
    const props = columns.map((c) => c.fieldName);
    const matchProperty = (candidate: string): string | undefined =>
        props.find((p) => p.toLowerCase() === candidate.toLowerCase());

    const [head, ...rest] = methodName.split(ORDER_BY_MARKER);
    if (rest.length > 1) {
        return null;
    }

    let orderBy: SortOrder[] | undefined;
    if (rest.length === 1) {
        const orderPart = rest[0] ?? '';
        const property = orderPart.endsWith('Desc')
            ? orderPart.slice(0, -4)
            : orderPart.endsWith('Asc')
              ? orderPart.slice(0, -3)
              : orderPart;
        const prop = matchProperty(property);
        if (prop === undefined || property.length === 0) {
            return null;
        }
        orderBy = [{ property: prop, direction: orderPart.endsWith('Desc') ? 'desc' : 'asc' }];
    }

    let headRemaining = head ?? '';
    let limit: number | undefined;

    if (headRemaining.endsWith('First')) {
        limit = 1;
        headRemaining = headRemaining.slice(0, -'First'.length);
    } else {
        const top = /^(.+)Top(\d+)$/.exec(headRemaining);
        if (top) {
            const count = Number(top[2]);
            if (count < 1) {
                return null;
            }
            limit = count;
            headRemaining = top[1] ?? '';
        }
    }

    if (!headRemaining.startsWith('findBy') || headRemaining.length <= 'findBy'.length) {
        return null;
    }

    const bodies = headRemaining.slice('findBy'.length).split('And');
    const whole = matchProperty(bodies.join('And'));
    if (whole) {
        // Fallback: a declared property name itself contains 'And'.
        return { filters: [{ property: whole, valueIndex: 0 }], orderBy, limit };
    }

    const filters: Array<{ property: string; valueIndex: number }> = [];
    const length = bodies.length;
    for (let index = 0; index < length; index += 1) {
        const prop = matchProperty(bodies[index] ?? '');
        if (prop === undefined || bodies[index]?.length === 0) {
            return null;
        }
        filters.push({ property: prop, valueIndex: index });
    }

    return { filters, orderBy, limit };
}
