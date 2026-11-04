/**
 * @module ndigo-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import { like } from '@ndigo/util/types';
import { ContextToken } from './context-tokens';

/**
 * Interface that defines a registry for shared instances.
 */
export interface Registry {
    destroyValue<T = unknown>(token: ContextToken<T>): void;
    destroyValue(name: string): void;
    getValue<T = unknown>(token: ContextToken<T>): T;
    getValue<T = unknown>(name: string): T;
    hasValue<T = unknown>(token: ContextToken<T>): boolean;
    hasValue(name: string): boolean;
    setValue<T = unknown>(token: ContextToken<T>, value: T): void;
    setValue<T = unknown>(name: string, value: T): void;
}

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
 *
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

    get<U = unknown>(target: T, key: PropertyKey): U {
        // Resolve the factory's own API surface (methods/accessors) first, so
        // `registry.setValue`/`getValue` reach the real methods. `getValue` no
        // longer falls back to inherited `Object.prototype` members, so the
        // registry's own methods must be matched here (KRN-REV-FACTORY-14).
        if (!target.hasValue(key as string)) {
            const member = Reflect.get(target, key);
            if (typeof member === 'function') {
                return (member as Function).bind(target) as U;
            }
        }

        return target.getValue<U>(key as string);
    }

    has(target: T, key: PropertyKey): boolean {
        return target.hasValue(key as string);
    }

    set<U = unknown>(target: T, key: PropertyKey, value: U): boolean {
        try {
            target.setValue<U>(key as string, value);
            return true;
        } catch (e) {
            return false;
        }
    }
}
