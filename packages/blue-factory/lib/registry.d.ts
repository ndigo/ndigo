/**
 * @author Jeff Rose
 */
export interface Registry {
    destroyValue(name: string): void;
    getValue<T = any>(name: string): T;
    hasValue(name: string): boolean;
    setValue<T = any>(name: string, value: T): void;
}
/**
 * Interface that defines a registry for shared instances
 * @interface module:factory.Registry
 */
/**
 * @function module:factory.likeRegistry
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.Registry|Registry}.
 */
export declare const likeRegistry: (value: any) => value is Registry;
/**
 * A handler implementation that when applied to a {@linkcode module:factory.Registry|Registry} instance via {@linkcode external:Proxy|Proxy} causes the registry
 * to behave like a plain object. This is used to implement {@linkcode module:factory.ProxiedFactory|ProxiedFactory}.
 * @class module:factory.RegistryProxyHandler
 * @implements external:ProxyHandler
 * @see {@link module:factory.ProxiedFactory}
 */
export declare class RegistryProxyHandler<T extends Registry> implements ProxyHandler<T> {
    deleteProperty(target: T, key: PropertyKey): boolean;
    get<U = any>(target: T, key: PropertyKey): U;
    has(target: T, key: PropertyKey): boolean;
    set<U = any>(target: T, key: PropertyKey, value: U): boolean;
}
//# sourceMappingURL=registry.d.ts.map