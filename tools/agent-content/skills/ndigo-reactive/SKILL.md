---
name: ndigo-reactive
description: Adds reactive state with Ndigo signals, computed values, and effects. Use when introducing client-side state or wiring state to the DOM.
---

# Reactive state

## The surface

| Need           | API                                              |
| :------------- | :----------------------------------------------- |
| State cell     | `signal(initial)` from `@ndigo/signals`          |
| Derived value  | `computed(() => …)`                              |
| Side effect    | `effect(() => …)`, batched with `batch(() => …)` |
| Decorator form | `@signal`, `@computed`, `@effect`, `@reactive`   |
| Teardown       | `dispose()` on the owner                         |

## Sequence

1. Declare state with `signal` (or `@signal` on a class).
2. Derive values with `computed`; do not mirror state manually.
3. Subscribe with `effect`; write side effects there, not inside `computed`.
4. Wrap multi-cell updates in `batch`.
5. Dispose the owner when the element or service disconnects.

## Traps

- **`@reactive` is required** for `@signal` and `@effect` to activate, and it is
  not inherited: a subclass with its own reactive members needs its own
  `@reactive`.
- **`computed` is lazy.** It recalculates when read; do not put I/O in it.
- **Effects are synchronous unless batched.** Use `batch` for multi-step
  updates so observers see one consistent state.
- **Reactive members need teardown.** Call `dispose()` on disconnect; otherwise
  effects outlive their element.

## Verify

A test updates the signal and asserts the derived value and any effect count;
the owner disposes cleanly on disconnect.
