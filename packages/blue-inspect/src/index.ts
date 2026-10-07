/**
 * @module blue-inspect
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Public entry point for `@blue/inspect` — the programmatic manifest
 * generator. `inspectApplication()` produces a deterministic, versioned JSON
 * description of a running application: identity, routes, handler mappings and
 * declared configuration keys (values are never read or emitted).
 *
 * There is no `blue inspect` CLI (AD-70 defers it); the demo entry point that
 * prints a manifest is `pnpm --filter @blue/api inspect`.
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
