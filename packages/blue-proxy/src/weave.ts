/**
 * @module blue-proxy
 * @since 1.0.0
 * @author Jeff Rose
 * Proxy weaving for `@blue/proxy`.
 *
 * One `Proxy` per advised entry with a single `get` trap:
 *
 * - intercepted keys resolve through a per-key cached wrapper that runs the
 *   interceptor chain and invokes the installed method on the real target as
 *   receiver (`this`) — so `#private` fields work and self-invocation
 *   bypasses advice (the documented target-bound boundary).
 * - every *other* prototype method gets the same target-bound treatment as a
 *   pass-through wrapper: advice must only apply to matched methods, but
 *   sibling methods must still execute against the real instance — a raw
 *   `proxy.method()` call would break their `#private` access.
 * - non-method access (getters, fields, later-added members, symbols)
 *   forwards to the target with the target as receiver, so the proxy itself
 *   is never observed by non-intercepted code.
 */
import { invokeChain, sortInterceptors } from './chain';
import {
    createMethodDescriptor,
    type MethodDescriptor,
    type MethodInterceptor,
    type MethodInvocation,
} from './interceptor';

/**
 * One method to intercept on a target: its static descriptor plus the
 * pre-matched, pre-sorted interceptor chain.
 */
export interface MethodChainSpec {
    readonly descriptor: MethodDescriptor;
    readonly interceptors: readonly MethodInterceptor[];
}

/**
 * Instances this package has already woven. A second pass (duplicate
 * processor registration, entry re-processing, or double
 * `interceptMethods(...)`) must return the proxy unchanged.
 */
const INTERCEPTED = new WeakSet<object>();

/**
 * Whether the instance was already woven by this package. Guards against
 * double-wrapping when processing runs twice.
 */
export function isIntercepted(instance: object): boolean {
    return INTERCEPTED.has(instance);
}

/**
 * The prototype object whose methods make up `instance`'s surface. Proxies
 * over a class — service clients (`serviceClient(API, http)`) — are
 * function-typed and their declared methods live on the class's `.prototype`
 * (`ResilientAPI.prototype`), not on the proxy's own chain
 * (`Function.prototype`).
 */
function methodSurfaceOf(instance: object): object {
    return typeof instance === 'function' ? (instance as Function).prototype : instance;
}

/**
 * The class that declares `instance`'s prototype shape, resolved
 * proxy-tolerantly. A class-targeted proxy IS its own class; otherwise the
 * prototype's `constructor` is used (the instance's own `constructor` chain
 * would resolve to `Function` for proxies and lose the metadata).
 */
function classOf(instance: object): Function {
    if (typeof instance === 'function') {
        return instance as Function;
    }
    const ctor = Object.getPrototypeOf(instance)?.constructor;
    return typeof ctor === 'function' ? ctor : Object;
}

/**
 * Derives the entry name a standalone-woven instance is described under:
 * its class name (proxy-tolerant {@link classOf}), falling back to
 * `'intercepted'`.
 */
function entryNameOf(instance: object): string {
    const name = classOf(instance).name;
    return typeof name === 'string' && name.length > 0 && name !== 'Object' ? name : 'intercepted';
}

/**
 * Enumerates the instance's prototype methods, builds a descriptor per
 * method, and keeps the ones at least one interceptor matches. Shared by the
 * container processor and standalone {@link interceptMethods} so both weave
 * the same method set.
 *
 * Interceptors are sorted once per entry by {@link sortInterceptors} (missing
 * order counts as 0; ties keep registration order) — the `order` contract
 * holds on every path.
 */
export function collectMethodSpecs(
    instance: object,
    entryName: string,
    interceptors: readonly MethodInterceptor[]
): MethodChainSpec[] {
    const targetType = classOf(instance);
    const surface = methodSurfaceOf(instance);
    const ordered = sortInterceptors(interceptors);

    const specs: MethodChainSpec[] = [];
    for (const methodName of enumeratePrototypeMethods(surface)) {
        const descriptor = createMethodDescriptor(targetType, entryName, methodName);
        const matched = ordered.filter((interceptor) => interceptor.matches(descriptor));
        if (matched.length > 0) {
            specs.push({ descriptor, interceptors: matched });
        }
    }
    return specs;
}

