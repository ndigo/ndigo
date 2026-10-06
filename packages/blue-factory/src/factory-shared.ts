/**
 * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
// Shared Object/Reflect helpers used across the factory implementation.

const { keys } = Object,
    { construct, defineProperty, deleteProperty } = Reflect;

export { keys, construct, defineProperty, deleteProperty };
