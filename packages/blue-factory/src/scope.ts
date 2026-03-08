/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { IllegalStateError } from '@blue/core';

export type KnownScope = 'singleton' | 'prototype' | 'route' | 'hash';
export type PossibleScope = KnownScope | string;
export type ObjectFactory<T = any> = () => T;

export interface Scope {
    destroyValue(name: string): void;
    getValue<T = any>(name: string, objectFactory: ObjectFactory<T>): T;
}

export interface ScopedFactory {
    destroyScopedValue(scopeName: string, valueName: string): void;
    getScope(name: string): Scope;
    getScopeNames(): PossibleScope[];
    registerScope(name: string, scope: Scope): void;
}

const SCOPE_KEY = 'scope:mapping';

/**
 * Helper function to get constructor from class or instance
 * @param {*} target - Class constructor or instance
 * @returns {Function} Constructor function
 */
const getConstructor = (target: any): any => {
    return typeof target === 'function' ? target : target?.constructor;
};

/**
 * Defines scope metadata on a class
 * @param {*} value - Scope name
 * @param {*} target - Class constructor
 */
export const defineScope = (value: PossibleScope, target: any): void => {
    const ctor = getConstructor(target);
    if (!ctor) return;

    // Ensure metadata object exists
    if (!ctor[Symbol.metadata]) {
        ctor[Symbol.metadata] = {};
    }

    ctor[Symbol.metadata][SCOPE_KEY] = value;
};

/**
 * Retrieves scope metadata from a class or instance
 * @param {*} target - Class constructor or instance
 * @returns {*} Scope name or undefined
 */
export const getScope = (target: any): PossibleScope | undefined => {
    const ctor = getConstructor(target);
    return ctor?.[Symbol.metadata]?.[SCOPE_KEY];
};

/**
 * Checks if target has scope metadata
 * @param {*} target - Class constructor or instance
 * @returns {boolean} Whether or not the target has a scope mapping defined
 */
export const hasScope = (target: any): boolean => {
    const ctor = getConstructor(target);
    return ctor?.[Symbol.metadata]?.[SCOPE_KEY] !== undefined;
};

/**
 * TC39 decorator for defining scope on a class
 * @param {string} scopeName - The scope name (singleton, prototype, route, etc.)
 * @returns {ClassDecorator} TC39 class decorator
 */
export function scope(scopeName: PossibleScope) {
    return function <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T {
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

export class PrototypeScope implements Scope {
    destroyValue(_name: string): void {
        // Intentionally no-op. Prototype values are not cached/tracked.
    }

    getValue<T = any>(_name: string, objectFactory: ObjectFactory<T>): T {
        return objectFactory();
    }
}

export class HashScope implements Scope {
    #scopeMap: Map<string, Map<string, any>> = new Map<string, Map<string, any>>();
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
            this.#scopeMap.set(key, new Map<string, any>());
        }
    }

    destroyValue(name: string): void {
        if (!this.#currentKey) {
            throw new IllegalStateError('No active hash scope context. Call setCurrentKey() first.');
        }

        const scope = this.#scopeMap.get(this.#currentKey);
        scope?.delete(name);
    }

    getValue<T = any>(name: string, objectFactory: ObjectFactory<T>): T {
        if (!this.#currentKey) {
            throw new IllegalStateError('No active hash scope context. Call setCurrentKey() first.');
        }

        const scope = this.#scopeMap.get(this.#currentKey);
        if (!scope.has(name)) {
            scope.set(name, objectFactory());
        }

        return scope.get(name) as T;
    }
}

export class SingletonScope implements Scope {
    #instances: Map<string, any> = new Map<string, any>();
    #destructionCallbacks: Map<string, () => void> = new Map<string, () => void>();

    destroyValue(name: string): void {
        const callback = this.#destructionCallbacks.get(name);

        if (callback) {
            callback();
            this.#destructionCallbacks.delete(name);
        }

        this.#instances.delete(name);
    }

    getValue<T = any>(name: string, objectFactory: ObjectFactory<T>): T {
        if (!this.#instances.has(name)) {
            this.#instances.set(name, objectFactory());
        }

        return this.#instances.get(name) as T;
    }

    registerDestructionCallback(name: string, callback: () => void): void {
        this.#destructionCallbacks.set(name, callback);
    }
}
