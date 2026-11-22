/**
 * Re-exports from `@preact/signals-core` — the underlying signals engine.
 *
 * Ndigo's signal integration builds on `@preact/signals-core` and adds
 * framework-aware bindings and decorators.
 */
export { signal, computed, effect, batch, untracked, Signal } from '@preact/signals-core';

export type { SignalOptions } from '@preact/signals-core';

export { streamToSignal } from './stream-to-signal';
export { eventsToSignal, signalToEvents } from './event-bridge';
export type { EventSource, EventSink, SignalToEventsOptions } from './event-bridge';
