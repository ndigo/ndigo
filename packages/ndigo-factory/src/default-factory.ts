/**
 */
import { RegistryProxyHandler } from './registry';
import { AbstractFactory } from './abstract-factory';

export class DefaultFactory extends AbstractFactory {}

/**
 * A factory that uses a Proxy to allow direct property access for value manipulation.
 * @extends DefaultFactory

 * @example
 * const factory = new ProxiedFactory();
 * factory.foo = 123;
 * 'foo' in factory;
 * //=> true
 * delete factory.foo
 * 'foo' in factory;
 * //=> false
 * @see {@link DefaultFactory}
 */
export class ProxiedFactory extends DefaultFactory implements Record<string, unknown> {
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
