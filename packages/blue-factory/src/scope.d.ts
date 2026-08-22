/**
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
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
/**
 * Defines scope metadata on a class
 * @param {*} value - Scope name
 * @param {*} target - Class constructor
 */
export declare const defineScope: (value: PossibleScope, target: any) => void;
/**
 * Retrieves scope metadata from a class or instance
 * @param {*} target - Class constructor or instance
 * @returns {*} Scope name or undefined
 */
export declare const getScope: (target: any) => PossibleScope | undefined;
/**
 * Checks if target has scope metadata
 * @param {*} target - Class constructor or instance
 * @returns {boolean} Whether or not the target has a scope mapping defined
 */
export declare const hasScope: (target: any) => boolean;
/**
 * TC39 decorator for defining scope on a class
 * @param {string} scopeName - The scope name (singleton, prototype, route, etc.)
 * @returns {ClassDecorator} TC39 class decorator
 */
export declare function scope(scopeName: PossibleScope): <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext) => T;
/**
 * Decorator for singleton scope (convenience factory)
 */
export declare const singletonScope: <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext) => T;
/**
 * Decorator for prototype scope (convenience factory)
 */
export declare const prototypeScope: <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext) => T;
/**
 * Decorator for hash/route scope (convenience factory)
 */
export declare const hashScope: <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext) => T;
/**
 * Prototype scope implementation — creates a fresh instance on every `getValue()` call.
 *
 * @internal AD-6: This is an implementation detail of the scoped factory. Only the
 * {@link Scope} and {@link ScopedFactory} interfaces are part of the stable public API.
 * A future scoping split may move concrete scope implementations to a separate module.
 */
export declare class PrototypeScope implements Scope {
    destroyValue(_name: string): void;
    getValue<T = any>(_name: string, objectFactory: ObjectFactory<T>): T;
}
/**
 * Hash (route) scope implementation — one instance per scope key.
 * Activate a scope context by calling `setCurrentKey(key)` before `getValue()`.
 *
 * @internal AD-6: Implementation detail — see {@link PrototypeScope} for rationale.
 */
export declare class HashScope implements Scope {
    #private;
    endScope(key: string): void;
    getCurrentKey(): string | null;
    setCurrentKey(key: string): void;
    destroyValue(name: string): void;
    getValue<T = any>(name: string, objectFactory: ObjectFactory<T>): T;
}
/**
 * Singleton scope implementation — creates at most one instance per named value.
 * Destruction callbacks can be registered when an instance is created.
 *
 * @internal AD-6: Implementation detail — see {@link PrototypeScope} for rationale.
 */
export declare class SingletonScope implements Scope {
    #private;
    destroyValue(name: string): void;
    getValue<T = any>(name: string, objectFactory: ObjectFactory<T>): T;
    registerDestructionCallback(name: string, callback: () => void): void;
}
