# @ndigo/signals

> Reactive state management for Ndigo — signals, computed values, and effects built on `@preact/signals-core` with a Ndigo decorator API.

Reactive state management with signals, computed values, and effects. Built on [`@preact/signals-core`](https://github.com/preactjs/signals) — the fastest, smallest signals library — with a Ndigo decorator API for declarative reactive state.

## Installation

```bash
pnpm add @ndigo/signals
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥11.

## Getting Started

### Core API (re-exported from `@preact/signals-core`)

```ts
import { signal, computed, effect, batch } from '@ndigo/signals';

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

## Usage

### Decorator API

```ts
import { signal, computed, effect, reactive } from '@ndigo/signals/decorators';

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

**`@reactive` is required** — it activates the `@signal` and `@effect` decorators after the decorated class's fields are initialized.

**Reactive members are not inherited.** `@reactive` activates the `@signal` and `@effect` members declared in its own class only — activation runs at the end of that class's construction, before subclass field initializers. A subclass that declares its own reactive members must apply `@reactive` as well:

```ts
@reactive
class Counter {
    @signal count = 0;
}

@reactive
class NamedCounter extends Counter {
    @signal label = 'unnamed';
}
```

Without the subclass `@reactive`, a subclass `@signal` field stays a plain property and subclass `@effect` methods never run; `getSignal` throws to point this out.

### Lifecycle Disposal

```ts
@reactive
class Component {
    @signal value = 0;
    @effect track() {
        console.log(this.value);
    }
}

const c = new Component() as any;
c.dispose(); // tears down all effects and signals
```

If the class already has a `destroy()` method, cleanup is chained into it.

### Accessing the Backing Signal

```ts
import { getSignal } from '@ndigo/signals/decorators';

@reactive
class Counter {
    @signal count = 0;
}

const c = new Counter() as any;
const sig = getSignal<number>(c, 'count');
sig.value; // read directly
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

### Core (`@ndigo/signals`)

| Export          | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `signal(value)` | Creates a writable signal with `.value` getter/setter        |
| `computed(fn)`  | Creates a read-only derived signal, lazily evaluated         |
| `effect(fn)`    | Runs a function, auto-tracks dependencies, re-runs on change |
| `batch(fn)`     | Batches multiple updates into a single notification          |
| `untracked(fn)` | Reads signals without subscribing                            |
| `Signal`        | Base class for writable signals                              |

### Decorators (`@ndigo/signals/decorators`)

| Decorator   | Target | Description                                                      |
| ----------- | ------ | ---------------------------------------------------------------- |
| `@reactive` | Class  | Activates `@signal`/`@effect` in its own class; adds `dispose()` |
| `@signal`   | Field  | Wraps field with reactive signal                                 |
| `@computed` | Getter | Wraps getter with memoized computed signal                       |
| `@effect`   | Method | Wraps method with reactive effect                                |

### Utilities

| Export                       | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `getSignal(instance, field)` | Returns the raw `Signal` instance for a decorated field |
| `batch(fn)`                  | Also exported from decorators for convenience           |

## Development

```bash
pnpm --filter @ndigo/signals build:lib
pnpm --filter @ndigo/signals test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
