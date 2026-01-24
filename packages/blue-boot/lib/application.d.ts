/**
 * @author Jeff Rose
 */
import { ApplicationContext, ConfigurableApplicationContext, ConfigurableEnvironment } from '@blue/context';
import { JSONObject } from '@blue/core';
/**
 * Class that can be used to bootstrap and launch an application.
 * @class module:boot.Application
 * @param {external:string} name The name of the application
 */
export declare class Application {
    #private;
    get sources(): Set<Function>;
    constructor(sources: Function[]);
    /**
     * Run the Spring application, creating and refreshing a new {@linkcode module:context.ApplicationContext|ApplicationContext}.
     * @function module:boot.Application#run
     * @param {*} args
     */
    run(...args: string[]): ConfigurableApplicationContext;
    setEnvironment(environment: ConfigurableEnvironment): void;
    setName(name: string): void;
    setProfiles(...profiles: string[]): void;
    setProperties(properties: JSONObject): void;
    /**
     * @protected
     * @function module:boot.Application#_configureEnvironment
     * @param {module:context.Environment} environment
     * @param {external:Array<external:string>} args
     */
    protected _configureEnvironment(environment: ConfigurableEnvironment, args: string[]): void;
    /**
     * @protected
     * @function module:boot.Application#_configureProfiles
     * @param {module:context.Environment} environment
     * @param {external:Array<external:string>} args
     */
    protected _configureProfiles(environment: ConfigurableEnvironment, args: string[]): void;
    protected _configurePropertySources(environment: ConfigurableEnvironment, args: string[]): void;
    protected _prepareContext(environment: ConfigurableEnvironment, args: string[]): ApplicationContext;
    protected _prepareEnvironment(args: string[]): ConfigurableEnvironment;
    private _getOrCreateEnvironment;
}
//# sourceMappingURL=application.d.ts.map
