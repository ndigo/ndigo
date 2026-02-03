/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
//import { Constructable } from '@blue/core';
import { Factory } from './factory';
import { Registry } from './registry';
import { isConstructor } from '@blue/util/types';
import Entry from './entry';

export type KnownScope = 'singleton' | 'prototype' | 'route';
export type PossibleScope = KnownScope | string;

export interface Scope {
    destroyValue(name: string): void;
    getValue<T = any>(name: string, factory): T;
}

export interface ScopedFactory {
    destroyScopedValue(scopeName: string, valueName: string): void;
    getScope(name: string): Scope;
    getScopeNames(): string[];
    registerScope(name: string, scope: Scope): void;
}

const SCOPE_KEY = 'scope:mapping',
    { defineProperty } = Reflect;

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

        console.log('@scope', scopeName, target);

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
    destroyValue(name: string): void {
        throw new Error('Method not implemented.');
    }
    getValue<T = any>(name: string, factory: any): T {
        throw new Error('Method not implemented.');
    }
}

export class HashScope implements Scope {
    destroyValue(name: string): void {
        throw new Error('Method not implemented.');
    }
    getValue<T = any>(name: string, factory: any): T {
        throw new Error('Method not implemented.');
    }
}

export class SingletonScope implements Scope {
    destroyValue(name: string): void {
        throw new Error('Method not implemented.');
    }
    getValue<T = any>(name: string, factory: any): T {
        throw new Error('Method not implemented.');
    }
}

const ps = new PrototypeScope(),
    hs = new HashScope(),
    ss = new SingletonScope();

// TODO Use the @blue/core version once it updates -JBR
type Constructable<T = {}> = new (...args: any[]) => T;

export const AsScopedFactory = <T extends Constructable>(superclass: T): Constructable<ScopedFactory> & T =>
    class extends superclass implements ScopedFactory {
        #scopes: Map<PossibleScope, Scope>;

        constructor(...args: any[]) {
            super(...args);
            this.#scopes = new Map<PossibleScope, Scope>();

            // Register default scopes
            this.registerScope('prototype', ps);
            this.registerScope('route', hs);
            this.registerScope('singleton', ss);
        }

        destroyScopedValue(scopeName: PossibleScope, valueName: string): void {
            const scope = this.#scopes.get(scopeName);
            scope ?? scope.destroyValue(valueName);
        }

        getScope(name: PossibleScope): Scope {
            return this.#scopes.get(name);
        }

        getScopeNames(): PossibleScope[] {
            return [...this.#scopes.keys()];
        }

        getValue<T = any>(name: string, argumentsList: any[] = []): T {
            const entry: Entry<T> = this[`$${name}`],
                scopeName = entry.scope,
                scope = this.#scopes.get(scopeName);

            scope.getValue<T>(name, () => {});

            return this[name];
        }

        registerScope(name: PossibleScope, scope: Scope): void {
            if (!this.#scopes.has(name)) {
                this.#scopes.set(name, scope);
            }
        }

        setValue<T = any>(name: string, value: T): void {
            const scopeName = getScope(value) ?? (isConstructor(value) ? 'prototype' : 'singleton'),
                entry = new Entry<T>(name, value, scopeName);

            defineProperty(this, `$${name}`, {
                value: entry,
                configurable: true,
                enumerable: true,
                writable: false,
            });
        }
    };
