/**
 * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { IllegalStateError } from '@blue/core';
import { getLogger } from '@blue/log';

const logger = getLogger('blue-factory:scope');

/**
 * Scope names shipped by the factory.
 */
export type KnownScope = 'singleton' | 'prototype' | 'route' | 'hash' | 'refresh';

/**
 * Any scope name: a {@link KnownScope} or a custom registered scope.
 */
export type PossibleScope = KnownScope | string;

/**
 * Lazy factory callback invoked by a scope when it needs to create a value.
 */
export type ObjectFactory<T = unknown> = () => T;

/**
 * A caching strategy: resolves named values through the supplied object
 * factory and can destroy cached values.
 */
export interface Scope {
    destroyValue(name: string): void;
    getValue<T = unknown>(name: string, objectFactory: ObjectFactory<T>): T;
}

/**
 * A factory that exposes named {@link Scope} strategies and destroys scoped values.
 */
export interface ScopedFactory {
    destroyScopedValue(scopeName: string, valueName: string): void;
    getScope(name: string): Scope;
    getScopeNames(): PossibleScope[];
    registerScope(name: string, scope: Scope): void;
}

const SCOPE_KEY = 'scope:mapping';

const getConstructor = (target: unknown): (Function & { [Symbol.metadata]?: Record<string, unknown> }) | undefined => {
    if (typeof target === 'function') {
        return target as Function & { [Symbol.metadata]?: Record<string, unknown> };
    }
    return (target as object | undefined)?.constructor as
        | (Function & { [Symbol.metadata]?: Record<string, unknown> })
        | undefined;
};

/**
 * Defines scope metadata on a class
 * @param {*} value - Scope name
 * @param {*} target - Class constructor
 */
export const defineScope = (value: PossibleScope, target: unknown): void => {
    const ctor = getConstructor(target);
    if (!ctor) return;

    // Trust: ctor has Symbol.metadata from @tsmetadata/polyfill at runtime.
    // The TS Function type doesn't declare it — this cast is needed.
    const ctorWithMeta = ctor as Function & {
        [Symbol.metadata]: Record<string, unknown>;
    };
    if (!ctorWithMeta[Symbol.metadata]) {
        ctorWithMeta[Symbol.metadata] = {};
    }
    ctorWithMeta[Symbol.metadata][SCOPE_KEY] = value;
};

/**
 * Retrieves scope metadata from a class or instance
 * @param {*} target - Class constructor or instance
 * @returns {*} Scope name or undefined
 */
export const getScope = (target: unknown): PossibleScope | undefined => {
    const ctor = getConstructor(target);
    return ctor?.[Symbol.metadata]?.[SCOPE_KEY] as PossibleScope | undefined;
};

/**
 * Checks if target has scope metadata
 * @param {*} target - Class constructor or instance
 * @returns {boolean} Whether or not the target has a scope mapping defined
 */
export const hasScope = (target: unknown): boolean => {
    const ctor = getConstructor(target);
    return ctor?.[Symbol.metadata]?.[SCOPE_KEY] !== undefined;
};

/**
 * TC39 decorator for defining scope on a class
 * @param {string} scopeName - The scope name (singleton, prototype, route, etc.)
 * @returns {ClassDecorator} TC39 class decorator
 */
export function scope(scopeName: PossibleScope) {
    return function <T extends new (...args: never[]) => unknown>(target: T, context: ClassDecoratorContext): T {
        // Store scope in TC39 metadata
        context.metadata[SCOPE_KEY] = scopeName;

        return target;
    };
}

/**
 * Decorator for singleton scope (convenience factory)
 */
export const singletonScope = scope('singleton');

/**
 * Decorator for prototype scope (convenience factory)
 */
export const prototypeScope = scope('prototype');

/**
 * Decorator for hash/route scope (convenience factory): one cached instance
 * per active scope key (`HashScope.setCurrentKey`), torn down when the route
 * ends (`HashScope.endScope`) or the bean is destroyed (`destroyValue`).
 */
