/**
 * @author Jeff Rose
 */
import { GenericApplicationContext, StandardEnvironment } from '@blue/context';
import { IllegalStateError } from '@blue/core';
/**
 * Class that can be used to bootstrap and launch an application.
 * @class module:boot.Application
 * @param {external:string} name The name of the application
 */
export class Application {
    #environemnt;
    #name;
    #properties;
    #sources;
    get sources() {
        return this.#sources;
    }
    constructor(sources) {
        this.#sources = new Set(sources);
    }
    /**
     * Run the Spring application, creating and refreshing a new {@linkcode module:context.ApplicationContext|ApplicationContext}.
     * @function module:boot.Application#run
     * @param {*} args
     */
    run(...args) {
        let context;
        try {
            const environment = this._prepareEnvironment(args);
            context = this._prepareContext(environment, args);
        }
        catch (e) {
            throw new IllegalStateError();
        }
        return context;
    }
    setEnvironment(environment) {
        this.#environemnt = environment;
    }
    setName(name) {
        this.#name = name;
    }
    setProfiles(...profiles) {
        profiles;
    }
    setProperties(properties) {
        this.#properties = properties;
    }
    /**
     * @protected
     * @function module:boot.Application#_configureEnvironment
     * @param {module:context.Environment} environment
     * @param {external:Array<external:string>} args
     */
    _configureEnvironment(environment, args) {
        this._configurePropertySources(environment, args);
        this._configureProfiles(environment, args);
    }
    /**
     * @protected
     * @function module:boot.Application#_configureProfiles
     * @param {module:context.Environment} environment
     * @param {external:Array<external:string>} args
     */
    _configureProfiles(environment, args) {
    }
    _configurePropertySources(environment, args) {
        if (this.#properties) {
            environment.propertySources.push(this.#properties);
        }
    }
    _prepareContext(environment, args) {
        const context = new GenericApplicationContext();
        context.setEnvironment(environment);
        return context;
    }
    _prepareEnvironment(args) {
        const env = this._getOrCreateEnvironment();
        this._configureEnvironment(env, args);
        return env;
    }
    _getOrCreateEnvironment() {
        return this.#environemnt ?
            this.#environemnt :
            new StandardEnvironment();
    }
}
//# sourceMappingURL=application.js.map