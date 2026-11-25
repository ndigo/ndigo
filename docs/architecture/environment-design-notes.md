# Environment & Configuration — Design Notes

Internal design notes for maintainers. The published
[Environment & Configuration](./environment.md) page states the rules; this
file keeps the trade-offs and the capability inventory behind them. It is not
published as a concept page.

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

## Capability Inventory

The model provides:

- Named, ordered sources with pluggable lookup strategies
- Placeholders with defaults, cycle guards, typed reads, and command-line
  arguments
- A documented precedence chain and standard sources
- Profiles with expressions, defaults, environment and command-line activation,
  and groups
- Typed binding with defaults, nesting, and relaxed matching
- Origin tracking, post-processing, and a formal refresh operation
- Schema validation that aggregates and reports every violation at boot

## Remaining Work

Remaining work is additive: finer-grained origin tracking, validation during
binding, transformative validation, and profile groups that reference other
groups.