/**
 * Weaves `target` and records the result as intercepted — the single
 * registration point for the double-wrap guard, shared by the container
 * processor and standalone {@link interceptMethods}.
 */
export function interceptAndRegister(target: object, specs: readonly MethodChainSpec[]): object {
    const proxy = weaveMethodProxy(target, specs);
    INTERCEPTED.add(proxy);
    return proxy;
}

/**
 * Standalone weaving: returns a proxy over `instance` intercepting every
 * method an interceptor matches — no container required (AD-43 D-6).
 *
 * Service clients and other hand-constructed objects use this where factory
 * processors (`interception(...)`) cannot see them. The instance is
 * described under its constructor name.
 *
 * @param instance - The object to advise.
 * @param interceptors - The advice to apply (matched per method).
 * @returns A woven proxy, or `instance` itself when nothing matches or it
 *   was already intercepted.
 */
export function interceptMethods<T extends object>(instance: T, interceptors: readonly MethodInterceptor[]): T {
    if (INTERCEPTED.has(instance)) {
        return instance;
    }

    const specs = collectMethodSpecs(instance, entryNameOf(instance), interceptors);
    if (specs.length === 0) {
        return instance;
    }

    return interceptAndRegister(instance, specs) as T;
}

/**
 * String method names defined as data properties on the target's surface:
 * the target itself plus its prototype chain (excluding `Object.prototype`
 * and `constructor`). For instances the surface walk is the class prototype
 * chain above them; for class prototypes (service-client surfaces) it starts
 * on the prototype itself. The processor and the weaver must agree on this
 * enumeration so interception and target-binding cover the same method set.
 */
export function enumeratePrototypeMethods(target: object): readonly string[] {
    const names = new Set<string>();
    let proto: object | null = target;

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
 * Wraps `target` in a proxy intercepting the given method specs.
 *
 * Returns `target` unchanged when `specs` is empty — nothing to advise means
 * no proxy, so unadvised entries keep their identity.
 *
 * @param target - The original instance; always the `this` of installed
 *   methods and getters.
 * @param specs - Per-method interception specs (method names must be strings).
 * @returns A proxy, or `target` itself when there is nothing to intercept.
 */
export function weaveMethodProxy(target: object, specs: readonly MethodChainSpec[]): object {
    if (specs.length === 0) {
        return target;
    }

    const chains = new Map<string, MethodChainSpec>();
    for (const spec of specs) {
        chains.set(String(spec.descriptor.methodName), spec);
    }

    // Prototype methods that need target-bound pass-through wrappers.
    const prototypeMethods = new Set(enumeratePrototypeMethods(methodSurfaceOf(target)));

    // Wrapper per key, so `proxy.method === proxy.method` holds for callers
    // that capture method references.
    const wrappers = new Map<PropertyKey, Function>();

    const handler = {
        get(current: object, key: PropertyKey) {
            if (typeof key === 'string') {
                const spec = chains.get(key);
                if (spec !== undefined || prototypeMethods.has(key)) {
                    let wrapper = wrappers.get(key);
                    if (wrapper === undefined) {
                        const installed = Reflect.get(current, key, current);
                        if (typeof installed === 'function') {
                            if (spec !== undefined) {
                                // The descriptor half of the invocation is
                                // immutable per method — spread it once here,
                                // not per call.
                                const base = { ...spec.descriptor };
                                wrapper = (...args: unknown[]) => {
                                    const invocation: MethodInvocation = {
                                        ...base,
                                        target: current,
                                        args,
                                    };
                                    return invokeChain(spec.interceptors, invocation, () =>
                                        Reflect.apply(installed, current, args)
                                    );
                                };
                            } else {
                                wrapper = (...args: unknown[]) => Reflect.apply(installed, current, args);
                            }
                            wrappers.set(key, wrapper);
                        }
                    }
                    if (wrapper !== undefined) {
                        return wrapper;
                    }
                }
            }

            // Target-bound forwarding: getters, fields, later-added members,
            // and symbols execute against the real instance.
            return Reflect.get(current, key, current);
        },
    };

    return new Proxy(target, handler);
}
