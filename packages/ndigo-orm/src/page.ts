/**
 * Pagination and sorting contracts for repositories (ORM completion plan,
 * Wave 2): 1-based page requests, multi-key sort orders, and stable page
 * math shared by every backend.
 */

export type SortDirection = 'asc' | 'desc';

/** A single sort clause: an entity field name plus a direction (default `asc`). */
export interface SortOrder {
    property: string;
    direction?: SortDirection;
}

/** A page request: 1-based page index, positive size, optional multi-key sort. */
export interface PageRequest {
    page: number;
    size: number;
    sort?: SortOrder[];
}

/** A page of results with its totals. Pages beyond the last one yield empty content. */
export interface Page<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

/**
 * Validates a page request: positive integer page/size, legal sort
 * directions, and sort properties restricted to an allowlist (entity column
 * field names) so backends can interpolate them safely into SQL.
 *
 * @param request - The request to validate.
 * @param allowedProperties - The entity field names sort properties may name.
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
 */
export function sortComparator<T>(sort: SortOrder[]): (left: T, right: T) => number {
    return (left, right) => {
        for (const clause of sort) {
            const leftValue = (left as Record<string, unknown>)[clause.property];
            const rightValue = (right as Record<string, unknown>)[clause.property];
            const compared = compareValues(leftValue, rightValue);
            if (compared !== 0) {
                return (clause.direction ?? 'asc') === 'asc' ? compared : -compared;
            }
        }
        return 0;
    };
}

function compareValues(left: unknown, right: unknown): number {
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
}
