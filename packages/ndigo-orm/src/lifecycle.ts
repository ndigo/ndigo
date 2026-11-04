/**
 * The single lifecycle-hook runner shared by `InMemoryEntityManager` and the
 * Drizzle-backed `DrizzleEntityManager`, so every persistence backend fires
 * `@prePersist` / `@postLoad` / `@preUpdate` / `@postRemove` at the same
 * points (DAT-F1).
 * @module ndigo-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Constructable } from '@ndigo/core';
import { getEntityMetadata } from './metadata';
import type { LifecycleEvent } from './metadata';

/**
 * Invokes the hooks registered for `event` on the entity's class, in
 * declaration order, bound to the entity instance. Hooks whose method is
 * missing at runtime are skipped.
 *
 * @param entity - The entity instance whose hooks run.
 * @param event - The lifecycle event (e.g. `'prePersist'`).
 */
export function runLifecycleHooks<T extends object>(entity: T, event: LifecycleEvent): void {
    const entityClass = entity.constructor as Constructable<T>;
    const hooks = getEntityMetadata(entityClass).lifecycleHooks.filter((hook) => hook.event === event);
    const record = entity as Record<string, (...args: unknown[]) => unknown>;
    for (const hook of hooks) {
        const method = record[hook.methodName];
        if (typeof method === 'function') {
            method.call(entity);
        }
    }
}
