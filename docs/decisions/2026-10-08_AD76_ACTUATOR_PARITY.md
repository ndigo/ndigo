# AD-76: Actuator parity — `/loggers`, `/env`, `/configprops`, health groups

**Date:** 2026-10-08
**Status:** Accepted
**Deciders:** Framework owner (GAP-4 of `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6, refreshed in `…_AD72_75.md` §5)

---

## Context

The management surface ships exactly `/health` (AD-36) and `/metrics`
(proprietary JSON, tracked by GAP-5). Peer frameworks (the Java actuator stack,
Micronaut management, Quarkus management interfaces) all offer at
least log-level inspection and live changes, environment/source visibility,
bound-configuration introspection, and composed health views. The 2026-10-07
review rates actuator parity **high** and 1.0-severity; this record and the
companion plan (`docs/plans/2026-10-08_ACTUATOR_PARITY.md`) are the Wave-6
ADR gate.

What the repository already provides:

- **Health substrate complete.** `HealthRegistry` (register/unregister,
  `checkAll()` with concurrent probes, aggregation rules, error redaction
  AD-36) feeds a `{status, components, timestamp}` document at `/health`
  (503-on-DOWN). No way to select a subset (groups/components) exists.
- **Loggers substrate is 90% there.** `@blue/log` (AD-67) resolves loggers
  lazily from global settings + a revision counter; `ConfigurableLogger`
  already carries a **handle-local** `#thresholdOverride`
  (`logger-factory.ts:101-128`) — the per-name machinery is missing only the
  shared registry and name enumeration. Severity names map through the
  existing `severity` module (npm/apache/syslog/cli schemes).
- **Configuration introspection exists and is value-free.** Boot 5's
  `declaredConfigurationProperties(ctor)` returns declared keys + conversion
  types (schema-mode types included, REU-12), never values — the exact
  contract `@blue/inspect` (AD-70) codified as "values are never read".
- **Environment enumeration exists.** `MutablePropertySources.entries()`
  yields name/source pairs in precedence order; `FlatMergedIndex.originOf`
  reports winning origins at top-level granularity.
- **A gated-controller pattern is proven.** `OpenAPIDocsAutoConfiguration`
  (AD-35) registers controllers **without route decorators** and wires routes
  explicitly in its `handlerMappings()` entry — the same vehicle a per-endpoint
  exposure gate needs ("Registered without decorator metadata: the docs
  auto-configuration registers the route at construction with per-instance
  paths", `openapi-docs-controller.ts`).
- **Config wiring was explicitly NOT wired.** The schema `management` section
  is annotated `x-blue-read-from-config: false` (HI-5): every exposed key is a
  constructor option of `ManagementAutoConfiguration`; no reader consumes a
  `management.*` property.

## Evidence

- Ground truth pinned from the actuator reference (4.1)
  (`docs.spring.io/spring-boot/reference/actuator/endpoints.html`): only
  **health is exposed over HTTP by default**; exposure via
  `management.endpoints.web.exposure.include/exclude` (default `health`,
  `*` = all); `/env` and `/configprops` values are **sanitized by default**
  (`******`), `show-values` = never/always/when-authorized; health groups
  aggregate configured component subsets; `/loggers` supports GET (index and
  per-name) and POST (`{"configuredLevel": …}`, `{}` clears).
- Blue's own posture: management endpoints are **open by default** with the
  accessGuard + boundary-firewall documented pattern (AD-36); the inspect
  contract says values are never read; SEC-A forbids decrypted plaintext on
  the wire (`bindings` redaction); `REDACTED_VALUE` exists in
  `@blue/context/src/redaction.ts`.
- Route gating ship-shape: `AbstractHandlerMethodMapping.init()` detection
  scans **context values** for route metadata, so a controller that is a
  context bean with decorator routes cannot be gated per-endpoint — the
  metadata-free registration pattern (openapi) is the only clean vehicle.

## Decision

### D-1 — Routes stay at the root; exposure replaces presence

No `/actuator` prefix migration (existing `127.0.0.1:port/health` deployments
keep working; a prefix is a documented future knob). The control surface is an
exposure model: `management.endpoints.exposure.include` / `.exclude`
(`management.endpoints.web.exposure.include` names, minus `web` —
blue serves only HTTP). Endpoint ids: `health`, `metrics`, `loggers`, `env`,
`configprops`; `*` = all; `exclude` wins.

### D-2 — Default exposure `["health","metrics"]`; new endpoints opt-in

The two existing endpoints stay registered by default (current behavior,
backward compatible) — nothing new is served without operator action. This
preserves the AD-36 "open by default" posture for what already exists while
keeping log-level mutation, environment dumps and config introspection behind
an explicit opt-in, matching the actuator tradition's minimal-exposure default intent.

### D-3 — `/configprops` never emits values; `/env` is sanitized by default

`/configprops` enumerates declared keys + conversion types only —
`declaredConfigurationProperties` is the endpoint's implementation, so a
secret cannot leak by construction (the AD-70 inspect contract). `/env`
returns each source's flattened dotted keys with origins; values are
`"<redacted>"` unless `management.endpoints.env.showValues: true`, and even
then only the **stored config text** is emitted — decrypted plaintext never
reaches the wire (SEC-A). The actuator `show-values` page shows the same choice;
blue collapses `always`/`when-authorized` into one boolean because the
endpoint-level guard is a single `accessGuard` (no role ladder, D-4).

### D-4 — One access model: the existing `accessGuard`, widened to the exposed set

No per-endpoint `management.endpoint.<id>.access` ladder (the 4.1 reference). The
guard remains a single unconditional `RouteHandlerInterceptor`; its path
scoping is now **computed from the exposure** so it covers exactly the served
surface (disabled endpoints are not registered and cannot be requested).

### D-5 — `management.*` becomes a real read namespace

New `ManagementProperties` (living in `@blue/management`) reads the
`management` subtree from the environment's property sources (deep-merged in
precedence order, validated by a zod schema with the file-model defaults) and
exposes `endpoints.exposure.include/exclude`, `endpoints.env.showValues`,
and `health.groups.<name>.include`. The schema `management` section flips
from `x-blue-read-from-config: false` to a cited read path (the HI-5
reachability spec gains the keys); leftover constructor options
(`redactHealthErrors`, `accessGuard`, `configurationClasses`) keep the
annotation. Programmatic `ManagementAutoConfigurationOptions.exposure`
takes precedence over the read values (code intent wins over files).
_Amendment (2026-10-08, implementation): no `@configurationProperties`
decorator — the decorator lives in `@blue/boot`, and no package depends on
boot at runtime (REU-9 removed it from `@blue/inspect`'s closure). The
reader walks the merged `management` subtree directly, which is the same
config-file convention every other key follows._

### D-6 — Health groups are configured component subsets

`management.health.groups.<name>.include: string[]`; `GET /health/:name`
serves a group aggregate (same aggregation rules as `/health`, restricted to
the members actually registered) when the name matches a group, else the
single component as a **one-component aggregate document** — every
`/health/:name` answer keeps blue's `{status, components, timestamp}`
document shape (an actuator `{status, details}`-shaped response would need a
second serialization contract for the same status rules); unknown → 404. A
group shadows a same-named component, and `details` stay as today (blue
always shows health details; the actuator `show-details` default is a deliberate
divergence, documented in guide 26).

### D-7 — Per-logger levels: runtime, process-local, name-keyed registry

`LoggerFactory` gains a module-scope name → `SeverityNumber` override map
(no handles retained — the AD-67 no-registry-keeps-alive property holds),
`setLevel`/`clearLevel`/`loggerNames`/`configuredLevel`/`effectiveLevel`, and
`getLogger` records requested names. The registry override wins over a
handle-local override; global settings remain the floor. `/loggers` GET/POST
follow the actuator payloads (`{levels, loggers: {name: {configuredLevel?,
effectiveLevel}}}`, POST `{"configuredLevel": "…"}` / `{}` clears, unknown
level 400, unknown logger 404). Levels use the npm severity scheme
(`silent|error|warn|info|http|verbose|silly`, honoring the module's existing
vocabulary); a new strict resolver (`strictLevelToSeverityNumber`) rejects
names the loose `detectSeverityScheme` fallback would silently map to INFO.

### D-8 — New controllers register without route decorators

`LoggersController`, `EnvironmentController`, `ConfigurationPropertiesController`
are context-aware beans with **no** `@requestMapping`/`@getMapping` metadata;
`ManagementAutoConfiguration.handlerMappings()` registers each route
explicitly (`RouteMappingInfo` + `HTTPMethodCondition`), gated by exposure —
the AD-35 openapi pattern. Health/metrics stay decorator-driven and
detection-registered (always exposed). `configurationClasses` (the explicit
app list `/configprops` enumerates, mirroring `@blue/inspect`) is a
constructor option: D-3 has no other registry of bound classes to scan.

## Consequences

- Default installs serve exactly what they serve today; enabling the new
  endpoints is a config-file key (`management.endpoints.exposure.include`)
  or a constructor option.
- `@blue/management` gains the loggers/environment/configprops surface, a new
  `management.*` config namespace (schema + reachability spec updated), and a
  first-class guide 26; `@blue/log` gains the per-name registry (leaf package,
  no new dependencies); the HI-5 "read or annotated" invariant is preserved.
- `/env` and `/configprops` reveal configuration structure to anyone who can
  reach the endpoints — exposure default-off plus the documented accessGuard
  pattern is the security posture; operators on untrusted networks follow
  AD-36 (guard + firewall).
- Level changes are process-local and ephemeral (lost on restart) — the
  actuator model is the same; persistence is a future ADR.
- GAP-4 closes; GAP-5 (/metrics parity) proceeds in parallel without touching
  this surface beyond the shared auto-configuration registration.

## References

- Review: `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 (GAP-4), §8 (Wave 6)
- Plan: `docs/plans/2026-10-08_ACTUATOR_PARITY.md`
- Reference: the actuator endpoint/health/loggers documentation used as the
  parity target when this ADR was written (captured 2026-10-08)
- Related decisions: [AD-36](2026-09-28_AD36_MANAGEMENT_HARDENING.md)
  (health redaction + bind posture), [AD-35](2026-09-28_AD35_OPENAPI_DOCS.md)
  (metadata-free gated controllers), [AD-70](2026-10-06_AD70_EDITOR_TOOLING_INTROSPECTION_FIRST.md)
  (introspection-first tooling — the value-free contract), [AD-67](2026-10-06_AD67_LOG_LEAF_PACKAGE.md)
  (`@blue/log` leaf), [AD-29](2026-09-25_AD29_CONFIGURATION_REFRESH_SECRETS_CONFIG_SERVER.md)
  (config file conventions), GAP-5 (metrics parity)
