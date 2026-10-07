/**
 * @module blue-inspect
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Public entry point for `@blue/inspect` — the programmatic manifest
 * generator behind the `blue inspect --json` tooling. `inspectApplication()`
 * produces a deterministic, versioned JSON description of a running
 * application: identity, routes, handler mappings and declared configuration
 * keys (values are never emitted).
 */

export { inspectApplication } from './inspect-application';
export type {
    InspectApp,
    InspectConfigEntry,
    InspectDispatcherLike,
    InspectHandler,
    InspectInput,
    InspectManifest,
    InspectManifestVersion,
    InspectMapping,
    InspectMappingTable,
    InspectParameter,
    InspectRoute,
    MappingSource,
    RouteSource,
} from './types';
