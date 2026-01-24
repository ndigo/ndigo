/**
 * @author Jeff Rose
 */

import '../node_modules/reflect-metadata/Reflect';
//import { Constructable } from '@blue/core';
import { Factory } from './factory';
import { Registry } from './registry';
import { isConstructor } from '@blue/util';
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

const SCOPE = 'scope',
    { defineProperty } = Reflect,
    { defineMetadata, getMetadata, hasMetadata } = Reflect as any;

/**
 * @function module:factory.defineScope
 * @param {*} value
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 */
export const defineScope = (value, target): void => defineMetadata(SCOPE, value, target);

/**
 * @function module:factory.getScope
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {*}
 */
export const getScope = (target): any => getMetadata(SCOPE, target);

/**
 * @function module:factory.hasScope
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {external:boolean} Whether or not the `target` and optional `propertyKey` has a scope mapping defined.
 */
export const hasScope = (target): boolean => hasMetadata(SCOPE, target);

/**
 * @function module:factory.Scope
 * @param {external:string} scope
 */
export const scope =
    (scope: PossibleScope) =>
    (target: Object): any => {
        defineScope(scope, target);
        console.log('@Scope', scope, target);
        return target;
    };

export const singletonScope = scope('singleton');

export const prototypeScope = scope('prototype');

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
