**@ndigo/inspect v0.0.1**

***

# @ndigo/inspect v0.0.1

## Since

1.0.0

## Author

Jeff Rose

Public entry point for `@ndigo/inspect` — the programmatic manifest
generator. `inspectApplication()` produces a deterministic, versioned JSON
description of a running application: identity, routes, handler mappings and
declared configuration keys (values are never read or emitted).

There is no `ndigo inspect` CLI (AD-70 defers it); the demo entry point that
prints a manifest is `pnpm --filter @ndigo/api inspect`.

## Interfaces

- [InspectApp](interfaces/InspectApp.md)
- [InspectConfigEntry](interfaces/InspectConfigEntry.md)
- [InspectDispatcherLike](interfaces/InspectDispatcherLike.md)
- [InspectHandler](interfaces/InspectHandler.md)
- [InspectInput](interfaces/InspectInput.md)
- [InspectManifest](interfaces/InspectManifest.md)
- [InspectMapping](interfaces/InspectMapping.md)
- [InspectMappingTable](interfaces/InspectMappingTable.md)
- [InspectParameter](interfaces/InspectParameter.md)
- [InspectRoute](interfaces/InspectRoute.md)

## Type Aliases

- [InspectManifestVersion](type-aliases/InspectManifestVersion.md)
- [MappingSource](type-aliases/MappingSource.md)
- [RouteSource](type-aliases/RouteSource.md)

## Functions

- [inspectApplication](functions/inspectApplication.md)
