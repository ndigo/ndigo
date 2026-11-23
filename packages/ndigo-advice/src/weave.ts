/**
 * Weaving entry points: the standalone path and the strategy dispatcher.
 *
 * The container and the by-hand path share one plan compiler, so advice
 * behaves identically whether an object came from a factory or was
 * constructed directly.
 */
import { compileInterceptorPlan, type MethodInterceptorPlan } from './plan';
import { weaveMethodProxy } from './proxy';
import { MethodInterceptorRegistry } from './registry';
import {
    entryNameOf,
    enumerateMethodNames,
    isShadowWoven,
    shadowObstacle,
    shadowWeave,
    targetTypeOf,
    type AdviceStrategy,
} from './shadow';
import type { MethodInterceptorRule } from './interceptor';

/**
 * The outcome of weaving one instance.
 *
 * @typeParam T - The instance type.
 *
 * @example
 * ```ts
 * const value = {} as WeaveResult;
 * ```
 */
export interface WeaveResult<T extends object> {
    /**
     * The object to use from now on: the instance itself for shadow weaving,
     * or a proxy over it for the fallback.
     */
    readonly instance: T;
    /**
     * Which strategy produced the woven object.
     */
    readonly strategy: AdviceStrategy;
}

/**
 * Instances this module has woven, mapped to the object callers should use.
 * Both the original and the woven object are recorded, so weaving either one
 * again returns the same result instead of stacking a second layer.
 */
const WOVEN = new WeakMap<object, object>();

/**
 * Provenance of woven objects: the processor that did the weaving. Standalone
 * weaving records nothing, so a container processor can tell "already advised
 * by me" from "advised outside the container" and report the real cause.
 */
const WOVEN_BY = new WeakMap<object, object>();

/**
 * Whether an object (or the instance it stands in for) has been advised.
 *
 * @param instance - The object to inspect.
 * @returns `true` when this module already wove it.
 *
 * @example
 * ```ts
 * isWoven();
 * ```
 */
export function isWoven(instance: object): boolean {
    return WOVEN.has(instance);
}

/**
 * The processor that wove `instance`, or `undefined` when it was advised
 * standalone or not advised at all.
 *
 * @param instance - The woven object to inspect.
 * @returns The owning processor, or `undefined`.
 *
 * @example
 * ```ts
 * wovenBy();
 * ```
 */
export function wovenBy(instance: object): object | undefined {
    return WOVEN_BY.get(instance);
}

/**
 * Records which processor owns a woven object. Called by the container
 * processor; standalone callers never use it.
 *
 * @param instance - The woven object.
 * @param owner - The processor that wove it.
 *
 * @example
 * ```ts
 * markWovenBy();
 * ```
 */
export function markWovenBy(instance: object, owner: object): void {
    WOVEN_BY.set(instance, owner);
}

/**
 * Compiles `rules` against `instance`'s method surface and weaves it, using
 * shadow weaving when possible and a `Proxy` when not.
 *
 * Returns `strategy: 'none'` and the original instance when no rule matched
 * anything — unadvised objects pay nothing at call time and keep their
 * identity.
 *
 * @param instance - The object to advise.
 * @param rules - The rules to compile, or a registry holding them.
 * @param entryName - The container entry name; defaults to the class name.
 * @returns The instance to use and the strategy that produced it.
 *
 * @example
 * ```ts
 * const { instance: priced, strategy } = weaveInstance(orderService, rules, 'orderService');
 * ```
 */
export function weaveInstance<T extends object>(
    instance: T,
    rules: MethodInterceptorRegistry | readonly MethodInterceptorRule[],
    entryName: string = entryNameOf(instance)
): WeaveResult<T> {
    // NOTE: the registry stores plain objects because it also keys proxies;
    // what it holds for a woven instance is that instance or a proxy over it,
    // both of which the caller uses as `T`.
    const existing = WOVEN.get(instance) as T | undefined;
    if (existing !== undefined) {
        return { instance: existing, strategy: isShadowWoven(existing) ? 'shadow' : 'proxy' };
    }

    const registered = rules instanceof MethodInterceptorRegistry ? rules.rules : rules;
    const plans = compileInterceptorPlan(targetTypeOf(instance), entryName, enumerateMethodNames(instance), registered);
    return weavePlans(instance, plans);
}

