/**
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Route enumeration for the inspect manifest — reads a `RouteRegistry`, an
 * iterable of keyed `[key, RouteDefinition]` entries, plain `RouteDefinition`s,
 * or explicit descriptors into sorted {@link InspectRoute} rows.
 */

import { chainComparisons, compareBy, stringComparator } from '@ndigo/core';

import { deriveKey } from '@ndigo/router';
import type { RouteDefinition, RouteRegistry } from '@ndigo/router';
import type { InspectRoute, RouteSource } from './types';

/**
 * Whether a value behaves like a `RouteRegistry` (the class exposes `entries()`
 * and `get()`, unlike a plain array which has only `entries()`).
 *
 * @param value - The candidate route source.
 * @returns `true` when the value is duck-type compatible with `RouteRegistry`.
 */
function likeRouteRegistry(value: RouteSource): value is RouteRegistry {
    const candidate = value as { entries?: unknown; get?: unknown };
    return typeof candidate.entries === 'function' && typeof candidate.get === 'function';
}

/**
 * Whether an iterable item is a keyed registry entry (`[key, RouteDefinition]`,
 * the shape `RouteRegistry.entries()` yields) rather than a bare definition or
 * explicit descriptor.
 *
 * @param item - One iterable item.
 * @returns `true` for a keyed entry.
 */
function isKeyedEntry(item: unknown): item is [string, RouteDefinition] {
    return (
        Array.isArray(item) &&
        typeof item[0] === 'string' &&
        typeof (item[1] as RouteDefinition | undefined)?.pattern === 'string'
    );
}

/**
 * Normalize one plain iterable item into an {@link InspectRoute}. Explicit
 * descriptors pass through; a bare `RouteDefinition` uses `deriveKey(pattern)`
 * as its name (the documented fallback when no registry key is supplied).
 *
 * @param item - A `RouteDefinition` or explicit descriptor.
 * @returns The normalized row.
 */
function toInspectRoute(item: RouteDefinition | InspectRoute): InspectRoute {
    const explicit = item as Partial<InspectRoute>;
    if (typeof explicit.name === 'string' && typeof explicit.path === 'string') {
        return { name: explicit.name, path: explicit.path };
    }
    const { pattern } = item as RouteDefinition;
    return { name: deriveKey(pattern), path: pattern };
}

/**
 * Enumerate the routes a source declares.
 *
 * The emitted `name` is input-shape independent for the same controller: a
 * `RouteRegistry` and an iterable of its `entries()` both contribute the dotted
 * registry key, and explicit descriptors contribute their `name`. Only a bare
 * iterable of `RouteDefinition`s (no key supplied) falls back to
 * `deriveKey(pattern)`. The result is de-duplicated and sorted by name, then
 * path, so the manifest is deterministic regardless of registration order.
 *
 * @param source - The route source, or `undefined` for no routes.
 * @returns The sorted route rows.
 */
export function collectRoutes(source?: RouteSource): InspectRoute[] {
    if (source === undefined) return [];

    const rows = new Map<string, InspectRoute>();
    if (likeRouteRegistry(source)) {
        for (const [name, definition] of source.entries()) {
            rows.set(`${name}\u0000${definition.pattern}`, { name, path: definition.pattern });
        }
    } else {
        for (const item of source) {
            const route = isKeyedEntry(item) ? { name: item[0], path: item[1].pattern } : toInspectRoute(item);
            rows.set(`${route.name}\u0000${route.path}`, route);
        }
    }

    return [...rows.values()].sort(
        chainComparisons(
            compareBy((row) => row.name, stringComparator.compare),
            compareBy((row) => row.path, stringComparator.compare)
        )
    );
}
