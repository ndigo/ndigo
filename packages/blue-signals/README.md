# @blue/signals

Reactive state management with signals, computed values, and effects.

Built on [`@preact/signals-core`](https://github.com/preactjs/signals) — the fastest, smallest signals library — with a BlueJS decorator API for declarative reactive state.

## Installation

```bash
pnpm add @blue/signals
```

## Usage

### Core API (re-exported from `@preact/signals-core`)

```ts
import { signal, computed, effect, batch } from '@blue/signals';

const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
    console.log(`Count is ${count.value}`);
});

count.value = 1; // logs "Count is 1"

batch(() => {
    count.value = 2;
    // effect won't fire until batch completes
});
```

### Decorator API

```ts
import { signal, computed, effect, reactive } from '@blue/signals/decorators';

@reactive
class Counter {
    @signal count = 0;

    @computed get doubled() {
        return this.count * 2;
    }

    @effect log() {
        console.log(`count = ${this.count}`);
    }
}

const c = new Counter();
c.count++; // logs "count = 1"
```

**`@reactive` is required** — it activates the `@signal` and `@effect` decorators after field initialization.

### Lifecycle Disposal

```ts
@reactive
class Component {
    @signal value = 0;
    @effect track() { console.log(this.value); }
}

const c = new Component() as any;
c.dispose(); // tears down all effects and signals
```

If the class already has a `destroy()` method, cleanup is chained into it.

### Accessing the Backing Signal

```ts
import { getSignal } from '@blue/signals/decorators';

@reactive
class Counter {
    @signal count = 0;
}

const c = new Counter() as any;
const sig = getSignal<number>(c, 'count');
sig.value; // read directly
```

## API Reference

### Core (`@blue/signals`)

| Export | Description |
|--------|-------------|
| `signal(value)` | Creates a writable signal with `.value` getter/setter |
| `computed(fn)` | Creates a read-only derived signal, lazily evaluated |
| `effect(fn)` | Runs a function, auto-tracks dependencies, re-runs on change |
| `batch(fn)` | Batches multiple updates into a single notification |
| `untracked(fn)` | Reads signals without subscribing |
| `Signal` | Base class for writable signals |

### Decorators (`@blue/signals/decorators`)

| Decorator | Target | Description |
|-----------|--------|-------------|
| `@reactive` | Class | Activates `@signal`/`@effect`; adds `dispose()` |
| `@signal` | Field | Wraps field with reactive signal |
| `@computed` | Getter | Wraps getter with memoized computed signal |
| `@effect` | Method | Wraps method with reactive effect |

### Utilities

| Export | Description |
|--------|-------------|
| `getSignal(instance, field)` | Returns the raw `Signal` instance for a decorated field |
| `batch(fn)` | Also exported from decorators for convenience |

## Signals vs. the Old `@blue/reactive`

| | `@blue/reactive` (removed) | `@blue/signals` |
|---|---|---|
| **Pattern** | Pull-based observable | Push-based signals |
| **Dependency tracking** | Manual (explicit source arrays) | Automatic (read-time tracking) |
| **Subscription** | `.subscribe()` / manual `Unsubscribe` | `effect()` / auto-cleanup |
| **Reading** | `.get()` | `.value` property |
| **Writing** | `.set(v)` | `.value = v` |
| **Performance** | Eager, no caching | Lazy, memoized, microtask-batched |
| **Size** | ~2.5 KB | ~1.5 KB (via `@preact/signals-core`) |