export const hashScope = scope('hash');

/**
 * Decorator for refresh scope (convenience factory): the instance cache is
 * cleared when the environment refreshes (`config:refresh`, AD-29 D-2), so
 * the next `getValue` re-creates the instance from its factory.
 */
export const refreshScope = scope('refresh');

/**
 * Prototype scope implementation — creates a fresh instance on every `getValue()` call.
 *
 * @internal AD-06: This is an implementation detail of the scoped factory. Only the
 * {@link Scope} and {@link ScopedFactory} interfaces are part of the stable public API.
 * A future scoping split may move concrete scope implementations to a separate module.
 */
export class PrototypeScope implements Scope {
    destroyValue(_name: string): void {
        // Intentionally no-op. Prototype values are not cached/tracked.
    }

    getValue<T = unknown>(_name: string, objectFactory: ObjectFactory<T>): T {
        return objectFactory();
    }
}

/**
 * Hash (route) scope implementation — one instance per scope key.
 * Activate a scope context by calling `setCurrentKey(key)` before `getValue()`.
 *
 * Values are cached per key, so a route-scoped bean lives as long as its
 * bucket: `destroyValue(name)` tears one down within the active key, and
 * `endScope(key)` tears down the whole bucket. Lifecycle-bearing values
 * (`@destroyable`/`@closeable`) register a destruction callback (see
 * `registerDestructionCallback`, wired by the container) which runs before the
 * value is discarded — mirroring `SingletonScope.destroyValue` and
 * `RefreshScope.clear`.
 *
 * @internal AD-06: Implementation detail — see {@link PrototypeScope} for rationale.
 */
export class HashScope implements Scope {
    #scopeMap: Map<string, Map<string, unknown>> = new Map<string, Map<string, unknown>>();
    #destructionCallbacks: Map<string, Map<string, () => void>> = new Map<string, Map<string, () => void>>();
    #currentKey: string | null = null;

    /**
     * Ends the scope identified by `key`: runs every registered destruction
     * callback, then discards the key's bucket. Callbacks are best effort —
     * a throwing callback is logged and never aborts the sweep, so no stale
     * bucket survives `endScope`.
     */
    endScope(key: string): void {
        const callbacks = this.#destructionCallbacks.get(key);
        if (callbacks) {
            for (const [name, callback] of callbacks) {
                try {
                    callback();
                } catch (error) {
                    logger.error(
                        `HashScope destruction callback for "${name}" failed during endScope("${key}"):`,
                        error instanceof Error ? error : String(error)
                    );
                }
            }
            this.#destructionCallbacks.delete(key);
        }
        this.#scopeMap.delete(key);
        if (this.#currentKey === key) {
            this.#currentKey = null;
        }
    }

    getCurrentKey(): string | null {
        return this.#currentKey;
    }

    setCurrentKey(key: string): void {
        this.#currentKey = key;

        if (!this.#scopeMap.has(key)) {
            this.#scopeMap.set(key, new Map<string, unknown>());
        }
    }

    destroyValue(name: string): void {
        if (!this.#currentKey) {
            throw new IllegalStateError('No active hash scope context. Call setCurrentKey() first.');
        }

        const callback = this.#destructionCallbacks.get(this.#currentKey)?.get(name);
        if (callback) {
            callback();
            this.#destructionCallbacks.get(this.#currentKey)?.delete(name);
        }

        const bucket = this.#scopeMap.get(this.#currentKey);
        if (bucket) {
            bucket.delete(name);
        }
    }

    /**
     * Registers a destruction callback for `name` within the active key's
     * bucket; `destroyValue`/`endScope` run it before discarding the value.
     */
    registerDestructionCallback(name: string, callback: () => void): void {
        if (!this.#currentKey) {
            throw new IllegalStateError('No active hash scope context. Call setCurrentKey() first.');
        }

        let callbacks = this.#destructionCallbacks.get(this.#currentKey);
        if (!callbacks) {
            callbacks = new Map<string, () => void>();
            this.#destructionCallbacks.set(this.#currentKey, callbacks);
        }
        callbacks.set(name, callback);
    }

