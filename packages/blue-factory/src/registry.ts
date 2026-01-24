/**
 * @author Jeff Rose
 */

import { like } from '@blue/util';

export interface Registry {
    destroyValue( name: string ): void;
    getValue<T = any>( name: string ): T;
    hasValue( name: string ): boolean;
    setValue<T = any>( name: string, value: T ): void;
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
export const likeRegistry = like( { destroyValue: Function, getValue: Function, hasValue: Function, setValue: Function } ) as ( value ) => value is Registry;

/**
 * A handler implementation that when applied to a {@linkcode module:factory.Registry|Registry} instance via {@linkcode external:Proxy|Proxy} causes the registry
 * to behave like a plain object. This is used to implement {@linkcode module:factory.ProxiedFactory|ProxiedFactory}.
 * @class module:factory.RegistryProxyHandler
 * @implements external:ProxyHandler
 * @see {@link module:factory.ProxiedFactory}
 */
export class RegistryProxyHandler<T extends Registry> implements ProxyHandler<T> {
    deleteProperty( target: T, key: PropertyKey ): boolean {
        try {
            target.destroyValue( key as string );
            return true;
        } catch( e ){
            return false;
        }
    }

    get<U = any>( target: T, key: PropertyKey ): U {
        return target.getValue<U>( key as string );
    }

    has( target: T, key: PropertyKey ): boolean {
        return target.hasValue( key as string );
    }

    set<U = any>( target: T, key: PropertyKey, value: U ): boolean {
        try {
            target.setValue<U>( key as string, value );
            return true;
        } catch( e ){
            return false;
        }
    }
}
