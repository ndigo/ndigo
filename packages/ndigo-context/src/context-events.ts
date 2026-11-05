/**
 * Typed event maps for the framework's emitters (AD-34 D2).
 *
 * The core {@link EventEmitter} stays string-typed — it is a general-purpose
 * mixin. These maps overlay compile-time payload contracts on the two
 * framework emitters:
 *
 * - {@link ContextEvents} — the application-context lifecycle events emitted
 *   by {@link GenericApplicationContext} (`generic-application-context.ts`),
 * - {@link EnvironmentEvents} — the environment refresh event
 *   ({@link CONFIG_REFRESH_EVENT} in `environment.ts` — the `'config:refresh'`
 *   literal is the map key; a listener typed against the literal fails to
 *   compile if the const ever drifts from the map).
 *
 * Add a new framework event here (name → payload tuple) when a new lifecycle
 * contract is introduced. Raw (string-typed) emission remains legal on both
 * emitters.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ApplicationContext } from './context-interfaces';

/**
 * Application-context lifecycle events and their payloads.
 */
export interface ContextEvents {
    /** Emitted at the start of `refresh()` before processors run. */
    'context:preparing': [context: ApplicationContext];
    /** Emitted when the context is fully active. */
    'context:refresh': [context: ApplicationContext];
    /** Emitted when the context starts closing. */
    'context:close': [context: ApplicationContext];
    /** Emitted when the context is fully destroyed. */
    'context:destroy': [context: ApplicationContext];
}

/**
 * Environment events and their payloads.
 */
export interface EnvironmentEvents {
    /** Emitted after the environment rebuilds from its sources. */
    'config:refresh': [];
}
