/**
 * @author Jeff Rose
 */

import {
    ConfigurableApplicationContext,
    ConfigurableEnvironment,
    MetadataConfigApplicationContext,
    StandardEnvironment,
} from '@blue/context';
import { IllegalStateError, JSONObject } from '@blue/core';
import { WebAutoConfiguration } from './web-auto-configuration';

/**
 * Class that can be used to bootstrap and launch an application.
 * @param {string} name The name of the application
 */
export class Application {
    #environment: ConfigurableEnvironment;
    #name: string;
    #profiles: string[];
    #properties: JSONObject;
    #sources: Set<Function>;

    get sources() {
        return this.#sources;
    }

    constructor(sources: Function[]) {
        this.#profiles = [];
        this.#sources = new Set<Function>(sources);
    }

    /**
     * Run the Spring application, creating and refreshing a new {@link ApplicationContext|ApplicationContext}.
     * @param {*} args
     */
    run(...args: string[]): ConfigurableApplicationContext {
        let context;

        try {
            const environment = this._prepareEnvironment(args);
            context = this._prepareContext(environment, args);
        } catch {
            throw new IllegalStateError();
        }

        return context;
    }

    setEnvironment(environment: ConfigurableEnvironment): void {
        this.#environment = environment;
    }

    setName(name: string): void {
        this.#name = name;
    }

    setProfiles(...profiles: string[]): void {
        this.#profiles = profiles;
    }

    setProperties(properties: JSONObject): void {
        this.#properties = properties;
    }

    /**
     * @protected
     * @param {module:context.Environment} environment
     * @param {Array<external:string>} args
     */
    protected _configureEnvironment(environment: ConfigurableEnvironment, args: string[]): void {
        this._configurePropertySources(environment, args);
        this._configureProfiles(environment, args);
    }

    /**
     * @protected
     * @param {module:context.Environment} environment
     * @param {Array<external:string>} args
     */
    protected _configureProfiles(environment: ConfigurableEnvironment, args: string[]): void {
        if (this.#profiles.length) {
            environment.activeProfiles = this.#profiles;
        }
    }

    protected _configurePropertySources(environment: ConfigurableEnvironment, args: string[]): void {
        if (this.#properties) {
            environment.propertySources.push(this.#properties);
        }
    }

    protected _prepareContext(environment: ConfigurableEnvironment, args: string[]): ConfigurableApplicationContext {
        const context = new MetadataConfigApplicationContext(this.#name);
        context.setEnvironment(environment);

        if (typeof window !== 'undefined') {
            context.register(WebAutoConfiguration);
        }

        this.#sources.forEach((source) => context.register(source));
        context.refresh();
        return context;
    }

    protected _prepareEnvironment(args: string[]): ConfigurableEnvironment {
        const env = this._getOrCreateEnvironment();
        this._configureEnvironment(env, args);
        return env;
    }

    private _getOrCreateEnvironment(): ConfigurableEnvironment {
        return this.#environment ? this.#environment : new StandardEnvironment();
    }
}
