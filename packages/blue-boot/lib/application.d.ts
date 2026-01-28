/**
 * @author Jeff Rose
 */
import { ApplicationContext, ConfigurableApplicationContext, ConfigurableEnvironment } from '@blue/context';
import { JSONObject } from '@blue/core';
/**
 * Class that can be used to bootstrap and launch an application.
 * @param {string} name The name of the application
 */
export declare class Application {
    #private;
    get sources(): Set<Function>;
    constructor(sources: Function[]);
    /**
     * Run the Spring application, creating and refreshing a new {@link ApplicationContext|ApplicationContext}.
     * @param {*} args
     */
    run(...args: string[]): ConfigurableApplicationContext;
    setEnvironment(environment: ConfigurableEnvironment): void;
    setName(name: string): void;
    setProfiles(...profiles: string[]): void;
    setProperties(properties: JSONObject): void;
    /**
     * @protected
     * @param {module:context.Environment} environment
     * @param {Array<external:string>} args
     */
    protected _configureEnvironment(environment: ConfigurableEnvironment, args: string[]): void;
    /**
     * @protected
     * @param {module:context.Environment} environment
     * @param {Array<external:string>} args
     */
    protected _configureProfiles(environment: ConfigurableEnvironment, args: string[]): void;
    protected _configurePropertySources(environment: ConfigurableEnvironment, args: string[]): void;
    protected _prepareContext(environment: ConfigurableEnvironment, args: string[]): ApplicationContext;
    protected _prepareEnvironment(args: string[]): ConfigurableEnvironment;
    private _getOrCreateEnvironment;
}
//# sourceMappingURL=application.d.ts.map