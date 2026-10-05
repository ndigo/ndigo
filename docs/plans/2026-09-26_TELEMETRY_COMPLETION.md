# 2026-09-26 Telemetry Completion — trace sampling, exporter ergonomics, log↔trace correlation

**Status:** ✅ **All four waves implemented 2026-09-26** — ratified by
[AD-32](../decisions/2026-09-26_AD32_TELEMETRY_COMPLETION.md)
(sampling D-1, exporter ergonomics D-2/D-3, correlation D-4, no-env-dup
D-5). The gap-analysis Telemetry row is flipped to IMPLEMENTED.

**Scope:** The Telemetry row of the Framework Gap Analysis
(`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` §3):

> **Telemetry** | OTel traces/metrics/logging; broad instrumentation set |
> No trace-sampling config, no exporter ergonomics beyond SDK defaults, no
> exposed log↔trace correlation tooling.

**Evidence gathered (verified 2026-09-26):**

- `configureTelemetry(TelemetryConfig)` (`@blue/telemetry-node`,
  `src/node-config.ts`) wraps `NodeSDK` with OTLP/HTTP exporters for all
  three signals. Gaps: exporters accept **only a url** (no headers,
  timeout/compression, no console dev fallback, no disable); the trace
  path accepts **no sampler** (effective default `parentbased_always_on`
  — 100% sampling — confirmed in the OTel environment table
  `OTEL_TRACES_SAMPLER`); `url: undefined` today means "OTLP to the
  default `localhost:4318` endpoint" — silent network chatter for a
  misconfigured app, and no construction-time validation.
- `@blue/telemetry-web` (`browser-config.ts`) **already ships the
  ergonomics** the node side lacks: `traceUrl`-missing → console exporter,
  `useConsoleExporters: false` disable, `enableDiagnostics`. The node
  contract should reach parity, not invent a new shape.
- Log↔trace correlation exists only implicitly: `ContextAwareLogger`
  stamps `trace.id`/`span.id` attributes when an OTel span is active, gated
  by `LoggerFactory.contextAware`. There is no stand-alone accessor
  (`currentTraceContext()`) for non-logger consumers (queue messages,
  outbound calls, custom sinks), and no guide documents the seam.
- `@opentelemetry/sdk-trace-base` is already a direct dependency of
  `@blue/telemetry-node` → samplers (`AlwaysOnSampler`, `AlwaysOffSampler`,
  `TraceIdRatioBasedSampler`), `ParentBased`, and `ConsoleSpanExporter` are
  importable without new dependencies.
- Node consumer + demo gate: `apps/blue-api/src/index.ts`
  (`configureTelemetry({ ... })`).

