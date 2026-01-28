/**
 * @author Jeff Rose
 */
import { Destroyable } from './lifecycle';
import { Aware } from './aware';
import { Registry } from './registry';
import { EntryProcessor } from './entry-processor';
export interface Factory {
    getInstance<T = any>(name: string): T;
}
export interface HierarchicalFactory extends Factory {
    readonly parent: Factory;
    hasOwnValue(name: string): boolean;
}
export interface ConfigurableFactory extends HierarchicalFactory, Registry {
    addProcessor(processor: EntryProcessor): void;
    setParent(parent: Factory): void;
}
export interface FactoryAware extends Aware {
    setFactory(factory: Factory): void;
}
type Constructable<T = {}> = new (...args: any[]) => T;
/**
 * @see module:factory.AsFactoryAware
 * @implements module:factory.FactoryAware
 * @returns {module:factory.Constructable<module:factory.FactoryAware>}
 */
export declare const AsFactoryAware: <T extends Constructable>(superclass: T) => Constructable<FactoryAware> & T;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link Factory|Factory}.
 */
export declare const likeFactory: (value: any) => value is Factory;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is {@link FactoryAware|FactoryAware}.
 */
export declare const likeFactoryAware: (value: any) => value is FactoryAware;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is {@link HierarchicalFactory|HierarchicalFactory}.
 */
export declare const likeHierarchicalFactory: (value: any) => boolean;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is {@link ConfigurableFactory|ConfigurableFactory}.
 */
export declare const likeConfigurableFactory: (value: any) => boolean;
export declare abstract class AbstractFactory implements ConfigurableFactory {
    #private;
    processors: EntryProcessor[];
    hasConstructionAwareProcessors: boolean;
    hasDestructionAwareProcessors: boolean;
    hasInitializationAwareProcessors: boolean;
    get [Symbol.toStringTag](): string;
    get parent(): Factory;
    constructor();
    addProcessor(processor: EntryProcessor): void;
    destroyValue(name: string): void;
    getInstance<T = any>(name: string, argumentsList?: any[]): T;
    getValue<T = any>(name: string, argumentsList?: any[]): T;
    hasConstructor(name: string): boolean;
    hasInstance(name: string): boolean;
    hasOwnValue(name: string): boolean;
    hasValue(name: string): boolean;
    setParent(parent: Factory): void;
    setValue<T = any>(name: string, value: T): void;
    protected _applyProcessorsAfterConstruction<T = any>(name: string, instance: T): boolean;
    protected _applyProcessorsAfterInitialization<T>(name: string, instance: T): T;
    protected _applyProcessorsBeforeConstruction<T = any>(name: string, constructor: Function, argumentsList?: any[]): T | null;
    protected _applyProcessorsBeforeDestruction(name: string, instance: Destroyable): void;
    protected _applyProcessorsBeforeInitialization<T>(name: string, instance: T): T;
    protected _configure<T = any>(name: string, instance: T): T;
    protected _create<T = any>(name: string, argumentsList?: any[]): T;
    protected _initialize<T>(name: string, instance: T): T;
    protected _populate<T = any>(name: string, instance: T, properties?: PropertyDescriptorMap): void;
    private _invokeAware;
    private _invokeInit;
}
/**
 * @abstract
 * @implements module:factory.ConfigurableFactory
 */
/**
 */
/**
 * @param {module:factory.EntryProcessor} processor
 */
/**
 * @extends module:factory.AbstractFactory
 * @example
 * const factory = new DefaultFactory();
 * factory.setValue( 'foo', 123 );
 * factory.getValue( 'foo' );
 * //=> 123
 * factory.hasValue( 'foo' );
 * //=> true
 * factory.deleteValue( 'foo' );
 * factory.hasValue( 'foo' );
 * //=> false
 */
export declare class DefaultFactory extends AbstractFactory {
}
/**
 * @extends module:factory.DefaultFactory
 * @implements external:Record
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
export declare class ProxiedFactory extends DefaultFactory implements Record<string, any> {
    [key: string]: any;
    constructor();
}
export {};
//# sourceMappingURL=factory.d.ts.map