/**
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Public types for the `@ndigo/inspect` manifest.
 */

import type { ApplicationContext } from '@ndigo/context';
import type { MappingEntry, RouteHandlerMethod, RouteMappingInfo } from '@ndigo/dispatcher';
import type { RouteDefinition, RouteRegistry } from '@ndigo/router';

/**
 * The manifest schema version. Bumped when the emitted shape changes
 * incompatibly; consumers switch on it.
 */
export type InspectManifestVersion = 1;

/**
 * The application identity block: the context name (when it has one) and the
 * active profile set.
 */
export interface InspectApp {
    /** The application context's name. */
    name?: string;
    /** The active profiles at inspection time (empty when none are set). */
    profiles: string[];
}

/**
 * A declarative route definition as emitted by the manifest.
 */
export interface InspectRoute {
    /** The route's stable key (the `RouteRegistry` dotted key, or the pattern). */
    name: string;
    /** The route pattern (e.g. `/users/{id}`). */
    path: string;
}

/**
 * The handler a mapping dispatches to.
 */
export interface InspectHandler {
    /** The handler class name. */
    class: string;
    /** The handler method name. */
    method: string;
}

/**
 * A handler method parameter and the source it binds from.
 */
export interface InspectParameter {
    /** The parameter's declared name (e.g. the extractor name). */
    name: string;
    /** The binding source type (e.g. `query:value`, `path:variable`). */
    source: string;
}

/**
 * A registered handler mapping: the pattern it claims, the HTTP methods it
 * accepts, and the handler method it resolves to. Values are never emitted.
 */
export interface InspectMapping {
    /** The route pattern the mapping claims. */
    pattern: string;
    /** The accepted HTTP methods; omitted when the mapping matches any method. */
    httpMethods?: string[];
    /** `true` when the mapping is a WebSocket endpoint. */
    socket?: boolean;
    /** The resolved handler class + method. */
    handler: InspectHandler;
    /** The handler method's parameters and their binding sources, when declared. */
    parameters?: InspectParameter[];
}

/**
 * A configuration key a `@configurationProperties` class declares.
 *
 * Deliberately value-free: only whether the environment currently supplies a
 * value is exposed, never the value itself.
 */
export interface InspectConfigEntry {
    /** The full environment keypath (e.g. `server.port`). */
    key: string;
    /** The declared conversion target (`number`/`boolean`/`date`/`string`), when known. */
    type?: string;
    /** The winning property source name, when the environment can report one. */
    origin?: string;
    /** Whether the environment currently has a value for the key. */
    hasValue: boolean;
}

/**
 * The deterministic, versioned application manifest.
 */
export interface InspectManifest {
    /** The manifest schema version. */
    version: InspectManifestVersion;
    /** When the manifest was generated (ISO 8601). */
    generatedAt: string;
    /** The application identity block. */
    app: InspectApp;
    /** Declarative routes, sorted by name then path. */
    routes: InspectRoute[];
    /** Registered handler mappings, sorted by pattern then handler. */
    mappings: InspectMapping[];
    /** Declared configuration keys, sorted by key. */
    config: InspectConfigEntry[];
}

/**
 * A handler-mapping read model: the enumeration seam an
 * `AbstractHandlerMethodMapping` exposes. A structural subset, so callers may
 * pass any mapping that provides either accessor.
 */
export interface InspectMappingTable {
    /** Enumerate registered mapping entries, when the mapping supports it. */
    getMappingEntries?(): readonly MappingEntry<RouteMappingInfo>[];
    /** Enumerate mapping → handler-method pairs, when the mapping supports it. */
    getHandlerMethods?(): ReadonlyMap<RouteMappingInfo, RouteHandlerMethod>;
}

/**
 * A dispatcher-like object whose `handlerMappings` collection carries the
 * registered handler mappings (e.g. an `AbstractDispatcher`).
 */
export interface InspectDispatcherLike {
    /** The registered handler mappings, in dispatch precedence order. */
    readonly handlerMappings: readonly unknown[];
}

/**
 * A source of declarative routes: a `RouteRegistry`, an iterable of keyed
 * `[key, RouteDefinition]` entries (the shape `RouteRegistry.entries()`
 * yields), an iterable of bare `RouteDefinition`s, or explicit
 * {@link InspectRoute} descriptors.
 */
export type RouteSource =
    | RouteRegistry
    | Iterable<[string, RouteDefinition]>
    | Iterable<RouteDefinition>
    | Iterable<InspectRoute>;

/**
 * A source of handler mappings: one or more mapping tables, or a dispatcher
 * whose `handlerMappings` are inspected.
 */
export type MappingSource = readonly InspectMappingTable[] | InspectMappingTable | InspectDispatcherLike;

/**
 * The input to {@link inspect-application.inspectApplication | inspectApplication}.
 */
export interface InspectInput {
    /** The application context to inspect. */
    context: ApplicationContext;
    /** Declarative routes; omitted ⇒ the manifest has no routes. */
    routes?: RouteSource;
    /** Handler mappings; omitted ⇒ the manifest has no mappings. */
    mappings?: MappingSource;
    /** Configuration-properties classes whose declared keys are enumerated. */
    configurationClasses?: Function[];
    /** A fixed `generatedAt` timestamp (ISO 8601), for deterministic output. */
    now?: string;
}
