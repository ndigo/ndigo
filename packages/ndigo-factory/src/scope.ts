/**
 * Scope contracts and implementations.
 *
 * Scopes (`singleton`, `prototype`, `refresh`) control instance lifetime for
 * factory-managed objects; `RefreshScope` invalidates cached instances on
 * demand.
 *
 * @example
 * ```ts
 * const scope = new RefreshScope();
 * const value = scope.getValue('bean', () => new MyBean());
 * scope.clear();
 * ```
 */
import { toError } from '@ndigo/util';
import '@tsmetadata/polyfill';
import { annotationOf, classAnnotation, Constructable, ensureSymbolMetadata, IllegalStateError } from '@ndigo/core';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-factory:scope');

/**
 * Scope names shipped by the factory.
 *
 * @example
 * ```ts
 * type _Alias = KnownScope;
 * ```
 */
export type KnownScope = 'singleton' | 'prototype' | 'route' | 'hash' | 'refresh';

/**
 * Any scope name: a {@link KnownScope} or a custom registered scope.
 *
 * @example
 * ```ts
 * type _Alias = PossibleScope;
 * ```
 */
export type PossibleScope = KnownScope | string;

/**
 * Lazy factory callback invoked by a scope when it needs to create a value.
 *
 * @example
 * ```ts
 * type _Alias = ObjectFactory;
 * ```
 */
export type ObjectFactory<T = unknown> = () => T;

/**
 * A caching strategy: resolves named values through the supplied object
 * factory and can destroy cached values.
 *
 * @example
 * ```ts
 * const value = {} as Scope;
 * ```
 */
export interface Scope {
    /** Destroys a cached value. @param name - The value name. */
    destroyValue(name: string): void;
    /**
     * Resolves a named value through the object factory.
     *
     * @param name - The value name.
     * @param objectFactory - The lazy factory invoked on a miss.
     * @returns The cached or newly created value.
     */
    getValue<T = unknown>(name: string, objectFactory: ObjectFactory<T>): T;
}

/**
 * A factory that exposes named {@link Scope} strategies and destroys scoped values.
 *
 * @example
 * ```ts
 * const value = {} as ScopedFactory;
 * ```
 */
export interface ScopedFactory {
    /** Destroys a scoped value. @param scopeName - The scope. @param valueName - The value name. */
    destroyScopedValue(scopeName: string, valueName: string): void;
    /** Returns a registered scope. @param name - The scope name. */
    getScope(name: string): Scope;
    /** Returns the registered scope names. @returns The scope names. */
    getScopeNames(): PossibleScope[];
    /** Registers a scope. @param name - The scope name. @param scope - The scope strategy. */
    registerScope(name: string, scope: Scope): void;
}

/**
 * `@scope` annotation key: the scope name declared for a class.
 */
const scopeMapping = classAnnotation<PossibleScope>('scope:mapping');

/**
 * Defines scope metadata on a class
 * @param value - - Scope name
 * @param target - - Class constructor
 */
export const defineScope = (value: PossibleScope, target: unknown): void => {
    ensureSymbolMetadata(target)[scopeMapping.key] = value;
};

/**
 * Retrieves scope metadata from a class or instance
 * @param target - - Class constructor or instance
 * @returns Scope name or undefined
 */
export const getScope = (target: unknown): PossibleScope | undefined => {
    return annotationOf(target, scopeMapping);
};

/**
 * Checks if target has scope metadata
 * @param target - - Class constructor or instance
 * @returns Whether or not the target has a scope mapping defined
 */
export const hasScope = (target: unknown): boolean => {
    return annotationOf(target, scopeMapping) !== undefined;
};

/**
 * TC39 decorator for defining scope on a class
 * @param scopeName - - The scope name (singleton, prototype, route, etc.)
 * @returns TC39 class decorator
 *
 * @example
 * ```ts
 * scope();
 * ```
 */
