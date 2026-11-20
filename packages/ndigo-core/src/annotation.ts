/**
 * Metadata-only annotation primitives shared by every declaration layer.
 *
 * An annotation writes a value into the class's TC39 `Symbol.metadata` record
 * and returns the target unchanged. It has no execution effect of its own:
 * a reader — an advisor, a scheduler scan, an ORM manager — decides what the
 * value means. The namespace segment of the key names the declaring package,
 * never the package that consumes it.
 */
import '@tsmetadata/polyfill';
import { getSymbolMetadata } from './metadata.js';

/**
 * A decorator produced by {@link AnnotationKey}: it records the value and
 * leaves the declaration unchanged.
 */
export type AnnotationDecorator =
    | ((target: unknown, context: ClassDecoratorContext) => void)
    | (<M extends Function>(target: M, context: ClassMethodDecoratorContext) => M);

/**
 * Stable handle for an annotation: the metadata key, the unqualified name, and
 * the decorator factory. Pass the handle to {@link annotationOf} instead of
 * re-deriving the key at the call site, so renaming the decorator variable
 * cannot break a reader.
 *
 * @typeParam T - The annotation value type.
 */
export interface AnnotationKey<T> {
    /** Namespace-stable metadata key (`"<namespace>:<name>"`). */
    readonly key: string;
    /** The unqualified annotation name (the segment after the namespace). */
    readonly name: string;
    /**
     * The annotation decorator factory: writes the value and returns the
     * declaration unchanged.
     */
    (value: T): AnnotationDecorator;
}

/**
 * Splits and validates a qualified annotation name.
 *
 * @param name - The `<namespace>:<name>` annotation key.
 * @returns The namespace and unqualified name.
 */
function parseAnnotationKey(name: string): { namespace: string; name: string } {
    if (typeof name !== 'string') {
        throw new TypeError('An annotation name must be a string.');
    }

    const segments = name.split(':');
    if (segments.length !== 2 || segments[0].length === 0 || segments[1].length === 0) {
        throw new TypeError(`Annotation name '${name}' must be '<namespace>:<name>' — for example 'resilience:retry'.`);
    }

    return { namespace: segments[0], name: segments[1] };
}

/**
 * Builds the shared handle around a scope-specific decorator factory.
 *
 * @param key - The qualified metadata key.
 * @param name - The unqualified annotation name.
 * @param decorate - The decorator factory for the key's scope.
 * @returns The annotation handle.
 */
function createAnnotationKey<T>(
    key: string,
    name: string,
    decorate: (value: T) => AnnotationDecorator
): AnnotationKey<T> {
    // Functions already expose a read-only `name`; define both handle
    // properties explicitly so the annotation identity survives.
    return Object.defineProperties(decorate, {
        key: { value: key, enumerable: true },
        name: { value: name, enumerable: true },
        // NOTE: bridging the generic decorator factory to AnnotationKey<T> —
        // the callable's parameter type is the key's value type.
    }) as unknown as AnnotationKey<T>;
}

/**
 * Defines a method annotation.
 *
 * The decorator records the value under `<namespace>:<name>:<method>` and
 * returns the method unchanged. The namespace names the declaring package —
 * `methodAnnotation('resilience:retry')`, not `methodAnnotation('proxy:retry')`.
 *
 * @typeParam T - The annotation value type.
 * @param name - The qualified annotation key (`"<namespace>:<name>"`).
 * @returns The annotation handle.
 *
 * @example
 * ```ts
 * const audited = methodAnnotation<{ action: string }>('orders:audited');
 *
 * class OrderService {
 *     @audited({ action: 'order.submit' })
 *     submit(): void {}
 * }
 * ```
 */
export function methodAnnotation<T>(name: string): AnnotationKey<T> {
    const parsed = parseAnnotationKey(name);
    const key = name;

    return createAnnotationKey<T>(key, parsed.name, (value) => {
        return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
            if (context.kind !== 'method') {
                throw new TypeError(`@${parsed.name} can only be applied to a method — received '${context.kind}'.`);
            }
            context.metadata[`${key}:${String(context.name)}`] = value;
            return target;
        };
    });
}

/**
 * Defines a class annotation.
 *
 * The decorator records the value under `<namespace>:<name>`. A class-level
 * value covers every member of the class when a matcher reads it.
 *
 * @typeParam T - The annotation value type.
 * @param name - The qualified annotation key (`"<namespace>:<name>"`).
 * @returns The annotation handle.
 *
 * @example
 * ```ts
 * const audited = classAnnotation<{ action: string }>('orders:audited');
 *
 * @audited({ action: 'order.submit' })
 * class OrderService {}
 * ```
 */
export function classAnnotation<T>(name: string): AnnotationKey<T> {
    const parsed = parseAnnotationKey(name);
    const key = name;

    return createAnnotationKey<T>(key, parsed.name, (value) => {
        return function (target: unknown, context: ClassDecoratorContext): void {
            if (context.kind !== 'class') {
                throw new TypeError(`@${parsed.name} can only be applied to a class — received '${context.kind}'.`);
            }
            context.metadata[key] = value;
        };
    });
}

/**
 * Reads an annotation value from a class or instance, walking the class
 * hierarchy so inherited declarations resolve (nearest declaration wins).
 *
 * @typeParam T - The annotation value type.
 * @param target - Class constructor or instance.
 * @param key - The annotation handle the value was stored under.
 * @param member - The member to look up; omit for a class-level annotation.
 * @returns The annotation value, or `undefined` when the declaration carries
 *   none.
 *
 * @example
 * ```ts
 * const action = annotationOf(OrderService, audited, 'submit');
 * const classWide = annotationOf(OrderService, audited);
 * ```
 */
export function annotationOf<T>(target: unknown, key: AnnotationKey<T>, member?: PropertyKey): T | undefined {
    let carrier: unknown =
        typeof target === 'function' ? target : (target as { constructor?: unknown } | undefined)?.constructor;
    const metadataKey = member === undefined ? key.key : `${key.key}:${String(member)}`;

    while (typeof carrier === 'function') {
        const metadata = getSymbolMetadata(carrier);
        if (metadataKey in metadata) {
            return metadata[metadataKey] as T;
        }
        carrier = Object.getPrototypeOf(carrier);
    }

    return undefined;
}
