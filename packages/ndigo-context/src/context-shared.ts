/**
 * Shared module-level state for the application context.
 */
// Shared module-level state for the application-context implementation.
// Reflect helpers used by the concrete context classes.

const { defineProperty, ownKeys } = Reflect;

/** @internal Reflect helpers re-exported for intra-package use. */
export { defineProperty, ownKeys };
