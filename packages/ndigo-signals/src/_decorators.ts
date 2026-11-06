/**
 * Ndigo Signals decorator API.
 */
import {
    signal as _signal,
    computed as _computed,
    effect as _effect,
    type Signal,
    type ReadonlySignal,
} from '@preact/signals-core';

// ── Metadata storage ─────────────────────────────────────────────────────────
const signalMap = new WeakMap<object, Map<string | symbol, Signal>>();
const computedMap = new WeakMap<object, Map<string | symbol, ReadonlySignal>>();
const effectDisposers = new WeakMap<object, Array<() => void>>();

// Stores pending field data for @reactive to process
const pendingSignals = new WeakMap<object, Map<string | symbol, unknown>>();
const pendingEffects = new WeakMap<object, Array<() => void>>();

// The instance's teardown, kept out of the destroy/dispose wrappers so any
// wrapper (base class or @reactive subclass) still finds it, and so it runs at
// most once. See installLifecycleMethod.
const cleanupMap = new WeakMap<object, () => void>();

/** The reserved teardown method names @reactive installs. */
type LifecycleMethod = 'destroy' | 'dispose';

// Explains the two ways `@signal`/`@effect` metadata can stay pending: the
// declaring class lacks `@reactive`, or the member is declared in a subclass of
// a `@reactive` class (activation happens before subclass initializers run).
const REACTIVATION_HINT =
    'either the class is missing the @reactive class decorator, or the member is declared on a subclass ' +
    'of a @reactive class — decorators are not inherited, so every class that declares @signal/@effect ' +
    'members needs its own @reactive decorator.';

/**
 * Runs `instance`'s registered teardown at most once. The map entry is deleted
 * *before* the teardown runs, so a throwing disposer cannot make a later
 * `destroy()`/`dispose()` re-run it (or a concurrent one double-run it).
 */
function runCleanup(instance: object): void {
    const cleanup = cleanupMap.get(instance);
    if (cleanup === undefined) {
        return;
    }
    cleanupMap.delete(instance);
    cleanup();
}

/**
 * Installs (or re-points) the `destroy`/`dispose` wrapper on `instance`.
 *
 * The wrapper is *defined*, never assigned: a getter-only accessor inherited
 * from the prototype would make a plain assignment throw during construction,
 * while `Object.defineProperty` shadows it with an own data property instead.
 * It is non-enumerable so it stays invisible to enumeration/`JSON`, like the
 * prototype methods it replaces. The prior method (if any) is chained after
 * teardown, so a subclass `destroy` field/method keeps running.
 *
 * Guard: an own non-configurable property cannot be redefined — redefining it
 * would throw mid-construction — so it is left untouched.
 */
function installLifecycleMethod(instance: object, name: LifecycleMethod): void {
    const descriptor = Object.getOwnPropertyDescriptor(instance, name);
    if (descriptor !== undefined && !descriptor.configurable) {
        return;
    }

    // Resolve the method the wrapper chains into. An own data property is read
    // from its descriptor; anything else (including a getter-only accessor) is
    // read defensively so a throwing getter cannot break construction.
    let previous: unknown;
    if (descriptor !== undefined && 'value' in descriptor) {
        previous = descriptor.value;
    } else {
        try {
            previous = (instance as Record<string, unknown>)[name];
        } catch {
            previous = undefined;
        }
    }

    Object.defineProperty(instance, name, {
        value: function (this: object, ...args: unknown[]): unknown {
            runCleanup(instance);
            return typeof previous === 'function'
                ? (previous as (...callArgs: unknown[]) => unknown).apply(this, args)
                : undefined;
        },
        writable: true,
        enumerable: false,
        configurable: true,
    });
}

/**
 * Returns the backing `Signal` for a `@signal` field activated by `@reactive`,
 * or `undefined` when the field has no backing signal.
 *
 * Throws when the instance still carries pending `@signal`/`@effect` metadata:
 * the declaring class is missing the `@reactive` class decorator, or the member
 * was declared on a subclass of a `@reactive` class — `@reactive` only
 * activates members declared in its own class.
 */
export function getSignal<T>(instance: object, field: string): Signal<T> | undefined {
    // Anti-pattern detection (A2): a @signal/@effect field registered without
    // the @reactive class decorator is silently inert — the decorators store
    // pending metadata that never activates. Fail loudly instead of returning
    // undefined with a "working" appearance.
    const ctorName = (instance as object).constructor?.name ?? 'object';
    const pending = pendingSignals.get(instance);
    if (pending && pending.size > 0) {
        const names = [...pending.keys()].join(', ');
        throw new Error(
            pending.has(field)
                ? `@signal '${field}' is pending on an instance of ${ctorName} but was never activated — ${REACTIVATION_HINT}`
                : `@signal/@effect fields (${names}) are pending on an instance of ${ctorName} but were never activated — ${REACTIVATION_HINT}`
        );
    }
    const effectsPending = pendingEffects.get(instance);
    if (effectsPending && effectsPending.length > 0) {
        throw new Error(
            `@effect methods (${effectsPending.length}) are pending on an instance of ${ctorName} but were ` +
                `never activated — ${REACTIVATION_HINT}`
        );
    }
    return signalMap.get(instance)?.get(field) as Signal<T> | undefined;
}

// ── @signal ──────────────────────────────────────────────────────────────────

