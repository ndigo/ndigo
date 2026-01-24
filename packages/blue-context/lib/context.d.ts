/**
 * @author Jeff Rose
 */
import { JSONObject, Constructable } from '@blue/core';
import { ContentSource } from '@blue/content';
import { EventEmitter, EventType } from './event-emitter';
import { ConfigurableFactory, Destroyable, InitializationAwareProcessor, Aware } from '@blue/factory';
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
 * @function module:context.likeApplicationContext
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ApplicationContext|ApplicationContext}
 */
export declare const likeApplicationContext: (value: any) => value is ApplicationContext;
/**
 * @function module:context.likeApplicationContextAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ApplicationContextAware|ApplicationContextAware}
 */
export declare const likeApplicationContextAware: (value: any) => value is ApplicationContextAware;
declare const GenericApplicationContext_base: any;
/**
 * @class module:context.GenericApplicationContext
 * @implements module:context.ConfigurableApplicationContext
 * @extends module:factory.DefaultFactory
 * @mixes module:context.AsEventEmitter
 * @mixes module:context.AsModuleResourceLoader
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
 * @class module:context.ProxiedGenericApplicationContext
 * @implements external:Record
 * @extends module:context.GenericApplicationContext
 */
export declare class ProxiedGenericApplicationContext extends GenericApplicationContext implements Record<string, any> {
    [key: string]: any;
    constructor(name: string, data?: JSONObject);
}
/**
 * @mixin module:context.AsApplicationContextAware
 * @implements module:context.ApplicationContextAware
 */
export declare const AsApplicationContextAware: <T extends Constructable>(superclass: T) => Constructable<ApplicationContextAware> & T;
/**
 * Create a new ApplicationContextAwareProcessor for the given context.
 * @classdesc
 * An {@linkcode module:factory.InitializationAwareProcessor|InitializationAwareProcessor} implementation that passes the ApplicationContext to value that implement the {@linkcode module:context.EnvironmentAware|EnvironmentAware}, {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}, {@linkcode module:context.ApplicationEventEmitterAware|ApplicationEventEmitterAware}, {@linkcode module:context.ContentSourceAware|ContentSourceAware}, and/or {@linkcode module:context.ApplicationContextAware|ApplicationContextAware} interfaces.
 *
 * Implemented interfaces are satisfied in order of their mention above.
 * @class module:context.ApplicationContextAwareProcessor
 * @implements module:factory.InitializationAwareProcessor
 * @param {module:context.ApplicationContext} applicationContext
 * @see {@link module:context.EnvironmentAware}
 * @see {@link module:context.ResourceLoaderAware}
 * @see {@link module:context.ApplicationEventEmitterAware}
 * @see {@link module:context.ContentSourceAware}
 * @see {@link module:context.ApplicationContextAware}
 */
export declare class ApplicationContextAwareProcessor implements InitializationAwareProcessor {
    readonly applicationContext: ApplicationContext;
    constructor(applicationContext: ApplicationContext);
    processAfterInitialization<T = any>(name: string, value: T): T;
    processBeforeInitialization<T = any>(name: string, value: T): T;
}
export {};
//# sourceMappingURL=context.d.ts.map