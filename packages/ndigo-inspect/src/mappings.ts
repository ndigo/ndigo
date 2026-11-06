/**
 *
 * Handler-mapping enumeration for the inspect manifest. Reads the dispatcher's
 * registered mappings through the `getMappingEntries()`/`getHandlerMethods()`
 * read model and flattens them into sorted {@link InspectMapping} rows.
 */

import { FrameworkError } from '@ndigo/core';
import { isSocketMapping } from '@ndigo/dispatcher';
import type { RouteHandlerMethod, RouteMappingInfo } from '@ndigo/dispatcher';
import type {
    InspectDispatcherLike,
    InspectHandler,
    InspectMapping,
    InspectMappingTable,
    InspectParameter,
    MappingSource,
} from './types';

const SEPARATOR = '\u0000';

/**
 * The handler class name, falling back to `Object` for anonymous handlers.
 */
function classNameOf(handler: unknown): string {
    const name = (handler as { constructor?: { name?: string } } | null | undefined)?.constructor?.name;
    return name !== undefined && name.length > 0 ? name : 'Object';
}

/**
 * The parameter rows a handler method declares (name + binding source).
 */
function parameterRows(handlerMethod: RouteHandlerMethod): InspectParameter[] {
    const parameters = handlerMethod.parameters ?? [];
    return parameters.map((parameter) => ({ name: parameter.name, source: String(parameter.type) }));
}

/**
 * Whether the handler method is a WebSocket endpoint (`@socketMapping`).
 * Metadata may be absent on synthetic mappings; absence is not an error.
 */
function isSocketHandler(handlerMethod: RouteHandlerMethod): boolean {
    try {
        return isSocketMapping(handlerMethod.handler, handlerMethod.method);
    } catch {
        return false;
    }
}

/**
 * Expand one registered mapping into rows — one per pattern it claims.
 */
function mappingsFor(info: RouteMappingInfo, handlerMethod: RouteHandlerMethod): InspectMapping[] {
    const patterns = [...(info.patternsCondition?.patterns ?? [])];
    if (patterns.length === 0) return [];

    const method = info.methodCondition?.method;
    const handler: InspectHandler = { class: classNameOf(handlerMethod.handler), method: handlerMethod.method };
    const parameters = parameterRows(handlerMethod);
    const socket = isSocketHandler(handlerMethod);

    return patterns.map((pattern) => {
        const row: InspectMapping = { pattern, handler };
        if (method !== undefined) row.httpMethods = [method];
        if (socket) row.socket = true;
        if (parameters.length > 0) row.parameters = parameters;
        return row;
    });
}

/**
 * Row identity for de-duplication: pattern + methods + socket + handler.
 */
function mappingKey(row: InspectMapping): string {
    return [
        row.pattern,
        row.httpMethods?.join(',') ?? '',
        row.socket === true ? 'socket' : '',
        row.handler.class,
        row.handler.method,
    ].join(SEPARATOR);
}

/**
 * Enumerate the mappings one mapping table exposes, preferring the
 * `getMappingEntries()` seam and falling back to `getHandlerMethods()`.
 */
function collectTable(table: InspectMappingTable): InspectMapping[] {
    const rows: InspectMapping[] = [];
    if (typeof table.getMappingEntries === 'function') {
        for (const entry of table.getMappingEntries()) {
            rows.push(...mappingsFor(entry.mapping, entry.handlerMethod));
        }
    } else if (typeof table.getHandlerMethods === 'function') {
        for (const [mapping, handlerMethod] of table.getHandlerMethods()) {
            rows.push(...mappingsFor(mapping, handlerMethod));
        }
    }
    return rows;
}

/**
 * Normalize a dispatcher-like source into the mapping tables it carries.
 */
function tablesOf(source: MappingSource): InspectMappingTable[] {
    if (Array.isArray(source)) return source as InspectMappingTable[];
    if (typeof (source as InspectDispatcherLike).handlerMappings !== 'undefined') {
        return (source as InspectDispatcherLike).handlerMappings as InspectMappingTable[];
    }
    return [source as InspectMappingTable];
}

/**
 * Enumerate the registered handler mappings from a mapping source.
 *
 * A dispatcher contributes its `handlerMappings` collection (only entries
 * exposing a mapping read model are read); an array or single table is read
 * directly. Rows are de-duplicated (first registration wins, mirroring
 * dispatch precedence) and sorted by pattern, then handler class, then method.
 *
 * `undefined` means "no mappings" (the optional input) and yields `[]`. An
 * explicit `null` is a caller error and fails fast with a {@link FrameworkError}
 * naming the accepted shapes, rather than an opaque `TypeError` from probing
 * the null source.
 *
 * @param source - The mapping source, `undefined` for no mappings, or `null`
 *   (rejected).
 * @returns The sorted mapping rows.
 * @throws {FrameworkError} When `source` is `null`.
 */
export function collectMappings(source?: MappingSource | null): InspectMapping[] {
    if (source === undefined) return [];
    if (source === null) {
        throw new FrameworkError(
            '@ndigo/inspect collectMappings: expected a mapping source — a dispatcher (with a `handlerMappings` ' +
                'collection), an array of mapping tables, or a single mapping table — but received null. ' +
                'Pass undefined to inspect no mappings.'
        );
    }

    const rows = new Map<string, InspectMapping>();
    for (const table of tablesOf(source)) {
        for (const row of collectTable(table)) {
            const key = mappingKey(row);
            if (!rows.has(key)) rows.set(key, row);
        }
    }

    return [...rows.values()].sort((a, b) => {
        if (a.pattern !== b.pattern) return a.pattern < b.pattern ? -1 : 1;
        if (a.handler.class !== b.handler.class) return a.handler.class < b.handler.class ? -1 : 1;
        if (a.handler.method !== b.handler.method) return a.handler.method < b.handler.method ? -1 : 1;
        const left = a.httpMethods?.join(',') ?? '';
        const right = b.httpMethods?.join(',') ?? '';
        return left < right ? -1 : left > right ? 1 : 0;
    });
}