export function scope(scopeName: PossibleScope) {
    return function <T extends Constructable<unknown>>(target: T, context: ClassDecoratorContext): T {
        scopeMapping(scopeName)(target, context);

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
 * ends (`HashScope.endScope`) or the entry is destroyed (`destroyValue`).
 */
export const hashScope = scope('hash');

/**
 * Decorator for refresh scope (convenience factory): the instance cache is
 * cleared when the environment refreshes (`config:refresh`), so
 * the next `getValue` re-creates the instance from its factory.
 */
export const refreshScope = scope('refresh');

/**
 * Prototype scope implementation — creates a fresh instance on every `getValue()` call.
 *
 * @internal This is an implementation detail of the scoped factory. Only the
 * {@link Scope} and {@link ScopedFactory} interfaces are part of the stable public API.
 * A future scoping split may move concrete scope implementations to a separate module.
 *
 * @example
 * ```ts
 * const instance = new PrototypeScope();
 * ```
 */
export class PrototypeScope implements Scope {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "PrototypeScope".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object PrototypeScope]"
     */
    get [Symbol.toStringTag](): string {
        return 'PrototypeScope';
    }

    /**
     * No-op: prototype values are not cached.
     *
     * @param _name - The value name (unused).
     */
    destroyValue(_name: string): void {
        // Intentionally no-op. Prototype values are not cached/tracked.
    }

    /**
     * Creates a fresh instance on every call.
     *
     * @param _name - The value name (unused).
     * @param objectFactory - The factory to invoke.
     * @returns A new value.
     */
    getValue<T = unknown>(_name: string, objectFactory: ObjectFactory<T>): T {
        return objectFactory();
    }
}

/**
 * Hash (route) scope implementation — one instance per scope key.
 * Activate a scope context by calling `setCurrentKey(key)` before `getValue()`.
 *
 * Values are cached per key, so a route-scoped entry lives as long as its
 * bucket: `destroyValue(name)` tears one down within the active key, and
 * `endScope(key)` tears down the whole bucket. Lifecycle-bearing values
 * (`@destroyable`/`@closeable`) register a destruction callback (see
 * `registerDestructionCallback`, wired by the container) which runs before the
 * value is discarded — mirroring `SingletonScope.destroyValue` and
 * `RefreshScope.clear`.
 *
 * @internal Implementation detail — see {@link PrototypeScope} for rationale.
 *
 * @example
 * ```ts
 * const instance = new HashScope();
 * ```
 */
export class HashScope implements Scope {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "HashScope".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object HashScope]"
     */
    get [Symbol.toStringTag](): string {
        return 'HashScope';
    }

    #scopeMap: Map<string, Map<string, unknown>> = new Map<string, Map<string, unknown>>();
    #destructionCallbacks: Map<string, Map<string, () => void>> = new Map<string, Map<string, () => void>>();
    #currentKey: string | null = null;

    /**
     * Ends the scope identified by `key`: runs every registered destruction
     * callback in reverse registration (= creation) order — teardown mirrors
     * construction — then discards the key's bucket. Callbacks are best
     * effort: a throwing callback is logged and never aborts the sweep, so no
     * stale bucket survives `endScope`.
     *
     * @param key - The scope key to end.
     */
    endScope(key: string): void {
        const callbacks = this.#destructionCallbacks.get(key);
        if (callbacks) {
            const entries = [...callbacks];
            for (let index = entries.length - 1; index >= 0; index--) {
                const [name, callback] = entries[index];
                try {
                    callback();
                } catch (error) {
                    logger.error(
                        `HashScope destruction callback for "${name}" failed during endScope("${key}"):`,
                        toError(error)
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

    /**
     * The active hash-scope key.
     *
     * @returns The current key, or `null`.
     */
    getCurrentKey(): string | null {
        return this.#currentKey;
    }

    /**
     * Activates a hash-scope key.
     *
     * @param key - The scope key.
     */
    setCurrentKey(key: string): void {
        this.#currentKey = key;

        if (!this.#scopeMap.has(key)) {
            this.#scopeMap.set(key, new Map<string, unknown>());
        }
    }

    /**
     * Destroys a value in the active hash-scope bucket.
     *
     * @param name - The value name.
     */
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
     *
     * @param name - The value name.
     * @param callback - The teardown callback.
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

    /**
     * Resolves a value in the active hash-scope bucket.
     *
     * @param name - The value name.
     * @param objectFactory - The lazy factory invoked on a miss.
     * @returns The cached or newly created value.
     */
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
 * @internal Implementation detail — see {@link PrototypeScope} for rationale.
 *
 * @example
 * ```ts
 * const instance = new SingletonScope();
 * ```
 */
export class SingletonScope implements Scope {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "SingletonScope".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object SingletonScope]"
     */
    get [Symbol.toStringTag](): string {
        return 'SingletonScope';
    }

    #instances: Map<string, unknown> = new Map<string, unknown>();
    #destructionCallbacks: Map<string, () => void> = new Map<string, () => void>();

    /**
     * Destroys a cached value.
     *
     * @param name - The value name.
     */
    destroyValue(name: string): void {
        const callback = this.#destructionCallbacks.get(name);

        if (callback) {
            callback();
            this.#destructionCallbacks.delete(name);
        }

        this.#instances.delete(name);
    }

    /**
     * Resolves a cached value, creating it on a miss.
     *
     * @param name - The value name.
     * @param objectFactory - The lazy factory invoked on a miss.
     * @returns The cached or newly created value.
     */
    getValue<T = unknown>(name: string, objectFactory: ObjectFactory<T>): T {
        if (!this.#instances.has(name)) {
            this.#instances.set(name, objectFactory());
        }

        return this.#instances.get(name) as T;
    }

    /**
     * Registers a teardown callback for a value.
     *
     * @param name - The value name.
     * @param callback - The teardown callback.
     */
    registerDestructionCallback(name: string, callback: () => void): void {
        this.#destructionCallbacks.set(name, callback);
    }
}

/**
 * Refresh scope implementation — one cached instance per named value, like
 * {@link SingletonScope}, but the whole cache is cleared when the owning
 * context's environment refreshes (`config:refresh` event): the
 * next `getValue` re-creates the instance from its factory.
 *
 * Destruction callbacks are registered by the container for managed values;
 * `clear()` runs them before discarding, so destruction processors and
 * `destroy()` run for each value (mirrors `SingletonScope.destroyValue`).
 *
 * @internal Implementation detail — see {@link PrototypeScope} for rationale.
 *
 * @example
 * ```ts
 * const instance = new RefreshScope();
 * ```
 */
export class RefreshScope implements Scope {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "RefreshScope".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object RefreshScope]"
     */
    get [Symbol.toStringTag](): string {
        return 'RefreshScope';
    }

    #instances: Map<string, unknown> = new Map<string, unknown>();
    #destructionCallbacks: Map<string, () => void> = new Map<string, () => void>();

    /**
     * Destroys a cached value.
     *
     * @param name - The value name.
     */
    destroyValue(name: string): void {
        const callback = this.#destructionCallbacks.get(name);

        if (callback) {
            callback();
            this.#destructionCallbacks.delete(name);
        }

        this.#instances.delete(name);
    }

    /**
     * Resolves a cached value, creating it on a miss.
     *
     * @param name - The value name.
     * @param objectFactory - The lazy factory invoked on a miss.
     * @returns The cached or newly created value.
     */
    getValue<T = unknown>(name: string, objectFactory: ObjectFactory<T>): T {
        if (!this.#instances.has(name)) {
            this.#instances.set(name, objectFactory());
        }

        return this.#instances.get(name) as T;
    }

    /**
     * Registers a teardown callback for a value.
     *
     * @param name - The value name.
     * @param callback - The teardown callback.
     */
    registerDestructionCallback(name: string, callback: () => void): void {
        this.#destructionCallbacks.set(name, callback);
    }

    /**
     * Clears every cached instance, running registered destruction callbacks
     * (lifecycle teardown), so the next `getValue` recreates fresh.
     *
     * The instance map is cleared FIRST so a throwing destruction callback
     * can never leave a stale instance cached — `clear()` is the refresh
     * teardown edge and must always complete. Callbacks run in reverse
     * registration (= creation) order: teardown mirrors construction. They
     * are best effort: each failure is reported via the logger and never
     * aborts the sweep.
     */
    clear(): void {
        this.#instances.clear();
        const entries = [...this.#destructionCallbacks];
        for (let index = entries.length - 1; index >= 0; index--) {
            const [name, callback] = entries[index];
            try {
                callback();
            } catch (error) {
                logger.error(`RefreshScope destruction callback for "${name}" failed during clear():`, toError(error));
            }
            this.#destructionCallbacks.delete(name);
        }
    }
}
