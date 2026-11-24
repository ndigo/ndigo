# Environment & Configuration

The environment is a JavaScript-native configuration model — property sources,
profiles, typed configuration properties, and post-processing — with fail-loud
semantics throughout. This page covers the design principles, the precedence
rules, and the tensions they resolve.

## Design Principles

1. **Benchmarks drive defaults.** The default implementation and code paths are
   chosen by measurement on representative workloads, not by taste. When two
   strategies measure within noise of each other, the one with better sustained
   behaviour wins; the alternative stays available as an opt-in.
2. **Fail loud everywhere.** Configuration problems surface immediately instead
   of being swallowed, so a typo fails in CI rather than degrading silently in
   production. Missing values, bad profile expressions, conversion failures,
   and invalid environments raise instead of falling back.
3. **Replace, never mutate.** Sources are captured and replaced or reordered as
   whole units. In-place edits that would shadow another source are
   unsupported, and the process environment is snapshotted so later changes
   cannot quietly alter a running configuration.
4. **One conversion path.** Defaults, placeholders, and real values all flow
   through the same conversion logic, so there is no second set of rules that
   could disagree about what a value means.
5. **One source of truth per contract.** What is active is owned in one place;
   the documented precedence chain is stated in one place; environment schemas
   are the configuration contract.
6. **Secure parsing, not evaluation.** Profile expressions and keys are parsed
   rather than executed as code, which keeps the stack safe under strict
   content security policies and clean for static scanners.
7. **Declared in the language.** Configuration and environment use standard
   JavaScript decorators, so the model stays familiar to anyone who knows the
   language and legible to tooling.

## Precedence Chain

```
CLI → boot properties → process environment → .env → application-{profile}.json
     → application.json → defaults
```

The doctrine is deployer-over-developer: an operator's runtime choice beats a
value baked into the artefact. Among operator channels, the command line is
most specific. The chain is stated once, and both the implementation and its
integration test read from that statement, so the documented order cannot
drift from the executed one.

## Key Tensions and Resolutions

| Tension                                         | Resolution                                                                                                                           |
| :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| Origin tracking versus a flat model             | Provenance is optional and per-property; a structural default records no winner. Finer granularity is additive.                      |
| How much a refresh redoes                       | Rebuild and clear caches only. Customizers do not re-run, so a refresh cannot double-apply; platform snapshots keep their own chain. |
| Relaxed binding versus silent key drift         | Exact key paths are the default. Relaxed kebab/camel matching is opt-in per class, so a typo'd environment key still fails loudly.   |
| Profile defaults stated but not applied         | The environment owns the effective profile set; defaults apply only when nothing explicit selects one.                               |
| Profile files as separate sources versus merged | A first-wins chain per file would shadow nested overrides, so all profile files deep-merge into one source.                          |
| Fail fast versus aggregate                      | Dependent failures — a value that cannot bind — stop immediately. Independent shape violations aggregate into one report at boot.    |
| Deriving a nested group's prefix                | A field decorator cannot read a TypeScript type, so the field name supplies the sub-prefix and the author supplies the initializer.  |
| Conversion targets                              | TypeScript types vanish at runtime, so the target is declared explicitly rather than inferred.                                       |

## Security Posture

- **No code evaluation.** Profile expressions and keys are parsed, not
  executed, so the stack remains safe under strict content security policies.
- **Tamper-resistant captures.** Sources are copied into prototype-free
  snapshots and the process environment is captured, so later changes cannot
  mutate a running configuration.
- **Explicit browser boundary.** Only values explicitly meant for the browser
  are exposed to browser code. Anything in a client-visible source is public
  by definition.
- **Twelve-factor precedence.** Environment files never override variables
  already present in the environment.
- **Fail-loud validation.** Invalid configuration is caught at boot, in CI,
  rather than in production.

## What the Model Covers

The environment stack is complete and production-ready. It provides:

- Named, ordered sources with pluggable lookup strategies
- Placeholders with defaults, cycle guards, typed reads, and command-line
  arguments
- A documented precedence chain and standard sources
- Profiles with expressions, defaults, environment and command-line activation,
  and groups
- Typed binding with defaults, nesting, and relaxed matching
- Origin tracking, post-processing, and a formal refresh operation
- Schema validation that aggregates and reports every violation at boot

Remaining work is additive: finer-grained origin tracking, validation during
binding, transformative validation, and profile groups that reference other
groups.

## Reading Order

1. [Guide 03 — Environment & Configuration](../guides/03-environment-configuration.md) (usage)
2. This page (the architecture)