/**
 * Class field decorator that wraps the field with a reactive signal.
 *
 * Requires the `@reactive` class decorator on the class that declares the
 * field. Decorators are not inherited: a `@signal` field declared in a
 * subclass of a `@reactive` class stays a plain property — and `getSignal`
 * throws — unless the subclass is decorated with `@reactive` as well.
 */
export function signal<T extends object, V>(
    _target: undefined,
    context: ClassFieldDecoratorContext<T, V>
): (this: T, initialValue: V) => V {
    const fieldName = context.name as string;

    return function (this: T, initialValue: V): V {
        let map = pendingSignals.get(this);
        if (!map) {
            map = new Map();
            pendingSignals.set(this, map);
        }
        map.set(fieldName, initialValue);
        return initialValue;
    };
}

// ── @computed ────────────────────────────────────────────────────────────────

/**
 * Getter decorator that wraps the getter with a memoized computed signal.
 */
export function computed<T>(target: () => T, context: ClassGetterDecoratorContext<object, T>): () => T {
    const fieldName = context.name;

    return function (this: object): T {
        let map = computedMap.get(this);
        if (!map) {
            map = new Map();
            computedMap.set(this, map);
        }

        let sig = map.get(fieldName);
        if (!sig) {
            sig = _computed<T>(() => target.call(this));
            map.set(fieldName, sig);
        }
        return sig.value;
    };
}

// ── @effect ──────────────────────────────────────────────────────────────────

/**
 * Method decorator that wraps the method with a reactive effect.
 *
 * Requires the `@reactive` class decorator on the class that declares the
 * method. Decorators are not inherited: an `@effect` method declared in a
 * subclass of a `@reactive` class never runs unless the subclass is decorated
 * with `@reactive` as well.
 */
export function effect(target: (...args: unknown[]) => void, context: ClassMethodDecoratorContext<object>): void {
    // Store the method reference for @reactive to process
    context.addInitializer(function (this: object): void {
        let effects = pendingEffects.get(this);
        if (!effects) {
            effects = [];
            pendingEffects.set(this, effects);
        }
        effects.push(target.bind(this));
    });
}

// ── @reactive ────────────────────────────────────────────────────────────────

/**
 * Class decorator that activates the `@signal` and `@effect` members declared
 * on the decorated class.
 *
 * This decorator processes the signal/effect metadata stored by the
 * `@signal`, `@effect`, and `@computed` decorators. It creates the
 * signals, installs getter/setters, and wires up effects.
 *
 * Activation runs at the end of the decorated class's construction — before
 * subclass field initializers — so reactive members declared in subclasses are
 * not activated. Apply `@reactive` to every class in the hierarchy that
 * declares `@signal`/`@effect` members:
 *
 * ```ts
 * @reactive
 * class Counter {
 *     @signal count = 0;
 *     @computed get doubled() { return this.count * 2; }
 *     @effect log() { console.log(this.count); }
 * }
 *
 * @reactive
 * class NamedCounter extends Counter {
 *     @signal label = 'unnamed';
 * }
 * ```
 */
export function reactive<T extends new (...args: unknown[]) => object>(
    target: T,
    _context: ClassDecoratorContext<T>
): T {
    // TS2545 only allows a `class extends <type-var>` constructor to be written
    // as (...args: any[]), which is banned repo-wide. Widen the base to a concrete
    // constructor so the mixin can accept unknown[] args; the returned class
    // literally extends `target`, so it still is exactly `T` plus extra wiring.
    const Base: new (...args: unknown[]) => object = target;
    return class extends Base {
        constructor(...args: unknown[]) {
            super(...args);

            const instance = this as unknown as Record<string | symbol, unknown>;

            // ── Process @signal fields ─────────────────────────────────────────
            const sigs = pendingSignals.get(instance);
            if (sigs) {
                for (const [fieldName, initialValue] of sigs) {
                    const sig = _signal(initialValue);

                    let map = signalMap.get(instance);
                    if (!map) {
                        map = new Map();
                        signalMap.set(instance, map);
                    }
                    map.set(fieldName, sig);

                    Object.defineProperty(instance, fieldName, {
                        get(): unknown {
                            return sig.value;
                        },
                        set(v: unknown): void {
                            sig.value = v;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                }
                pendingSignals.delete(instance);
            }

            // ── Process @effect methods ────────────────────────────────────────
            const effects = pendingEffects.get(instance);
            if (effects) {
                for (const fn of effects) {
                    const dispose = _effect(() => fn());

                    let disposers = effectDisposers.get(instance);
                    if (!disposers) {
                        disposers = [];
                        effectDisposers.set(instance, disposers);
                    }
                    disposers.push(dispose);
                }
                pendingEffects.delete(instance);
            }

            // ── Cleanup ────────────────────────────────────────────────────────
            // Teardown lives in `cleanupMap` (not in the wrappers), so every
            // @reactive class in a hierarchy points at the same teardown and it
            // runs exactly once — even when a subclass re-installs the wrapper.
            cleanupMap.set(instance, (): void => {
                const disposers = effectDisposers.get(instance);
                if (disposers) {
                    for (const d of disposers) {
                        try {
                            d();
                        } catch {
                            /* ignore */
                        }
                    }
                    effectDisposers.delete(instance);
                }
                signalMap.delete(instance);
                computedMap.delete(instance);
            });

            installLifecycleMethod(instance, 'destroy');
            installLifecycleMethod(instance, 'dispose');
        }
    } as unknown as T;
}