/**
 * Weaves already-compiled plans, choosing the strategy for the instance.
 *
 * Shadow weaving is preferred — it preserves identity and advises
 * self-invocation. The `Proxy` fallback exists for frozen, sealed, and other
 * non-extensible objects and for function targets; its cost is documented on
 * {@link weaveMethodProxy}.
 *
 * @param instance - The object to advise.
 * @param plans - The compiled per-method plans.
 * @returns The instance to use and the strategy that produced it.
 *
 * @example
 * ```ts
 * weavePlans();
 * ```
 */
export function weavePlans<T extends object>(instance: T, plans: readonly MethodInterceptorPlan[]): WeaveResult<T> {
    if (plans.length === 0) {
        return { instance, strategy: 'none' };
    }

    // NOTE: the registry stores plain objects because it also keys proxies;
    // what it holds for a woven instance is that instance or a proxy over it,
    // both of which the caller uses as `T`.
    const existing = WOVEN.get(instance) as T | undefined;
    if (existing !== undefined) {
        return { instance: existing, strategy: isShadowWoven(existing) ? 'shadow' : 'proxy' };
    }

    const methodNames = plans.map((plan) => plan.descriptor.methodName);
    const obstacle = shadowObstacle(instance, methodNames);
    if (obstacle === null) {
        shadowWeave(instance, plans);
        // The instance advises itself, so both sides of the map are the same
        // object — recorded anyway so `isWoven` sees every strategy.
        WOVEN.set(instance, instance);
        return { instance, strategy: 'shadow' };
    }

    // The proxy forwards the instance's whole surface, so it is an `T` for
    // every purpose a caller has; only the identity checks differ.
    const proxy = weaveMethodProxy(instance, plans) as T;
    WOVEN.set(instance, proxy);
    WOVEN.set(proxy, proxy);
    return { instance: proxy, strategy: 'proxy' };
}

/**
 * Advises an object without a container.
 *
 * This is a first-class path, not a compatibility shim: hand-constructed
 * objects, service clients, and tests use the same rules and the same plan
 * compiler as the container does.
 *
 * @typeParam T - The instance type.
 * @param instance - The object to advise.
 * @param rules - The rules to compile, or a registry holding them.
 * @returns The advised object — the instance itself under shadow weaving.
 *
 * @example
 * ```ts
 * const service = interceptMethods(new OrderService(), [
 *     { when: hasAnnotation(cached), use: new CacheInterceptor() },
 * ]);
 * ```
 */
export function interceptMethods<T extends object>(
    instance: T,
    rules: MethodInterceptorRegistry | readonly MethodInterceptorRule[]
): T {
    return weaveInstance(instance, rules).instance;
}

/**
 * Constructs and advises in one step.
 *
 * @typeParam T - The instance type.
 * @param target - The class to construct.
 * @param rules - The rules to compile, or a registry holding them.
 * @param args - Constructor arguments.
 * @returns The advised instance.
 *
 * @example
 * ```ts
 * const service = createIntercepted(OrderService, rules, 'us-east');
 * ```
 */
export function createIntercepted<T extends object>(
    target: new (...args: unknown[]) => T,
    rules: MethodInterceptorRegistry | readonly MethodInterceptorRule[],
    ...args: readonly unknown[]
): T {
    return interceptMethods(new target(...args), rules);
}

/**
 * The compiled plans for an instance without weaving it — useful for
 * diagnostics that report which methods would be advised.
 *
 * @param instance - The object to inspect.
 * @param rules - The rules to compile, or a registry holding them.
 * @param entryName - The container entry name; defaults to the class name.
 * @returns One plan per matched method.
 *
 * @example
 * ```ts
 * planFor();
 * ```
 */
export function planFor(
    instance: object,
    rules: MethodInterceptorRegistry | readonly MethodInterceptorRule[],
    entryName: string = entryNameOf(instance)
): MethodInterceptorPlan[] {
    const registered = rules instanceof MethodInterceptorRegistry ? rules.rules : rules;
    return compileInterceptorPlan(targetTypeOf(instance), entryName, enumerateMethodNames(instance), registered);
}
