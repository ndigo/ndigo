/**
 * Shadow weaving: advise methods by installing own wrappers on the instance.
 *
 * Each advised method gets a non-enumerable own property that runs the advice
 * chain and then applies the previously installed function with the instance
 * as receiver. Because the wrapper lives on the instance:
 *
 * - the instance keeps its identity — callers hold the same object they got
 *   from the container, so `===` checks, `instanceof`, and `WeakMap` keys all
 *   continue to work;
 * - self-invocation is advised — `this.other()` resolves the own wrapper
 *   first, so an advised method calling a sibling advised method runs the
 *   sibling's advice too;
 * - `#private` fields keep working — the wrapper is never the receiver, the
 *   instance is;
 * - only the advised surface changes — getters, fields, symbols, and
 *   unadvised prototype methods are untouched, so their identity and
 *   descriptor shape are unchanged.
 *
 * The strategy has a hard boundary: it must be able to define a property on
 * the instance. Non-extensible objects (frozen or sealed), own
 * non-configurable members, and function targets — whose method surface lives
 * on a shared prototype — cannot be shadowed and require the Proxy fallback.
 * See {@link canShadowWeave}.
 */
import type { MethodPlan } from './plan';
import { createAdviceWrapper } from './wrapper';
import { invokeChain } from './chain';
import type { MethodInvocation } from './interceptor';

/**
 * How an instance's methods were advised.
 *
 * - `shadow` — own wrappers installed; identity preserved, self-invocation
 *   advised.
 * - `proxy` — a `Proxy` stands in for the instance; identity is *not*
 *   preserved and self-invocation bypasses advice.
 * - `none` — nothing matched, the instance was returned unchanged.
 */
export type AdviceStrategy = 'shadow' | 'proxy' | 'none';

/**
 * Instances already shadow-woven by this module. Guards against double
 * wrapping: a second weave must not capture the first weave's wrappers.
 */
const SHADOW_WOVEN = new WeakSet<object>();

/**
 * The prototype object whose methods make up `instance`'s surface. Function
 * targets are class-shaped — their methods live on `.prototype` — while arrow
 * and bound functions have none.
 *
 * @param instance - The object to inspect.
 * @returns The method surface, or `undefined` when there is none.
 */
export function methodSurfaceOf(instance: object): object | undefined {
    if (typeof instance !== 'function') {
        return instance;
    }
    const prototype: unknown = (instance as Function).prototype;
    return typeof prototype === 'object' && prototype !== null ? prototype : undefined;
}

/**
 * The class that declares `instance`'s shape. A function target is its own
 * class; otherwise the prototype's constructor is used so a proxy-shaped
 * instance does not resolve to `Function` and lose its metadata.
 *
 * @param instance - The object to inspect.
 * @returns The declaring constructor.
 */
export function targetTypeOf(instance: object): Function {
    if (typeof instance === 'function') {
        return instance as Function;
    }
    const ctor = Object.getPrototypeOf(instance)?.constructor;
    return typeof ctor === 'function' ? ctor : Object;
}

/**
 * The entry name a standalone-woven instance is described under: its class
 * name, falling back to `'intercepted'`.
 *
 * @param instance - The object to describe.
 * @returns The entry name.
 */
export function entryNameOf(instance: object): string {
    const name = targetTypeOf(instance).name;
    return typeof name === 'string' && name.length > 0 && name !== 'Object' ? name : 'intercepted';
}

/**
 * String-named data methods on the instance's surface: the surface plus its
 * prototype chain, excluding `Object.prototype` and `constructor`.
 *
 * @param instance - The instance or prototype to enumerate.
 * @returns The method names, in discovery order.
 */
export function enumerateMethodNames(instance: object): readonly string[] {
    const surface = methodSurfaceOf(instance);
    if (surface === undefined) {
        return [];
    }

    const names = new Set<string>();
    let proto: object | null = surface;

    while (proto !== null && proto !== Object.prototype) {
        for (const name of Object.getOwnPropertyNames(proto)) {
            if (name !== 'constructor') {
                const descriptor = Object.getOwnPropertyDescriptor(proto, name);
                if (descriptor !== undefined && typeof descriptor.value === 'function') {
                    names.add(name);
                }
            }
        }
        proto = Object.getPrototypeOf(proto);
    }

    return [...names];
}

