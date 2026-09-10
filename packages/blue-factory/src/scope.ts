import '@tsmetadata/polyfill';
import { IllegalStateError } from '@blue/core';

export type KnownScope = 'singleton' | 'prototype' | 'route' | 'hash';
export type PossibleScope = KnownScope | string;
export type ObjectFactory<T = unknown> = () => T;

export interface Scope {
    destroyValue(name: string): void;
    getValue<T = unknown>(name: string, objectFactory: ObjectFactory<T>): T;
}

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
    const ctorWithMeta = ctor as Function & { [Symbol.metadata]: Record<string, unknown> };
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
 * Decorator for hash/route scope (convenience factory)
 */
export const hashScope = scope('hash');

/**
 * Prototype scope implementation — creates a fresh instance on every `getValue()` call.
 *
 * @internal AD-6: This is an implementation detail of the scoped factory. Only the
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
 * @internal AD-6: Implementation detail — see {@link PrototypeScope} for rationale.
 */
export class HashScope implements Scope {
    #scopeMap: Map<string, Map<string, unknown>> = new Map<string, Map<string, unknown>>();
    #currentKey: string | null = null;

    endScope(key: string): void {
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

        const bucket = this.#scopeMap.get(this.#currentKey);
        if (bucket) {
            bucket.delete(name);
        }
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
 * @internal AD-6: Implementation detail — see {@link PrototypeScope} for rationale.
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
