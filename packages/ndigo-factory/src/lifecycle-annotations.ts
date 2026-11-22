/**
 * Lifecycle-hook annotations that compile into the factory's processor seam.
 *
 * `@preInit`, `@postInit`, and `@preDestroy` are metadata-only declarations:
 * they write a marker into `Symbol.metadata` and run nothing on their own. The
 * container's `LifecycleAnnotationProcessor` reads them when it processes each
 * managed instance and invokes the declared methods at the matching hook
 * position. Standalone `new` instances stay inert.
 *
 * @example
 * ```ts
 * class MyBean {
 *     @preInit
 *     init() { return true; }
 * }
 * ```
 */
import '@tsmetadata/polyfill';
import { annotationOf, methodAnnotation, type MethodAnnotationKey } from '@ndigo/core';
import type { DestructionAwareProcessor, InitializationAwareProcessor } from './entry-processor';

/**
 * `@preInit` annotation key.
 */
export const preInitSpec: MethodAnnotationKey<true> = methodAnnotation<true>('factory:preInit');

/**
 * `@postInit` annotation key.
 */
export const postInitSpec: MethodAnnotationKey<true> = methodAnnotation<true>('factory:postInit');

/**
 * `@preDestroy` annotation key.
 */
export const preDestroySpec: MethodAnnotationKey<true> = methodAnnotation<true>('factory:preDestroy');

function collectMethodNames(instance: unknown): (string | symbol)[] {
    const names = new Set<string | symbol>();

    let current: unknown = instance === null ? null : Object.getPrototypeOf(instance);
    while (typeof current === 'object' && current !== null && current !== Object.prototype) {
        for (const key of Object.getOwnPropertyNames(current as object)) {
            if (key === 'constructor') {
                continue;
            }
            const descriptor = Object.getOwnPropertyDescriptor(current as object, key);
            if (descriptor && typeof descriptor.value === 'function') {
                names.add(key);
            }
        }
        for (const key of Object.getOwnPropertySymbols(current as object)) {
            const descriptor = Object.getOwnPropertyDescriptor(current as object, key);
            if (descriptor && typeof descriptor.value === 'function') {
                names.add(key);
            }
        }
        current = Object.getPrototypeOf(current as object);
    }

    return [...names];
}

function runAnnotated(instance: unknown, key: MethodAnnotationKey<true>): void {
    if (typeof instance !== 'object' || instance === null) {
        return;
    }

    const names = collectMethodNames(instance);
    for (const name of names) {
        if (annotationOf(instance, key, name) === undefined) {
            continue;
        }
        const method = (instance as Record<PropertyKey, unknown>)[name];
        if (typeof method === 'function') {
            method.call(instance);
        }
    }
}

/**
 * Marks a method to run after property population and aware injection, before
 * `init()`.
 *
 * @returns A method decorator.
 */
export function preInit() {
    return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
        return preInitSpec(true)(target, context);
    };
}

/**
 * Marks a method to run after `init()`, before the instance is served.
 *
 * @returns A method decorator.
 */
export function postInit() {
    return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
        return postInitSpec(true)(target, context);
    };
}

/**
 * Marks a method to run before the release verb.
 *
 * @returns A method decorator.
 */
export function preDestroy() {
    return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
        return preDestroySpec(true)(target, context);
    };
}

/**
 * Processor that executes the lifecycle-hook annotations.
 *
 * @example
 * ```ts
 * const processor = new LifecycleAnnotationProcessor();
 * ```
 */
export class LifecycleAnnotationProcessor implements InitializationAwareProcessor, DestructionAwareProcessor {
    get [Symbol.toStringTag](): string {
        return 'LifecycleAnnotationProcessor';
    }

    /**
     * Apply this processor to the given new instance _before_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
     *
     * @param _name - The name of instance
     * @param instance - The instance
     * @returns The instance to use, either the original or a wrapped one; if `null`, no subsequent InitializationAwareProcessors will be invoked.
     */
    processBeforeInitialization<T = unknown>(_name: string, instance: T): T {
        runAnnotated(instance, preInitSpec);
        return instance;
    }

    /**
     * Apply this processor to the given new instance _after_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
     *
     * @param _name - The name of instance
     * @param instance - The instance
     * @returns The instance to use, either the original or a wrapped one; if `null`, no subsequent InitializationAwareProcessors will be invoked.
     */
    processAfterInitialization<T = unknown>(_name: string, instance: T): T {
        runAnnotated(instance, postInitSpec);
        return instance;
    }

    /**
     * Apply this processor to the given instance before its destruction.
     * @param _name - The name of instance
     * @param instance - The instance to be destroyed.
     */
    processBeforeDestruction<T = unknown>(_name: string, instance: T): void {
        runAnnotated(instance, preDestroySpec);
    }
}
