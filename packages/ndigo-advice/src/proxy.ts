/**
 * Proxy weaving: the fallback for objects that cannot be shadow-woven.
 *
 * Shadow weaving is preferred because it preserves identity and advises
 * self-invocation. Some targets refuse own properties — frozen or sealed
 * instances, non-extensible objects, and function targets whose method
 * surface is a shared prototype. For those, a `Proxy` stands in.
 *
 * The trade-off is explicit and documented: the caller now holds a proxy, so
 * `===` against the original instance fails, `WeakMap` keys differ, and
 * `this.sibling()` inside a method resolves through the prototype (the proxy
 * is never the receiver), so self-invocation bypasses advice.
 */
import { invokeChain } from './chain';
import { enumerateMethodNames, methodSurfaceOf } from './shadow';
import type { MethodInvocation } from './interceptor';
import type { MethodPlan } from './plan';

/**
 * Wraps `target` in a `Proxy` that advises the compiled plans.
 *
 * Every other prototype method also receives a target-bound pass-through
 * wrapper: a raw `proxy.method()` call would set the proxy as receiver and
 * break that method's `#private` access. Non-method access — getters, fields,
 * symbols, later-added members — forwards to the target with the target as
 * receiver, so the proxy is never observed by code that is not advised.
 *
 * @param target - The instance the wrappers execute against.
 * @param plans - The compiled per-method plans.
 * @returns A proxy over `target`.
 */
export function weaveMethodProxy(target: object, plans: readonly MethodPlan[]): object {
    const byName = new Map<string, MethodPlan>();
    for (const plan of plans) {
        byName.set(String(plan.descriptor.methodName), plan);
    }

    // Every prototype method needs a target-bound wrapper, advised or not.
    const prototypeMethods = new Set(enumerateMethodNames(methodSurfaceOf(target) ?? target));

    // One wrapper per key, so `proxy.method === proxy.method` holds for
    // callers that capture method references.
    const wrappers = new Map<PropertyKey, Function>();

    const handler = {
        get(current: object, key: PropertyKey): unknown {
            if (typeof key === 'string' && (byName.has(key) || prototypeMethods.has(key))) {
                let wrapper = wrappers.get(key);
                if (wrapper === undefined) {
                    const installed = Reflect.get(current, key, current);
                    if (typeof installed === 'function') {
                        const plan = byName.get(key);
                        if (plan !== undefined) {
                            // The descriptor half of the invocation is
                            // immutable per method — build it once here.
                            const base = { ...plan.descriptor };
                            wrapper = (...args: unknown[]): unknown => {
                                const invocation: MethodInvocation = { ...base, target: current, args };
                                return invokeChain(plan.interceptors, invocation, () =>
                                    Reflect.apply(installed, current, args)
                                );
                            };
                        } else {
                            wrapper = (...args: unknown[]): unknown => Reflect.apply(installed, current, args);
                        }
                        wrappers.set(key, wrapper);
                    }
                }
                if (wrapper !== undefined) {
                    return wrapper;
                }
            }

            // Target-bound forwarding: getters, fields, later-added members,
            // and symbols execute against the real instance.
            return Reflect.get(current, key, current);
        },
    };

    return new Proxy(target, handler);
}
