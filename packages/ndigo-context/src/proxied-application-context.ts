/**
 * @module ndigo-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { JSONObject } from '@ndigo/core';
import { GenericApplicationContext } from './generic-application-context';

/**

 *
 * Application context proxy that exposes values as dynamic object properties.
 */
export class ProxiedGenericApplicationContext extends GenericApplicationContext implements Record<string, unknown> {
    [key: string]: unknown;

    /**
     * Creates a proxied context that forwards property access to values.
     *
     * @param name - The context name.
     * @param data - Optional initial values to register.
     */
    constructor(name: string, data?: JSONObject) {
        super(name, data);

        // eslint-disable-next-line no-this-alias -- proxy handler traps receive the handler as `this`, so the context must be captured
        const target = this;

        return new Proxy(this, {
            deleteProperty(_t, key: PropertyKey): boolean {
                try {
                    target.destroyValue(key as string);
                    return true;
                } catch {
                    return false;
                }
            },
            get(_t, key: PropertyKey): unknown {
                const value = target.getValue(key as string);
                if (typeof value === 'function') return value.bind(target);
                if (value !== undefined) return value;
                // Registry values no longer fall back to prototype members
                // (KRN-REV-FACTORY-14), so the context's own API surface must
                // resolve through Reflect: `context.setValue`/`destroy`/`name`
                // reach the real members instead of `undefined`.
                const member = Reflect.get(target, key);
                return typeof member === 'function' ? member.bind(target) : member;
            },
            has(_t, key: PropertyKey): boolean {
                return target.hasValue(key as string);
            },
            set(_t, key: PropertyKey, value: unknown): boolean {
                try {
                    target.setValue(key as string, value);
                    return true;
                } catch {
                    return false;
                }
            },
        });
    }
}
