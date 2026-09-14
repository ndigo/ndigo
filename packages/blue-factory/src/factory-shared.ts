/**
 * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
// Shared Object/Reflect helpers used across the factory implementation.

const { create, keys } = Object,
    { construct, defineProperty, deleteProperty } = Reflect;

export { create, keys, construct, defineProperty, deleteProperty };