    getValue<T = unknown>(name: string, objectFactory: ObjectFactory<T>): T {
        if (!this.#currentKey) {
            throw new IllegalStateError('No active hash scope context. Call setCurrentKey() first.');
        }

        const bucket = this.#scopeMap.get(this.#currentKey);
        if (!bucket) {
            throw new IllegalStateError('No active hash scope context. Call setCurrentKey() first.');
        }

        if (!bucket.has(name)) {
            bucket.set(name, objectFactory());
        }

        return bucket.get(name) as T;
    }
}

/**
 * Singleton scope implementation — creates at most one instance per named value.
 * Destruction callbacks can be registered when an instance is created.
 *
 * @internal AD-06: Implementation detail — see {@link PrototypeScope} for rationale.
 */
export class SingletonScope implements Scope {
    #instances: Map<string, unknown> = new Map<string, unknown>();
    #destructionCallbacks: Map<string, () => void> = new Map<string, () => void>();

    destroyValue(name: string): void {
        const callback = this.#destructionCallbacks.get(name);

        if (callback) {
            callback();
            this.#destructionCallbacks.delete(name);
        }

        this.#instances.delete(name);
    }

    getValue<T = unknown>(name: string, objectFactory: ObjectFactory<T>): T {
        if (!this.#instances.has(name)) {
            this.#instances.set(name, objectFactory());
        }

        return this.#instances.get(name) as T;
    }

    registerDestructionCallback(name: string, callback: () => void): void {
        this.#destructionCallbacks.set(name, callback);
    }
}

/**
 * Refresh scope implementation — one cached instance per named value, like
 * {@link SingletonScope}, but the whole cache is cleared when the owning
 * context's environment refreshes (`config:refresh` event, AD-29 D-2): the
 * next `getValue` re-creates the instance from its factory.
 *
 * Destruction callbacks are registered by the container for lifecycle-bearing
 * values; `clear()` runs them before discarding so `@destroyable`/`@closeable`
 * values tear down properly (mirrors `SingletonScope.destroyValue`).
 *
 * @internal AD-06: Implementation detail — see {@link PrototypeScope} for rationale.
 */
export class RefreshScope implements Scope {
    #instances: Map<string, unknown> = new Map<string, unknown>();
    #destructionCallbacks: Map<string, () => void> = new Map<string, () => void>();

    destroyValue(name: string): void {
        const callback = this.#destructionCallbacks.get(name);

        if (callback) {
            callback();
            this.#destructionCallbacks.delete(name);
        }

        this.#instances.delete(name);
    }

    getValue<T = unknown>(name: string, objectFactory: ObjectFactory<T>): T {
        if (!this.#instances.has(name)) {
            this.#instances.set(name, objectFactory());
        }

        return this.#instances.get(name) as T;
    }

    registerDestructionCallback(name: string, callback: () => void): void {
        this.#destructionCallbacks.set(name, callback);
    }

    /**
     * Clears every cached instance, running registered destruction callbacks
     * (lifecycle teardown), so the next `getValue` recreates fresh.
     *
     * The instance map is cleared FIRST so a throwing destruction callback
     * can never leave a stale instance cached — `clear()` is the refresh
     * teardown edge (ARC-1) and must always complete. Callbacks are best
     * effort: each failure is reported via the logger and never
     * aborts the sweep.
     */
    clear(): void {
        this.#instances.clear();
        for (const [name, callback] of this.#destructionCallbacks) {
            try {
                callback();
            } catch (error) {
                logger.error(
                    `RefreshScope destruction callback for "${name}" failed during clear():`,
                    error instanceof Error ? error : String(error)
                );
            }
            this.#destructionCallbacks.delete(name);
        }
    }
}
