# @blue/reactive

Reactive state management for BlueJS — observable models, derived computations, and batched updates.

## Installation

```bash
pnpm add @blue/reactive
```

## Exports

- `Model` — observable model interface
- `MutableModel` — mutable observable model
- `StaticModel` — static (immutable) value wrapper
- `DerivedModel` — computed from other models
- `CompoundModel` — combines multiple models
- `LoadableModel` — async data with loading/error states
- `PropertyModel` — single-property binding
- `Batch` — batched update notifications