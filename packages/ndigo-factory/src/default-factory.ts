/**
 * Default factory implementations.
 */
import { RegistryProxyHandler } from './registry';
import { AbstractFactory } from './abstract-factory';

/**
 * Default {@link AbstractFactory} implementation with no extra behavior.
 *
 * @example
 * ```ts
 * const factory = new DefaultFactory();
 * ```
 */
export class DefaultFactory extends AbstractFactory {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "DefaultFactory".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object DefaultFactory]"
     */
    get [Symbol.toStringTag](): string {
        return 'DefaultFactory';
    }
}

/**
 * A factory that uses a Proxy to allow direct property access for value manipulation.

 * @example
 * ```ts
 * const factory = new ProxiedFactory();
 * factory.foo = 123;
 * 'foo' in factory; //=> true
 * delete factory.foo;
 * 'foo' in factory; //=> false
 * ```
 * @see {@link DefaultFactory}
 */
export class ProxiedFactory extends DefaultFactory implements Record<string, unknown> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ProxiedFactory".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ProxiedFactory]"
     */
    get [Symbol.toStringTag](): string {
        return 'ProxiedFactory';
    }

    /**
     * Allows arbitrary properties to be added to the factory, which are then managed as values.
     */
    [key: string]: unknown;

    /**
     * Creates a new ProxiedFactory instance.
     * @returns A Proxy that wraps the factory, allowing direct property access.
     */
    constructor() {
        super();
        return new Proxy(this, new RegistryProxyHandler<this>());
    }
}
