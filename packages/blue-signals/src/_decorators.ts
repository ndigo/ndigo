/**
 * @author Jeff Rose
 *
 * Blue Signals decorator API.
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

export function getSignal<T>(instance: object, field: string): Signal<T> | undefined {
    return signalMap.get(instance)?.get(field) as Signal<T> | undefined;
}

// ── @signal ──────────────────────────────────────────────────────────────────

/**
 * Class field decorator that wraps the field with a reactive signal.
 *
 * Requires the `@reactive` class decorator to be applied to the class.
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
 * Requires the `@reactive` class decorator to be applied to the class.
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
 * Class decorator that activates all `@signal` and `@effect` decorators.
 *
 * This decorator processes the signal/effect metadata stored by the
 * `@signal`, `@effect`, and `@computed` decorators. It creates the
 * signals, installs getter/setters, and wires up effects.
 *
 * ```ts
 * @reactive
 * class Counter {
 *     @signal count = 0;
 *     @computed get doubled() { return this.count * 2; }
 *     @effect log() { console.log(this.count); }
 * }
 * ```
 */
export function reactive<T extends new (...args: any[]) => object>(target: T, _context: ClassDecoratorContext<T>): T {
    return class extends target {
        constructor(...args: any[]) {
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
            const origDestroy = instance.destroy as (() => void) | undefined;
            const origDispose = instance.dispose as (() => void) | undefined;

            const cleanup = (): void => {
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
            };

            instance.destroy = (): void => {
                cleanup();
                origDestroy?.call(instance);
            };
            instance.dispose = (): void => {
                cleanup();
                origDispose?.call(instance);
            };
        }
    };
}
