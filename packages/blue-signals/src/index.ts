/**
 *
 * Re-exports from `@preact/signals-core` — the underlying signals engine.
 *
 * ```ts
 * import { signal, computed, effect, batch, untracked } from '@blue/signals';
 *
 * const count = signal(0);
 * const doubled = computed(() => count.value * 2);
 * effect(() => console.log(count.value));
 * batch(() => { count.value = 1; });
 * ```
 *
 * For the decorator API see `@blue/signals/decorators`.
 *
 * @see https://github.com/preactjs/signals
 */
export { signal, computed, effect, batch, untracked, Signal } from '@preact/signals-core';

export type { SignalOptions } from '@preact/signals-core';
