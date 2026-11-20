/**
 * The execution contract: what advice receives, and how rules select it.
 *
 * An annotation declares a value on a class; a {@link MethodInterceptor}
 * executes around a call; a {@link MethodInterceptorRule} joins the two by
 * matching descriptors and naming an interceptor.
 */
import { annotationOf, type AnnotationKey, type Matchable } from '@ndigo/core';

// `AnnotationKey` appears in this package's public signatures — every
// `annotation(...)` reader takes one — so it is re-exported for callers that
// build a descriptor or an invocation by hand. The primitives that *create* a
// key stay in `@ndigo/core`.
export type { AnnotationKey, ClassAnnotationKey, MethodAnnotationKey } from '@ndigo/core';

/**
 * Static description of one managed method, shared by all of its calls.
 */
export interface MethodDescriptor {
    /**
     * The container entry name the instance was created under
     * (e.g. `'orderService'`); standalone weaving uses the class name.
     */
    readonly entryName: string;
    /**
     * The class the method was resolved from — the declaring type, not the
     * instance, so metadata lookup survives proxy-shaped targets.
     */
    readonly targetType: Function;
    /**
     * The method name. Symbols are not managed.
     */
    readonly methodName: PropertyKey;
    /**
     * Reads the declaration in effect for this method, walking the class
     * hierarchy (nearest declaration wins). `undefined` when nothing declares
     * a value for it.
     *
     * A member declaration takes precedence; when the member carries none, a
     * class-level declaration applies — so a blanket `@authenticated` on a
     * class covers every method of it, exactly as the route guards read it.
     *
     * @param key - The annotation handle to read.
     * @returns The effective annotation value, or `undefined` when absent.
     */
    annotation<T>(key: AnnotationKey<T>): T | undefined;
}

/**
 * One managed call: the {@link MethodDescriptor} plus the receiver and the
 * arguments for this invocation.
 */
export interface MethodInvocation extends MethodDescriptor {
    /**
     * The real instance the method executes on — never a stand-in object, so
     * `#private` fields keep working.
     */
    readonly target: object;
    /**
     * The arguments of this call.
     */
    readonly args: readonly unknown[];
}

/**
 * A unit of cross-cutting policy: it runs around a matched call.
 *
 * An interceptor never decides *where* it applies — that is the rule's job.
 */
export interface MethodInterceptor {
    /**
     * The interceptor's natural band — lower runs closer to the caller
     * (outermost). A capability declares where it belongs so an application
     * gets the safe arrangement without naming numbers: retry outside a
     * transaction, observability outside retry.
     *
     * A rule's own `order` overrides it, because the composition decides the
     * position and one interceptor may sit in different bands per rule. When
     * neither names one, the rule lands in `AdviceOrder.Application`.
     */
    readonly order?: number;
    /**
     * Verifies that this interceptor can honour the method's declaration.
     * Called once per matched method while the plan is compiled, so a
     * configuration error surfaces at startup rather than on first call.
     *
     * @param method - The descriptor the interceptor was matched against.
     * @throws When the method's annotations cannot be served.
     */
    validate?(method: MethodDescriptor): void;
    /**
     * Runs for a matched call. Return `next()` to continue down the chain
     * (ultimately invoking the installed method), or return a value / throw
     * to short-circuit.
     *
     * @param invocation - The current call's descriptor, target, and arguments.
     * @param next - Continues the inner chain.
     * @returns The call result, or the short-circuit value.
     */
    invoke(invocation: MethodInvocation, next: () => unknown): unknown;
}

/**
 * Binds an interceptor to the methods it advises.
 *
 * @example
 * ```ts
 * const retryRule: MethodInterceptorRule = {
 *     when: hasAnnotation(retry),
 *     use: new RetryInterceptor(),
 * };
 * ```
 */
export interface MethodInterceptorRule {
    /**
     * Selects the methods this rule applies to. Omitted matches every method
     * on the woven surface.
     */
    readonly when?: Matchable<MethodDescriptor>;
    /**
     * The advice to run for a matching method.
     */
    readonly use: MethodInterceptor;
    /**
     * Rule-level order. Overrides the interceptor's own `order` when present,
     * so one interceptor instance can sit in different bands per rule.
     */
    readonly order?: number;
}

/**
 * Builds the immutable descriptor used for selection and annotation lookup.
 *
 * @param targetType - The class the method was resolved from.
 * @param entryName - The container entry name, or class name standalone.
 * @param methodName - The method name.
 * @returns A frozen descriptor with annotation lookup bound to `targetType`.
 *
 * @example
 * ```ts
 * const descriptor = createMethodDescriptor(OrderService, 'orderService', 'submit');
 * ```
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
            // Member first, then the class-level declaration: a blanket
            // annotation on a class covers every method of it, matching how
            // `AuthRouteGuard` and the Node adapter read `@authenticated`.
            return annotationOf(targetType, key, methodName) ?? annotationOf(targetType, key);
        },
    });
}
