# AD-32: Telemetry completion — trace sampling, exporter ergonomics, log↔trace correlation

**Date:** 2026-09-26
**Status:** Accepted — D-1..D-5 ratified and landed 2026-09-26 (all four
waves; see [plan](../plans/2026-09-26_TELEMETRY_COMPLETION.md)).

## Background

The Framework Gap Analysis §3 Telemetry row records three missing
capabilities over the existing OTel stack: **no trace-sampling config**,
**no exporter ergonomics beyond SDK defaults**, and **no exposed log↔trace
correlation tooling**. `configureTelemetry` (`@ndigo/telemetry-node`,
`node-config.ts`) wraps `NodeSDK` with OTLP/HTTP exporters that accept only
urls; no sampler option exists (effective default
`parentbased_always_on` — 100%); a missing url silently targets the default
`localhost:4318` collector. `@ndigo/telemetry-web` already ships the
ergonomics the node side lacks (`traceUrl`-missing → console exporter,
`useConsoleExporters: false`, `enableDiagnostics`), and
`ContextAwareLogger` stamps trace/span ids into log attributes without a
stand-alone accessor for non-logger consumers. This ADR ratifies the shape
for closing all three.

## Decisions

### D-1 — Sampling is an explicit option; default preserves today

`TelemetryConfig.sampler?: { ratio: number } | 'always' | 'off' | Sampler`
on the node telemetry config. Presets resolve to parent-based samplers
(`ParentBased` with an `AlwaysOnSampler` / `AlwaysOffSampler` /
`TraceIdRatioBasedSampler(ratio)` root) so child spans inherit the root
decision; a raw OTel `Sampler` passes through untouched. Default `'always'`
preserves today's effective behavior (100% sampling) and is pinned by spec
before any change. All samplers come from `@opentelemetry/sdk-trace-base`,
already a direct dependency.

**As-built (execution-discovered):** OTel's API registers the global trace
provider **once per process** — subsequent `setGlobalTracerProvider` calls
(NodewaSDK `start()` included) are silently ignored
(`registerGlobal(..., allowOverride = false)`; the internal
`global-utils` reset is unreachable through the package exports map).
The shim therefore validates configuration before its own latch, warns
loudly on repeat `configureTelemetry` calls (first call wins), and sampler
specs isolate one provider per test file. Docs teach "configure once at
boot".

### D-2 — Per-signal exporter options: headers, console, none; missing url means console

`traceExporter` / `metricExporter` / `logExporter` each accept
`{ url?, headers?, console? } | 'console' | 'none'`:

- `url` present → OTLP/HTTP exporter; `headers` (a plain request-headers
  map, e.g. `Authorization: Bearer …`) are forwarded and never logged.
- `console: true` **or a missing `url`** → console exporter — the dev
  posture `browser-config.ts` already established; a misconfiguration can
  no longer silently phone the default collector.
- `'none'` disables the signal's export path (empty processors/readers
  where the installed SDK accepts them, no-op sink otherwise — verified by
  spec in Wave 2).

**Behavior change (intentional):** today `url: undefined` means "OTLP to
the default endpoint". The new default (console) is the safe dev posture;
existing call sites (ndigo-api) are audited and updated in Wave 2.

### D-3 — OTLP urls validate at construction

`new URL(url)` runs before any exporter is built; invalid URLs fail loud
at `configureTelemetry` time for all three signals — the same
fail-fast discipline applied to the config-server URL (AD-29 SEC-1
remediation).

### D-4 — Correlation tooling is an explicit surface

`@ndigo/telemetry` exports
`currentTraceContext(): { traceId, spanId } | undefined`, read from the
active OTel span (`trace.getSpan(context.active())`). Returns `undefined`
when no provider or span is active — safe in pure-logging mode — and is the
documented tool for stamping queue payloads, outbound headers, and custom
sinks. `LoggerFactory.contextAware = true` remains the log-stamping seam
(`ContextAwareLogger`); the accessor serves consumers that do not go
through loggers.

### D-5 — No env-var duplication

`OTEL_*` environment variables keep their native precedence for raw OTel
consumers; the ndigo option layer is explicit-first and documents that
mixing the two is unsupported (one source of truth per deployment).

## Risks

- The missing-url default change is behavior-visible → Wave 2 audits all
  `configureTelemetry` call sites; explicit options preserve old behavior
  one word away.
- `'none'` may require a no-op trace exporter depending on SDK version →
  verified in the Wave-2 spec against the installed SDK; a documented no-op
  sink is the fallback.
- Ratio sampler RNG makes exact ratio assertions impossible → specs pin
  boundaries (0 → never, 1 → always) and statistical bounds, not exact
  counts.
- Active-span accessor lifetime → JSDoc + spec asserts `undefined` after
  span end and without a provider.

## Verification

Wave gates executed 2026-09-26: `vitest run` green in `@ndigo/telemetry`
(33/33 incl. 2 correlation specs) and `@ndigo/telemetry-node` (29/29 incl.
9 sampler + 8 exporter specs); `tsc -b` clean in both packages;
`apps/ndigo-api` suite green (52) over the rebuilt libs; gap-analysis §3
Telemetry row flipped to IMPLEMENTED; `graft build` refreshed.