**Companion docs:**
[Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §3
(Telemetry row), [AD-32](../decisions/2026-09-26_AD32_TELEMETRY_COMPLETION.md)
(decisions D-1..D-5), `@blue/telemetry-web` `browser-config.ts` (the
ergonomics precedent), AD-07-adjacent OTel sweep (Otel SDK 2.x option
shapes).

---

## 1. Problem

The node telemetry shim is functional but configuration-blind where
operators need control: sampling can't be tuned (cost control), exporters
can't be headed/auth'd (real OTLP endpoints require it), a dev machine
silently targets a non-existent collector, and the only correlation path is
a logger attribute readers must discover by reading source. The three gaps
in the audit row map to three waves.

## 2. Decisions (draft — AD-32)

- **D-1 — Sampling is an explicit option; default preserves today.**
  `TelemetryConfig.sampler?: { ratio: number } | 'always' | 'off' | Sampler`.
  Presets map to parent-based samplers (`ParentBased` root:
  `TraceIdRatioBased(ratio)` / `AlwaysOn` / `AlwaysOff`) so child spans
  inherit the root decision; a raw OTel `Sampler` passes through. Default:
  `'always'` (today's effective `parentbased_always_on`), pinned by a Wave-1
  spec before any behavior can drift.
- **D-2 — Per-signal exporter options: headers, console, none; missing url
  means console (web parity).** Each of `traceExporter` / `metricExporter`
  / `logExporter` accepts `{ url?, headers?, console? } | 'console' |
'none'`. `url` + `headers` → OTLP/HTTP with the headers forwarded (bearer
  auth etc.); `console: true` or a missing `url` → console exporter (the
  dev posture `browser-config.ts` already established — a misconfiguration
  can no longer silently phone `localhost:4318`); `'none'` disables the
  signal's export path (empty processors/readers where the SDK accepts
  them, no-op sink otherwise — verified in Wave 2's spec). `headers` are
  never logged. **Breaking note:** today `url: undefined` = default OTLP
  endpoint; `blue-api`'s call site is checked and updated in Wave 2.
- **D-3 — OTLP urls validate at construction.** `new URL(url)` before the
  exporter is built; invalid/garbage urls fail loud at `configureTelemetry`
  time — same discipline as the config-server `https:` enforcement (AD-29
  SEC-1), applied to all three signals.
- **D-4 — Correlation tooling is an explicit surface.** `@blue/telemetry`
  exports `currentTraceContext(): { traceId, spanId } | undefined` backed
  by the active OTel span (via the API: `trace.getSpan(context.active())`).
  Returns `undefined` when no provider/span is active — safe in pure-logging
  mode. `LoggerFactory.contextAware = true` remains the documented seam for
  stamping logs; the new accessor serves non-logger consumers (queue
  payloads, outbound headers, custom sinks).
- **D-5 — No env-var duplication.** OTel's native `OTEL_*` variables keep
  their precedence for raw OTel consumers; the BlueJS option layer is
  explicit-first and documents that mixing with `OTEL_*` is unsupported
  (one source of truth per deployment).

## 3. Risks

| Risk                                                              | Mitigation                                                                                                             |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Missing-url default change silently alters an existing deployment | Wave 2 audits `configureTelemetry` call sites (blue-api); explicit `console`/url paths keep old behavior one word away |
| `'none'` needs a no-op trace exporter the SDK may require         | Wave-2 spec verifies per-signal disable against the installed SDK; no-op sink documented if needed                     |
| Sampler round-off at extremes (`ratio: 0`/`1`)                    | Presets normalize to the exact `AlwaysOn`/`AlwaysOff` semantics; spec pins boundaries                                  |
| Active-span accessor returns stale ids after span end             | Spec asserts `undefined` after end/without provider; JSDoc documents lifetime                                          |

## 4. Sequencing

### Wave 1 — Trace sampling config ✅ (implemented 2026-09-26)

- `TelemetryConfig.sampler?: SamplerSpec` (
  `{ ratio: number } | 'always' | 'off' | Sampler`), resolved to
  parent-based samplers (`ParentBasedSampler` roots) so children inherit;
  raw OTel `Sampler` passes through. Default `'always'` — the pinned
  current behavior. Invalid ratios (`< 0`, `> 1`, NaN) fail loud at
  configuration time, **before** the once-per-process latch.
- **Execution-discovered (as-built):** OTel's API registers global
  providers **once per process** — repeated `setGlobalTracerProvider` calls
  are silently ignored (`registerGlobal(..., allowOverride = false)`; the
  `global-utils` reset is not importable through the exports map).
  Consequences: `configureTelemetry` warns loudly on repeat calls (first
  call wins), and each sampler scenario lives in its own spec file
  (one provider per worker). Specs: 9 tests across
  `test/sampler/*.spec.ts` — the default pin (100%), `'always'`, `'off'`,
  ratio boundaries 0/1 (deterministic), ratio 0.5 (statistical bounds),
  parent→child inheritance via the active context, and invalid-ratio
  rejections (all three in one process — validation precedes the latch).
- **Gate:** `pnpm test` 21/21 (12 pre-existing + 9 new) + `tsc -b` green.

### Wave 2 — Exporter ergonomics ✅ (implemented 2026-09-26)

- Per-signal contract `ExporterSpec` (`{ url?, headers?, console? } |
'console' | 'none'`); pure `resolveExporter(spec, signal)` resolves the
  shape table (unit-testable in one process): `undefined`/`'console'`/
  `{ console: true }` → console (dev default — web parity); `'none'` →
  disabled; `{ url, headers? }` → OTLP/HTTP with headers forwarded
  (`headers`-only still selects OTLP = explicit intent, default endpoint).
- `'none'` traces → `spanProcessors: []` (SDK registers no provider);
  console traces → `SimpleSpanProcessor` + console exporter;
  OTLP goes through NodeSDK's own batch construction (unchanged batching).
  Metrics/logs follow the same table (`metricReaders`/`logRecordProcessors`).
- OTLP urls validate at configuration time (`new URL`, D-3), error naming
  the signal.
- **Call-site audit:** `blue-api` passes an explicit `{ url }` gated on
  `OTEL_EXPORTER_OTLP_ENDPOINT` — unaffected by the new default; no change.
- Specs: `exporter-config.spec.ts` (6 pure resolver tests incl. headers
  passthrough + per-signal invalid-url errors), `exporter-console.spec.ts`
    - `exporter-none.spec.ts` (integration, one provider per worker).
- **Gate:** `pnpm test` 29/29 (21 + 8 new) + both `tsc -b` builds green.

### Wave 3 — Log↔trace correlation tooling ✅ (implemented 2026-09-26)

- `currentTraceContext()` in `@blue/telemetry` (`src/trace/correlation.ts`),
  exported from the package index; reads the active span's `spanContext()`
  (the same API boundary `ContextAwareLogger` uses); `undefined`-safe; JSDoc
  example for queue/outbound stamping.
- `docs/guides/10-telemetry.md` — sampling knobs, the exporter table,
  correlation (incl. the `LoggerFactory.contextAware` seam), browser side,
  limits.
- Specs: `test/current-trace-context.spec.ts` (boundary-mocked like the
  logger spec — no global provider needed): ids from the active span,
  `undefined` without one.
- **Gate:** `@blue/telemetry` 33/33 (31 + 2 new) + `tsc -b` green.

### Wave 4 — Audit + README refresh

- Gap-analysis §3 Telemetry row → **IMPLEMENTED 2026-09-26** with AD-32
  reference; plans README/feeds where maintained; final repo gate
  (`pnpm build` if cross-package surface changed).

## 5. Verification

Per wave: changed-package `vitest run` + `tsc -b`; consumer gates
(blue-api) after Wave 2; final `graft build`; gap-analysis status flip in
Wave 4.
