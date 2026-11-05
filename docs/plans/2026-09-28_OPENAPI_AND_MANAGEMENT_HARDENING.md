# 2026-09-28 OpenAPI Docs + Management Hardening — implementation plan

**Scope:** Wave: `@ndigo/openapi` (spec generation + Swagger UI — the last
Tier-1 gap-analysis row) + SEC-5 completion (redaction + bind posture).
**Status:** ALL WAVES IMPLEMENTED 2026-09-28. (Two implementation
amendments, recorded in AD-35: zod-native `toJSONSchema` replaces
`zod-to-json-schema` — the latest release cannot introspect Zod 4.5; and the
serving auto-configuration lives in `@ndigo/platform-node`, keeping the
openapi package transport-agnostic.)
**Decisions:** [AD-35](../decisions/2026-09-28_AD35_OPENAPI_DOCS.md),
[AD-36](../decisions/2026-09-28_AD36_MANAGEMENT_HARDENING.md)
**Gap rows:** [Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md)
§2.1 (OpenAPI), §3/§5 (management residuals).

---

## 1. Problem

1. The framework generates no API specification: no OpenAPI document, no
   Swagger UI, no typed-client generation. Every route/parameter/validation
   fact generation needs is already declarative metadata at runtime.
2. SEC-5 residuals: `/health` echoes indicator exception messages to
   anonymous callers; management bind-address separation is unresolved and
   undocumented as policy.

## 2. Decisions (ratified by AD-35/AD-36)

- New `@ndigo/openapi` package: `OpenAPISpecGenerator` + `@apiDocs`;
  wraps `swagger-ui-dist` (zod-native `toJSONSchema` for schema
  conversion — see AD-35 amendment); no platform-node dependency.
  `OpenAPIDocsAutoConfiguration` lives in `@ndigo/platform-node` (serving;
  controller/mapping contribution, `@ndigo/management` pattern).
- Generation is introspection over `RouteHandlerMapping.getHandlerMethods()`:
  patterns → paths (`:name`/`{*name}` → `{name}`), method-condition →
  operation, first-wins dedup by `{method} {path}`; private/hidden excluded.
- Zod seam: `ParameterExtractor.schema` + `MethodParameter.schema` set by
  `validatedBy`; `toJSON` excludes it.
- Serving: `GET /v3/api-docs` (spec JSON), `GET /swagger-ui/` (assets from
  `swagger-ui-dist`, no CDN); options via subclass constructor
  (`enabled/path/uiPath/info/servers/accessGuard/include/excludePaths`);
  lazy memoized generation; docs endpoints self-hidden.
- SEC-5: `redactHealthErrors` (default true) in
  `ManagementAutoConfigurationOptions`; bind posture documented (server-level
  `host` binding + boundary firewall) + host-binding regression test;
  management listener = post-1.0 follow-up.

## 3. Risks

Weight of `swagger-ui-dist` (fixed ~1.5 MB served payload, cache headers);
`zod-to-json-schema` must support the repo's Zod 4.x (pinned + isolated
behind one function); no return-type/response-schema inference (recorded
follow-up); multi-mapping duplication needs the dedup key.

## 4. Sequencing — ✅ all waves implemented 2026-09-28

### Wave 1 — Zod schema seam (`@ndigo/dispatcher`)

- `ParameterExtractor` + `MethodParameter`: optional `schema?: z.ZodType`;
  `validatedBy` sets it (spread already forwards); `toMethodParameter`
  threads it; `MethodParameter.toJSON` excludes it.
- Specs: `validatedBy` attaches the schema; `MethodParameter.toJSON` omits it.

### Wave 2 — `@ndigo/openapi` skeleton + generator core

- Package scaffold per standard (package.json/tsconfig build+check/vitest
  config/src index/README; docs standard 12).
- `OpenAPISpecGenerator.generate(mappings, options?): OpenApiDocument`:
  info block, path/operation extraction, parameter mapping
  (query/path/header/cookie/body → requestBody; multipart parts), schema via
  `zod-to-json-schema`, `x-ndigo-matrixParams`/`x-ndigo-queryParams`
  extensions, exclusions (methodless, private, hidden, filters), dedup.
- Specs: fixture `RadixMetadataHandlerMapping` with controller classes.

### Wave 3 — `@apiDocs` decorator

- `@apiDocs({ summary, description, tags, operationId, deprecated, hidden })`
  metadata on handlers; generator reads it (hidden → excluded, `_hidden`
  marker on docs endpoints); `apiDocsOf(target, propertyKey)` reader.
- Specs: summary/description/tags reach the operation; hidden excludes.

### Wave 4 — Serving: `OpenAPIDocsAutoConfiguration`

- `ApiDocsController` (`AsApplicationContextAware` — reads dispatcher at
  request time; memoized generation) + `SwaggerUIAssetsController`
  (binary ResponseEntity + cache headers) on a `handlerMappings()` entry;
  `@apiDocs({ hidden: true })` on both; scoped `accessGuard` wrapper.
- Specs (via `@ndigo/platform-node` dev-dep + MockHTTP/live pipeline):
  spec JSON endpoint shape, UI HTML + asset 200s, guard scoping.

### Wave 5 — SEC-5: redaction + bind posture

- `ManagementAutoConfigurationOptions.redactHealthErrors` (default true);
  `HealthRegistry.checkAll()` redaction param; marker constant
  `HEALTH_ERROR_REDACTED`.
- `@ndigo/platform-node`: host-binding regression spec (server binds supplied
  host; loopback default).
- Specs: redacted vs unredacted `/health`; success payloads unchanged.

### Wave 6 — Demo wiring, docs, gates

- `apps/ndigo-api`: register `OpenAPIDocsAutoConfiguration`; startup log line
  for the UI; integration spec asserts `/v3/api-docs` + an operation
  (`POST /api/echo` requestBody) + `/swagger-ui/` assets.
- Notes: gap analysis §2.1 OpenAPI row → IMPLEMENTED (AD-35/36, guide 13);
  §3 management row → redaction + posture closed; §5 item 6 refresh;
  roadmap OpenAPI row flip; guides README + guide 13
  (`docs/guides/13-openapi-and-api-docs.md`); guide 11 §8 rewrite (AD-36
  posture); docs/README audit list + root README package list get
  `@ndigo/openapi`; plan table entry.
- Gates: `pnpm lint`, `pnpm format:check`, `pnpm build`, changed-package
  `vitest run` + `tsc -b`, `graft build`.

## 5. Verification

The demo (`apps/ndigo-api`) runs with the docs registered: `curl
/v3/api-docs` returns a parseable spec listing the demo's operations with the
`/api/echo` requestBody; `curl /swagger-ui/` returns the UI page whose asset
URLs 200; `/health` with a throwing indicator returns the redacted marker by
default and the raw message with `redactHealthErrors: false`.
