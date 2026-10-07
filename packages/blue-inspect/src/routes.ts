/**
 * @module blue-inspect
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Route enumeration for the inspect manifest — reads a `RouteRegistry`,
 * `RouteDefinition`s, or explicit descriptors into sorted
 * {@link InspectRoute} rows.
 */

import { deriveKey } from '@blue/router';
import type { RouteDefinition, RouteRegistry } from '@blue/router';
import type { InspectRoute, RouteSource } from './types';

/**
 * Whether a value is a `RouteRegistry` (the class exposes `entries()` and
 * `get()`, unlike a plain array which has only `entries()`).
 */
function isRouteRegistry(value: RouteSource): value is RouteRegistry {
    const candidate = value as { entries?: unknown; get?: unknown };
    return typeof candidate.entries === 'function' && typeof candidate.get === 'function';
}

/**
 * Normalize one route source item into an {@link InspectRoute}. Explicit
 * descriptors pass through; `RouteDefinition`s use their pattern as both the
 * key and the path.
 */
function toInspectRoute(item: RouteDefinition | InspectRoute): InspectRoute {
    const explicit = item as Partial<InspectRoute>;
    if (typeof explicit.name === 'string' && typeof explicit.path === 'string') {
        return explicit.partition === undefined
            ? { name: explicit.name, path: explicit.path }
            : { name: explicit.name, path: explicit.path, partition: explicit.partition };
    }
    const { pattern } = item as RouteDefinition;
    return { name: deriveKey(pattern), path: pattern };
}

/**
 * Enumerate the routes a source declares.
 *
 * A `RouteRegistry` contributes its dotted child keys as names; an iterable of
 * `RouteDefinition`s or explicit descriptors contributes one row each. The
 * result is de-duplicated and sorted by name, then path, so the manifest is
 * deterministic regardless of registration order.
 *
 * @param source - The route source, or `undefined` for no routes.
 * @returns The sorted route rows.
 */
export function collectRoutes(source?: RouteSource): InspectRoute[] {
    if (source === undefined) return [];

    const rows = new Map<string, InspectRoute>();
    if (isRouteRegistry(source)) {
        for (const [name, definition] of source.entries()) {
            rows.set(`${name}\u0000${definition.pattern}`, { name, path: definition.pattern });
        }
    } else {
        for (const item of source) {
            const route = toInspectRoute(item);
            rows.set(`${route.name}\u0000${route.path}`, route);
        }
    }

    return [...rows.values()].sort((a, b) =>
        a.name === b.name ? (a.path < b.path ? -1 : a.path > b.path ? 1 : 0) : a.name < b.name ? -1 : 1
    );
}
