/**
 * @author Jeff Rose
 */

import { like } from '@blue/util/types';
import { ContextToken } from './context-token';

export interface Registry {
    destroyValue<T = any>(token: ContextToken<T>): void;
    destroyValue(name: string): void;
    getValue<T = any>(token: ContextToken<T>): T;
    getValue<T = any>(name: string): T;
    hasValue<T = any>(token: ContextToken<T>): boolean;
    hasValue(name: string): boolean;
    setValue<T = any>(token: ContextToken<T>, value: T): void;
    setValue<T = any>(name: string, value: T): void;
}

/**
 * Interface that defines a registry for shared instances
 */

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link Registry|Registry}.
 */
export const likeRegistry = like({
    destroyValue: Function,
    getValue: Function,
    hasValue: Function,
    setValue: Function,
}) as (value) => value is Registry;

/**
 * A handler implementation that when applied to a {@link Registry|Registry} instance via {@link external:Proxy|Proxy} causes the registry
 * to behave like a plain object. This is used to implement {@link ProxiedFactory|ProxiedFactory}.
 * @implements external:ProxyHandler
 * @see {@link ProxiedFactory}
 */
export class RegistryProxyHandler<T extends Registry> implements ProxyHandler<T> {
    deleteProperty(target: T, key: PropertyKey): boolean {
        try {
            target.destroyValue(key as string);
            return true;
        } catch (e) {
            return false;
        }
    }

    get<U = any>(target: T, key: PropertyKey): U {
        return target.getValue<U>(key as string);
    }

    has(target: T, key: PropertyKey): boolean {
        return target.hasValue(key as string);
    }

    set<U = any>(target: T, key: PropertyKey, value: U): boolean {
        try {
            target.setValue<U>(key as string, value);
            return true;
        } catch (e) {
            return false;
        }
    }
}
