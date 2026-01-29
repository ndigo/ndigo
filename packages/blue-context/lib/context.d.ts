/**
 * @author Jeff Rose
 */
import { JSONObject, Constructable } from '@blue/core';
import { ContentSource } from '@blue/content';
import { EventEmitter, EventType } from './event-emitter';
import { ConfigurableFactory, Destroyable, DefaultFactory, InitializationAwareProcessor, Aware } from '@blue/factory';
import { EnvironmentSource, Environment, ConfigurableEnvironment } from './environment';
import { ResourceLoader } from './resource';
export interface ApplicationContext extends ConfigurableFactory, ContentSource, Destroyable, EventEmitter, EnvironmentSource, ResourceLoader {
    readonly createdTimestamp: number;
    readonly id: number;
    readonly name: string;
    readonly path: string;
    parent: ApplicationContext;
    destroyedTimestamp?: number;
}
export interface ApplicationContextAware extends Aware {
    setApplicationContext(applicationContext: ApplicationContext): void;
}
export interface ConfigurableApplicationContext extends ApplicationContext {
    setEnvironment(environment: ConfigurableEnvironment): void;
    setId(id: number): void;
    setName(name: string): void;
    setParent(parent: ApplicationContext): void;
}
export declare const $ChildContext: unique symbol;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ApplicationContext|ApplicationContext}
 */
export declare const likeApplicationContext: (value: any) => value is ApplicationContext;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ApplicationContextAware|ApplicationContextAware}
 */
export declare const likeApplicationContextAware: (value: any) => value is ApplicationContextAware;
declare const GenericApplicationContext_base: Constructable<ResourceLoader> & typeof DefaultFactory & Constructable<any>;
/**
 * @implements module:context.ConfigurableApplicationContext
 * @extends module:factory.DefaultFactory
 * @see module:context.AsEventEmitter
 * @see module:context.AsModuleResourceLoader
 */
export declare class GenericApplicationContext extends GenericApplicationContext_base {
    #private;
    createdTimestamp: number;
    destroyed: boolean;
    destroyedTimestamp?: number;
    get environment(): Environment;
    get id(): number;
    get name(): string;
    get parent(): ApplicationContext;
    get path(): string;
    constructor(name?: string, data?: JSONObject);
    bubble(type: EventType, ...data: any[]): void;
    destroy(): void;
    getContent(key: string, language: string): string;
    setEnvironment(environment: ConfigurableEnvironment): void;
    setId(id: number): void;
    setName(name: string): void;
    setParent(parent: ApplicationContext): void;
    protected _createEnvironment(): Environment;
}
/**
 * @implements external:Record
 * @extends module:context.GenericApplicationContext
 */
export declare class ProxiedGenericApplicationContext extends GenericApplicationContext implements Record<string, any> {
    [key: string]: any;
    constructor(name: string, data?: JSONObject);
}
/**
 * @see module:context.AsApplicationContextAware
 * @implements module:context.ApplicationContextAware
 */
export declare const AsApplicationContextAware: <T extends Constructable>(superclass: T) => Constructable<ApplicationContextAware> & T;
/**
 * Create a new ApplicationContextAwareProcessor for the given context.
 * An {@link InitializationAwareProcessor|InitializationAwareProcessor} implementation that passes the ApplicationContext to value that implement the {@link EnvironmentAware|EnvironmentAware}, {@link ResourceLoaderAware|ResourceLoaderAware}, {@link ApplicationEventEmitterAware|ApplicationEventEmitterAware}, {@link ContentSourceAware|ContentSourceAware}, and/or {@link ApplicationContextAware|ApplicationContextAware} interfaces.
 *
 * Implemented interfaces are satisfied in order of their mention above.
 * @implements module:factory.InitializationAwareProcessor
 * @param {module:context.ApplicationContext} applicationContext
 * @see {@link EnvironmentAware}
 * @see {@link ResourceLoaderAware}
 * @see {@link ApplicationEventEmitterAware}
 * @see {@link ContentSourceAware}
 * @see {@link ApplicationContextAware}
 */
export declare class ApplicationContextAwareProcessor implements InitializationAwareProcessor {
    readonly applicationContext: ApplicationContext;
    constructor(applicationContext: ApplicationContext);
    processAfterInitialization<T = any>(name: string, value: T): T;
    processBeforeInitialization<T = any>(name: string, value: T): T;
}
export {};
//# sourceMappingURL=context.d.ts.map