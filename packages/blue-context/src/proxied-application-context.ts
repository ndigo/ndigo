/**
 * @author Jeff Rose
 */

import { JSONObject } from '@blue/core';
import { GenericApplicationContext } from './generic-application-context';

/**

 * @extends module:context.GenericApplicationContext
 *
 * Application context proxy that exposes values as dynamic object properties.
 */
export class ProxiedGenericApplicationContext extends GenericApplicationContext implements Record<string, any> {
    [key: string]: any;

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
            get(_t, key: PropertyKey): any {
                const value = target.getValue(key as string);
                return typeof value === 'function' ? value.bind(target) : value;
            },
            has(_t, key: PropertyKey): boolean {
                return target.hasValue(key as string);
            },
            set(_t, key: PropertyKey, value: any): boolean {
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

