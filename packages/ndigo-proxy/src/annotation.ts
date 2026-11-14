/**
 * Metadata-only method annotations for `@ndigo/proxy`.
 *
 * An annotation decorator writes a value into the TC39 `Symbol.metadata`
 * record under `"proxy:<name>:<methodName>"` and returns the target method
 * unchanged — it never replaces or wraps the method. Interceptors select
 * methods by reading these keys via {@link annotationOf}.
 */
import '@tsmetadata/polyfill';
import { getSymbolMetadata } from '@ndigo/core';

/**
 * Metadata key prefix reserved by `@ndigo/proxy` — same `prefix:` delimiting
 * convention as `cache:` and `schedule:`.
 */
export const PROXY_METADATA_PREFIX = 'proxy:';

/**
 * Stable handle for a method annotation: a namespace key plus a callable that
 * produces the decorator. Pass the key to {@link annotationOf} or
 * `MethodDescriptor.annotation`; call it with a value to decorate:
 *
 * ```ts
 * const audited = methodAnnotation<{ action: string }>('audited');
 *
 * class OrderService {
 *     @audited({ action: 'order.submit' })
 *     submit(): void {}
 * }
 * ```
 */
export interface AnnotationKey<T> {
    /**
     * Namespace-stable key (`"proxy:<name>"`). Reads never re-derive it from
     * the decorator, so renaming the variable keeps lookups working.
     */
    readonly key: string;
    /**
     * The user-supplied annotation name (the `<name>` segment of the key).
     */
    readonly name: string;
    /**
     * The metadata-only method decorator factory.
     */
    (value: T): <M extends Function>(target: M, context: ClassMethodDecoratorContext) => M;
}

/**
 * Defines a `@ndigo/proxy` method annotation.
 *
 * @typeParam T - The annotation value type.
 * @param name - Unique annotation name within the `proxy:` namespace.
 * @returns An {@link AnnotationKey} callable with the annotation value.
 *
 * @example
 * ```ts
 * const audited = methodAnnotation<{ action: string }>('audited');
 * ```
 */
export function methodAnnotation<T = unknown>(name: string): AnnotationKey<T> {
    if (typeof name !== 'string' || name.length === 0) {
        throw new TypeError('methodAnnotation(name) requires a non-empty annotation name');
    }

    const key = `${PROXY_METADATA_PREFIX}${name}`;

    function apply(value: T) {
        return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
            if (context.kind !== 'method') {
                throw new TypeError(`methodAnnotation('${name}') can only be applied to methods`);
            }
            context.metadata[`${key}:${String(context.name)}`] = value;
            return target;
        };
    }

    // Functions already expose a read-only `name`; define both handle
    // properties explicitly so the annotation name survives.
    return Object.defineProperties(apply, {
        key: { value: key, enumerable: true },
        name: { value: name, enumerable: true },
        // NOTE: bridging to AnnotationKey<T> — the source type is wider than this consumer's contract.
    }) as unknown as AnnotationKey<T>;
}

/**
 * Reads an annotation value for a method, walking the class hierarchy so
 * inherited annotations resolve (nearest declaration wins).
 *
 * @param target - Class constructor or instance.
 * @param key - The {@link AnnotationKey} the value was stored under.
 * @param methodName - The method to look up.
 * @returns The annotation value, or `undefined` when the method carries none.
 *
 * @example
 * ```ts
 * const action = annotationOf(OrderService, audited, 'submit');
 * ```
 */
export function annotationOf<T>(target: unknown, key: AnnotationKey<T>, methodName: PropertyKey): T | undefined {
    let carrier: unknown =
        typeof target === 'function' ? target : (target as { constructor?: unknown } | undefined)?.constructor;
    const metadataKey = `${key.key}:${String(methodName)}`;

    while (typeof carrier === 'function') {
        const metadata = getSymbolMetadata(carrier as Function);
        if (metadataKey in metadata) {
            return metadata[metadataKey] as T;
        }
        carrier = Object.getPrototypeOf(carrier as Function);
    }

    return undefined;
}