/**
 * Whether `instance` can be shadow-woven, and why not when it cannot.
 *
 * @param instance - The object to weave.
 * @param methodNames - The methods that matched at least one rule.
 * @returns `null` when shadow weaving is possible, otherwise the reason the
 *   Proxy fallback is required.
 *
 * @example
 * ```ts
 * if (shadowObstacle(instance, names) === null) shadowWeave(instance, plans);
 * ```
 */
export function shadowObstacle(instance: object, methodNames: readonly PropertyKey[]): string | null {
    if (typeof instance === 'function') {
        return 'function targets keep their method surface on a shared prototype';
    }

    if (!Object.isExtensible(instance)) {
        return 'the instance is frozen, sealed, or otherwise non-extensible';
    }

    for (const methodName of methodNames) {
        const own = Object.getOwnPropertyDescriptor(instance, methodName);
        if (own === undefined) {
            continue;
        }
        if (own.configurable !== true) {
            return `'${String(methodName)}' is an own non-configurable member`;
        }
        if (!('value' in own)) {
            return `'${String(methodName)}' is an own accessor`;
        }
    }

    return null;
}

/**
 * Whether `instance` was already shadow-woven.
 *
 * @param instance - The object to inspect.
 * @returns `true` when this module already installed wrappers on it.
 */
export function isShadowWoven(instance: object): boolean {
    return SHADOW_WOVEN.has(instance);
}

/**
 * Installs advice wrappers for the compiled plans on `instance`.
 *
 * Returns the instance unchanged: shadow weaving never replaces the object.
 * Calling it twice on the same instance is a no-op.
 *
 * Callers must check {@link shadowObstacle} first — this function throws when
 * the instance cannot accept own properties, because silently skipping
 * advice would be worse than failing loudly.
 *
 * @param instance - The object to advise; never replaced.
 * @param plans - The compiled per-method plans.
 * @returns The same instance.
 * @throws When the instance cannot be shadow-woven.
 *
 * @example
 * ```ts
 * shadowWeave(service, compileMethodPlan(Service, 'service', names, rules));
 * ```
 */
export function shadowWeave<T extends object>(instance: T, plans: readonly MethodPlan[]): T {
    if (SHADOW_WOVEN.has(instance) || plans.length === 0) {
        return instance;
    }

    const obstacle = shadowObstacle(
        instance,
        plans.map((plan) => plan.descriptor.methodName)
    );
    if (obstacle !== null) {
        throw new TypeError(`Cannot shadow-weave ${entryNameOf(instance)}: ${obstacle}.`);
    }

    for (const plan of plans) {
        const { descriptor, interceptors } = plan;
        const methodName = descriptor.methodName;
        // Capture the function the instance would have called *now*, before
        // any wrapper replaces it: a later weave must not capture an earlier
        // wrapper, and an instance field must not be lost to the prototype
        // method of the same name.
        const installed = Reflect.get(instance, methodName, instance);
        if (typeof installed !== 'function') {
            throw new TypeError(
                `Cannot shadow-weave ${entryNameOf(instance)}: '${String(methodName)}' is not a method.`
            );
        }

        // The descriptor half of the invocation is immutable per method —
        // build it once here, not per call.
        const base = { ...descriptor };
        const wrapper = createAdviceWrapper(installed, (...args: unknown[]): unknown => {
            const invocation: MethodInvocation = {
                ...base,
                target: instance,
                args,
            };
            return invokeChain(interceptors, invocation, () => Reflect.apply(installed, instance, args));
        });

        // Non-enumerable, matching the prototype method it shadows, so
        // enumeration and serialization see the same shape as before.
        Object.defineProperty(instance, methodName, {
            value: wrapper,
            writable: true,
            enumerable: false,
            configurable: true,
        });
    }

    SHADOW_WOVEN.add(instance);
    return instance;
}
