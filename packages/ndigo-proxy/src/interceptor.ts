/**
 * @module ndigo-proxy
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Interceptor contract for `@ndigo/proxy`.
 *
 * Interceptors separate *selection* (`matches`) from *execution*
 * (`invoke`). Selection runs once per managed method at weave time;
 * execution runs on every call through the woven proxy.
 */
import { annotationOf, type AnnotationKey } from './annotation';

/**
 * Static description of one managed method, shared by all of its calls.
 */
export interface MethodDescriptor {
    /**
     * The container entry name the instance was created under
     * (e.g. `'orderService'`).
     */
    readonly entryName: string;
    /**
     * The class the method was resolved from — the factory's instance type.
     */
    readonly targetType: Function;
    /**
     * The method name (string; symbols are not intercepted).
     */
    readonly methodName: PropertyKey;
    /**
     * Reads the annotation value stored on this method by
     * `methodAnnotation(...)`, walking the class hierarchy (nearest
     * declaration wins). `undefined` when the method carries none.
     */
    annotation<T>(key: AnnotationKey<T>): T | undefined;
}

/**
 * One intercepted call: the {@link MethodDescriptor} plus the receiver and
 * actual arguments for this invocation.
 */
export interface MethodInvocation extends MethodDescriptor {
    /**
     * The real instance the method executes on — always the proxy target,
     * never the proxy itself, so `#private` fields keep working.
     */
    readonly target: object;
    /**
     * The arguments of this call.
     */
    readonly args: readonly unknown[];
}

/**
 * A unit of cross-cutting policy. Implementations choose which methods they
 * apply to and what runs around the call.
 */
export interface MethodInterceptor {
    /**
     * Order relative to other interceptors; lower runs closer to the caller
     * (outermost). Missing order is `0`; ties keep registration order.
     */
    readonly order?: number;
    /**
     * Whether this interceptor applies to `method`. Called once per managed
     * method while the processor prepares the entry — not per call.
     */
    matches(method: MethodDescriptor): boolean;
    /**
     * Runs for an intercepted call. Return `next()` to continue down the
     * chain (ultimately invoking the installed method on `invocation.target`),
     * or return a value / throw to short-circuit.
     */
    invoke(invocation: MethodInvocation, next: () => unknown): unknown;
}

/**
 * Builds the immutable per-method descriptor readers use for selection and
 * annotation lookup. Annotations are read from `targetType` (the declaring
 * class) rather than the instance: when the instance is itself a proxy —
 * e.g. a service client over a class — the instance's `constructor` chain
 * would resolve to `Function` and miss the metadata.
 */
export function createMethodDescriptor(
    targetType: Function,
    entryName: string,
    methodName: PropertyKey
): MethodDescriptor {
    return Object.freeze({
        entryName,
        targetType,
        methodName,
        annotation<T>(key: AnnotationKey<T>): T | undefined {
            return annotationOf(targetType, key, methodName);
        },
    });
}
