/**
 * @author Jeff Rose
 */
import '../node_modules/reflect-metadata/Reflect';
export type KnownScope = 'singleton' | 'prototype' | 'route';
export type PossibleScope = KnownScope | string;
export interface Scope {
    destroyValue(name: string): void;
    getValue<T = any>(name: string, factory: any): T;
}
export interface ScopedFactory {
    destroyScopedValue(scopeName: string, valueName: string): void;
    getScope(name: string): Scope;
    getScopeNames(): string[];
    registerScope(name: string, scope: Scope): void;
}
/**
 * @function module:factory.defineScope
 * @param {*} value
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 */
export declare const defineScope: (value: any, target: any) => void;
/**
 * @function module:factory.getScope
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {*}
 */
export declare const getScope: (target: any) => any;
/**
 * @function module:factory.hasScope
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {external:boolean} Whether or not the `target` and optional `propertyKey` has a scope mapping defined.
 */
export declare const hasScope: (target: any) => boolean;
/**
 * @function module:factory.Scope
 * @param {external:string} scope
 */
export declare const scope: (scope: PossibleScope) => (target: Object) => any;
export declare const singletonScope: (target: Object) => any;
export declare const prototypeScope: (target: Object) => any;
export declare const hashScope: (target: Object) => any;
export declare class PrototypeScope implements Scope {
    destroyValue(name: string): void;
    getValue<T = any>(name: string, factory: any): T;
}
export declare class HashScope implements Scope {
    destroyValue(name: string): void;
    getValue<T = any>(name: string, factory: any): T;
}
export declare class SingletonScope implements Scope {
    destroyValue(name: string): void;
    getValue<T = any>(name: string, factory: any): T;
}
type Constructable<T = {}> = new (...args: any[]) => T;
export declare const AsScopedFactory: <T extends Constructable>(superclass: T) => Constructable<ScopedFactory> & T;
export {};
//# sourceMappingURL=scope.d.ts.map