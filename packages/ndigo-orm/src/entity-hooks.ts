/**
 * The single entity-hook runner shared by `InMemoryEntityManager` and the
 * Drizzle-backed `DrizzleEntityManager`, so every persistence backend fires
 * `@prePersist` / `@postLoad` / `@preUpdate` / `@postRemove` at the same
 * points.
 */
import { Constructable } from '@ndigo/core';
import { getEntityMetadata } from './metadata';
import type { EntityHookEvent } from './metadata';

/**
 * Invokes the hooks registered for `event` on the entity's class, in
 * declaration order, bound to the entity instance. Hooks whose method is
 * missing at runtime are skipped.
 *
 * @param entity - The entity instance whose hooks run.
 * @param event - The entity hook event (e.g. `'prePersist'`).
 *
 * @example
 * ```ts
 * runEntityHooks(user, 'prePersist');
 * ```
 */
export function runEntityHooks<T extends object>(entity: T, event: EntityHookEvent): void {
    const entityClass = entity.constructor as Constructable<T>;
    const hooks = getEntityMetadata(entityClass).entityHooks;
    if (hooks.length === 0) {
        return;
    }
    const record = entity as Record<string, (...args: unknown[]) => unknown>;
    // Iterate instead of filter(): this runs per entity on scans, and a filter
    // would allocate an array even for classes with no matching hook.
    for (const hook of hooks) {
        if (hook.event !== event) {
            continue;
        }
        const method = record[hook.methodName];
        if (typeof method === 'function') {
            method.call(entity);
        }
    }
}
