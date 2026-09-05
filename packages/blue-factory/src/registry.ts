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
export const likeRegistry = (value: unknown): value is Registry =>
    like({
        destroyValue: Function,
        getValue: Function,
        hasValue: Function,
        setValue: Function,
    })(value);

/**
 * A handler implementation that when applied to a {@link Registry|Registry} instance via {@link external:Proxy|Proxy} causes the registry
 * to behave like a plain object. This is used to implement `ProxiedFactory`.

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
        const value = target.getValue<U>(key as string);
        return typeof value === 'function' ? ((value as Function).bind(target) as U) : value;
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
