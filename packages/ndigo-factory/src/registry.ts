/**
 * The registry contract and proxy handler.
 */
import { like } from '@ndigo/util/types';
import { ContextToken } from './context-tokens';

/**
 * Interface that defines a registry for shared instances.
 */
export interface Registry {
    /** Destroys a value by token. @param token - The value token. */
    destroyValue<T = unknown>(token: ContextToken<T>): void;
    /** Destroys a value by name. @param name - The value name. */
    destroyValue(name: string): void;
    /** Retrieves a value by token. @param token - The value token. */
    getValue<T = unknown>(token: ContextToken<T>): T;
    /** Retrieves a value by name. @param name - The value name. */
    getValue<T = unknown>(name: string): T;
    /** Checks for a value by token. @param token - The value token. */
    hasValue<T = unknown>(token: ContextToken<T>): boolean;
    /** Checks for a value by name. @param name - The value name. */
    hasValue(name: string): boolean;
    /** Sets a value by token. @param token - The value token. @param value - The value. */
    setValue<T = unknown>(token: ContextToken<T>, value: T): void;
    /** Sets a value by name. @param name - The value name. @param value - The value. */
    setValue<T = unknown>(name: string, value: T): void;
}

/**
 * Narrows a value to the {@link Registry} shape.
 *
 * @param value - The value to be tested
 * @returns Whether or not the `value` provided is a {@link Registry|Registry}.
 */
export const likeRegistry = (value: unknown): value is Registry =>
    like({
        destroyValue: Function,
        getValue: Function,
        hasValue: Function,
        setValue: Function,
    })(value);

/**
 * A handler implementation that when applied to a {@link Registry|Registry} instance via `Proxy` causes the registry
 * to behave like a plain object. This is used to implement `ProxiedFactory`.
 *
 * @see {@link "default-factory".ProxiedFactory | ProxiedFactory}
 */
export class RegistryProxyHandler<T extends Registry> implements ProxyHandler<T> {
    /**
     * Destroys the value behind a deleted property.
     *
     * @param target - The registry.
     * @param key - The property key.
     * @returns Whether the property was deleted.
     */
    deleteProperty(target: T, key: PropertyKey): boolean {
        try {
            target.destroyValue(key as string);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Resolves a property through the registry.
     *
     * @param target - The registry.
     * @param key - The property key.
     * @returns The resolved value or bound member.
     */
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

    /**
     * Whether the registry has the property.
     *
     * @param target - The registry.
     * @param key - The property key.
     * @returns Whether the value is registered.
     */
    has(target: T, key: PropertyKey): boolean {
        return target.hasValue(key as string);
    }

    /**
     * Stores a property through the registry.
     *
     * @param target - The registry.
     * @param key - The property key.
     * @param value - The value to store.
     * @returns Whether the property was stored.
     */
    set<U = unknown>(target: T, key: PropertyKey, value: U): boolean {
        try {
            target.setValue<U>(key as string, value);
            return true;
        } catch (e) {
            return false;
        }
    }
}
