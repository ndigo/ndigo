/**
 * @author Jeff Rose
 */

import {
    ConfigurableApplicationContext,
    ConfigurableEnvironment,
    Emitter,
    MetadataConfigApplicationContext,
    StandardEnvironment,
} from '@blue/context';
import { IllegalStateError, JSONObject } from '@blue/core';
import { RouteRegistry } from '@blue/router';
import { isActive, isActiveForCurrentPlatform } from '@blue/core';

/**
 * Class that can be used to bootstrap and launch an application.
 *
 * @param {string} name The name of the application
 * @fires started when the application context is ready
 * @fires closed when the application is closed
 */
export class Application extends Emitter {
    #context: ConfigurableApplicationContext | null = null;
    #environment: ConfigurableEnvironment | null = null;
    #name: string | null = null;
    #profiles: string[];
    #properties: JSONObject | null = null;
    #sources: Set<Function>;

    /**
     * Gets the source classes registered with this application bootstrapper.
     *
     * @returns The registered source classes.
     */
    get sources() {
        return this.#sources;
    }

    /**
     * Creates an application bootstrapper for the given source classes.
     *
     * @param sources - Source classes that will be registered when the application runs.
     */
    constructor(sources: Function[]) {
        super();
        this.#profiles = [];
        this.#sources = new Set<Function>(sources);
    }

    /**
     * Runs the application and refreshes a new application context.
     *
     * @param args - Command-line arguments used while preparing the environment.
     * @returns The refreshed application context.
     * @throws {IllegalStateError} When application startup fails.
     */
    run(...args: string[]): ConfigurableApplicationContext {
        let context;

        try {
            const environment = this._prepareEnvironment(args);
            context = this._prepareContext(environment, args);
            this.#context = context;
            this.emit('started', context);
        } catch (error: unknown) {
            throw new IllegalStateError(
                'Application startup failed',
                error instanceof Error ? { cause: error } : { cause: new Error(String(error)) }
            );
        }

        return context;
    }

    /**
     * Sets the environment that will be reused instead of creating a new one.
     *
     * @param environment - The environment to reuse.
     */
    setEnvironment(environment: ConfigurableEnvironment): void {
        this.#environment = environment;
    }

    /**
     * Sets the application name used when the application context is created.
     *
     * @param name - The application name.
     */
    setName(name: string): void {
        this.#name = name;
    }

    /**
     * Replaces the active profiles that will be applied before the context refreshes.
     *
     * @param profiles - The profile names to activate.
     */
    setProfiles(...profiles: string[]): void {
        this.#profiles = profiles;
    }

    /**
     * Sets the property sources that will be added during environment preparation.
     *
     * @param properties - Property values to expose to the application environment.
     */
    setProperties(properties: JSONObject): void {
        this.#properties = properties;
    }

    /**
     * Applies environment-level configuration before the application context is created.
     *
     * @param environment - The environment being prepared.
     * @param args - Command-line arguments supplied to the application.
     * @protected
     */
    protected _configureEnvironment(environment: ConfigurableEnvironment, args: string[]): void {
        this._configurePropertySources(environment, args);
        this._configureProfiles(environment, args);
    }

    /**
     * Applies the configured active profiles to the environment.
     *
     * @param environment - The environment being prepared.
     * @param args - Command-line arguments supplied to the application.
     * @protected
     */
    protected _configureProfiles(environment: ConfigurableEnvironment, args: string[]): void {
        if (this.#profiles.length) {
            environment.activeProfiles = this.#profiles;
        }
    }

    /**
     * Adds configured property sources to the environment.
     *
     * @param environment - The environment being prepared.
     * @param args - Command-line arguments supplied to the application.
     */
    protected _configurePropertySources(environment: ConfigurableEnvironment, args: string[]): void {
        if (this.#properties) {
            const sources = environment.propertySources;
            sources.push(this.#properties);
            environment.propertySources = sources; // trigger resolver rebuild
        }
    }

    /**
     * Creates and refreshes the application context.
     *
     * @param environment - The prepared environment.
     * @param args - Command-line arguments supplied to the application.
     * @returns The refreshed application context.
     */
    protected _prepareContext(environment: ConfigurableEnvironment, args: string[]): ConfigurableApplicationContext {
        const context = new MetadataConfigApplicationContext(this.#name ?? 'blue-application');
        context.setEnvironment(environment);

        // Conditions are evaluated against the environment + entry registry.
        const conditionContext = {
            getProperty: (key: string) => environment.getProperty(key),
            hasValue: (name: string) => context.hasValue(name),
        };
        // Platform auto-configurations are NOT registered here: @blue/boot is
        // isomorphic and must not import @blue/platform-node or DOM code.
        // Node apps pass NodeAutoConfiguration explicitly; browser apps pass
        // WebAutoConfiguration. Conditions still gate the user's own sources.
        this.#sources.forEach((source) => {
            if (isActive(source, conditionContext)) {
                context.register(source);
            }
        });
        context.refresh();

        // Build the RouteRegistry from @routeMapping decorator metadata
        const routes = new RouteRegistry();
        routes.scanSources(this.sources, context);
        context.setValue('routeRegistry', routes);
        return context;
    }

    /**
     * Prepares the environment used for application startup.
     *
     * @param args - Command-line arguments supplied to the application.
     * @returns The prepared environment.
     */
    protected _prepareEnvironment(args: string[]): ConfigurableEnvironment {
        const env = this._getOrCreateEnvironment();
        this._configureEnvironment(env, args);
        return env;
    }

    /**
     * Returns the configured environment or creates a standard one when none was supplied.
     *
     * @returns The existing or default environment.
     */
    private _getOrCreateEnvironment(): ConfigurableEnvironment {
        return this.#environment ? this.#environment : new StandardEnvironment();
    }

    /**
     * Closes the application and releases resources.
     * Emits the `'closed'` event, then destroys the emitter.
     */
    close(): void {
        this.emit('closed');
        super.destroy();
    }
}
