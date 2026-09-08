import {
    ConfigurableApplicationContext,
    ConfigurableEnvironment,
    Emitter,
    MetadataConfigApplicationContext,
    StandardEnvironment,
} from '@blue/context';
import { IllegalStateError, JSONObject } from '@blue/core';
import { RouteRegistry } from '@blue/router';
import { isActive } from '@blue/core';
import { parseCommandLineArgs } from '@blue/context';
import { StandardConfigFileLoader } from './config-file-loader';

/**
 * Class that can be used to bootstrap and launch an application.
 *
 * @param {string} name The name of the application


 */
export class Application extends Emitter {
    #environment: ConfigurableEnvironment | null = null;
    #name: string | null = null;
    #profiles: string[];
    #properties: JSONObject | null = null;
    #defaults: JSONObject | null = null;
    #configFileLoader: StandardConfigFileLoader | null = null;
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
    async run(...args: string[]): Promise<ConfigurableApplicationContext> {
        try {
            const environment = await this._prepareEnvironment(args);
            const context = this._prepareContext(environment, args);
            this.emit('started', context);
            return context;
        } catch (error: unknown) {
            throw new IllegalStateError(
                'Application startup failed',
                error instanceof Error ? { cause: error } : { cause: new Error(String(error)) }
            );
        }
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
     * Sets the config-file loader used during environment preparation (AD-13).
     *
     * @param loader - The loader, or `null` to disable file loading.
     */
    setConfigFileLoader(loader: StandardConfigFileLoader | null): void {
        this.#configFileLoader = loader;
    }

    /**
     * Sets the default property source (lowest precedence; always present).
     *
     * @param defaults - The default property values.
     */
    setDefaults(defaults: JSONObject): void {
        this.#defaults = defaults;
    }

    /**
     * Applies environment-level configuration before the application context is created.
     *
     * Order matters (AD-13): profiles first (file loading is profile-aware),
     * then config files, then CLI + builder sources (CLI > boot > files > env
     * > defaults).
     *
     * @param environment - The environment being prepared.
     * @param args - Command-line arguments supplied to the application.
     * @protected
     */
    protected async _configureEnvironment(environment: ConfigurableEnvironment, args: string[]): Promise<void> {
        this._configureProfiles(environment, args);
        if (this.#configFileLoader) {
            await this.#configFileLoader.load(environment);
        }
        this._configurePropertySources(environment, args);
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
            environment.getPropertySources().addLast('boot', this.#properties);
        }
        const parsed = parseCommandLineArgs(args);
        if (Object.keys(parsed).length) {
            environment.getPropertySources().addFirst('commandLine', parsed);
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
    protected async _prepareEnvironment(args: string[]): Promise<ConfigurableEnvironment> {
        const env = this._getOrCreateEnvironment();
        // The defaults source is always present (empty when unused), lowest
        // precedence (AD-13 Q8).
        if (!env.getPropertySources().contains('defaults')) {
            env.getPropertySources().addLast('defaults', this.#defaults ?? {});
        }
        await this._configureEnvironment(env, args);
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
