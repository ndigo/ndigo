/**
 * Pagination and sorting contracts for repositories (ORM completion plan,
 * Wave 2): 1-based page requests, multi-key sort orders, and stable page
 * math shared by every backend.
 */
import { chainComparisons, compareBy, type comparison, invertComparison } from '@ndigo/core';

export type SortDirection = 'asc' | 'desc';

/** A single sort clause: an entity field name plus a direction (default `asc`). *
 * @example
 * ```ts
 * const sort: SortOrder = { property: 'name', direction: 'asc' };
 * ```
 */
export interface SortOrder {
    /** The entity field to sort by. */
    property: string;
    /** Sort direction; defaults to `asc`. */
    direction?: SortDirection;
}

/** A page request: 1-based page index, positive size, optional multi-key sort. *
 * @example
 * ```ts
 * const req: PageRequest = { page: 1, size: 10 };
 * ```
 */
export interface PageRequest {
    /** 1-based page index. */
    page: number;
    /** Positive page size. */
    size: number;
    /** Multi-key sort clauses. */
    sort?: SortOrder[];
}

/** A page of results with its totals. Pages beyond the last one yield empty content. *
 * @example
 * ```ts
 * const page: Page<User> = { content: [user], totalElements: 1, totalPages: 1, number: 0, size: 10 };
 * ```
 */
export interface Page<T> {
    /** The page content. */
    content: T[];
    /** The 1-based page index. */
    page: number;
    /** The page size. */
    size: number;
    /** Total matching elements. */
    totalElements: number;
    /** Total page count. */
    totalPages: number;
}

/**
 * Validates a page request: positive integer page/size, legal sort
 * directions, and sort properties restricted to an allowlist (entity column
 * field names) so backends can interpolate them safely into SQL.
 *
 * @param request - The request to validate.
 * @param allowedProperties - The entity field names sort properties may name.
 *
 * @example
 * ```ts
 * validatePageRequest({ page: 1, size: 20, sort: [{ property: 'name' }] }, new Set(['name']));
 * ```
 */
export function validatePageRequest(request: PageRequest, allowedProperties: Set<string>): void {
    if (!Number.isInteger(request.page) || request.page < 1) {
        throw new Error(`PageRequest: page must be a positive integer, got ${request.page}`);
    }
    if (!Number.isInteger(request.size) || request.size < 1) {
        throw new Error(`PageRequest: size must be a positive integer, got ${request.size}`);
    }
    for (const sort of request.sort ?? []) {
        const direction = sort.direction ?? 'asc';
        if (direction !== 'asc' && direction !== 'desc') {
            throw new Error(`PageRequest: sort direction must be 'asc' or 'desc', got ${direction}`);
        }
        if (!allowedProperties.has(sort.property)) {
            throw new Error(`PageRequest: unknown sort property "${sort.property}"`);
        }
    }
}

/**
 * Sorts and slices a full result set into a page (in-memory backends).
 * Multi-key sort is stable per clause; ties keep their input order.
 *
 * @param all - The full result set.
 * @param request - The page request.
 * @param allowedProperties - The entity field names sort properties may name.
 * @returns The requested page and totals.
 *
 * @example
 * ```ts
 * const page = pageFromAll(users, { page: 1, size: 10 }, new Set(['name']));
 * console.log(page.content, page.totalPages);
 * ```
 */
export function pageFromAll<T>(all: T[], request: PageRequest, allowedProperties: Set<string>): Page<T> {
    validatePageRequest(request, allowedProperties);

    const sorted = [...all].sort(sortComparator(request.sort ?? []));
    const from = (request.page - 1) * request.size;

    return {
        content: sorted.slice(from, from + request.size),
        page: request.page,
        size: request.size,
        totalElements: all.length,
        totalPages: Math.ceil(all.length / request.size),
    };
}

/**
 * Builds a multi-key comparator for the given sort clauses. Clauses apply
 * in order; ties keep their input order. Used by `pageFromAll` and the
 * derived-query repositories.
 *
 * @param sort - The sort clauses.
 * @returns The comparator.
 *
 * @example
 * ```ts
 * const cmp = sortComparator([{ property: 'name', direction: 'asc' }]);
 * users.sort(cmp);
 * ```
 */
export function sortComparator<T>(sort: SortOrder[]): (left: T, right: T) => number {
    return chainComparisons(
        ...sort.map((clause) =>
            compareBy(
                (value: T) => (value as Record<string, unknown>)[clause.property],
                (clause.direction ?? 'asc') === 'asc' ? nullsFirst : nullsLast
            )
        )
    );
}

/**
 * Orders nullish values before every present value, then applies natural
 * ordering. `null` and `undefined` both report first — the historical
 * comparison, preserved verbatim so this stays a pure refactor rather than
 * silently adopting `naturalComparison`'s different null placement.
 */
const nullsFirst: comparison<unknown> = (left, right) => {
    if (left === right) {
        return 0;
    }
    if (left === undefined || left === null) {
        return -1;
    }
    if (right === undefined || right === null) {
        return 1;
    }
    return left < right ? -1 : left > right ? 1 : 0;
};

/** `nullsFirst` reversed: nullish values sort last. */
const nullsLast = invertComparison(nullsFirst);
