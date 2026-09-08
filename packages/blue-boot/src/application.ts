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
 * Splits a comma-separated profile list, trimming + dropping empties.
 */
const splitProfiles = (raw: string): string[] =>
    raw
        .split(',')
        .map((profile) => profile.trim())
        .filter((profile) => profile.length > 0);

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
     * Applies the configured active profiles to the environment, in
     * precedence order (AD-14): CLI `--profiles.active=` > env
     * `BLUE_PROFILES_ACTIVE` > builder `.profiles()`. `profiles.default` /
     * `BLUE_PROFILES_DEFAULT` set the default set; `profiles.group.*` /
     * `BLUE_PROFILES_GROUPS` expand group names to members.
     *
     * @param environment - The environment being prepared.
     * @param args - Command-line arguments supplied to the application.
     * @protected
     */
    protected _configureProfiles(environment: ConfigurableEnvironment, args: string[]): void {
        const parsed = parseCommandLineArgs(args);

        // Lower-precedence first: builder (programmatic baseline), then env,
        // then CLI (deployer, most specific). Each later source REPLACES the
        // effective active set — precedence is last-writer-wins per channel.
        let active: string[] | null = null;
        let defaults: string[] | null = null;

        const fromBuilder = this.#profiles;
        if (fromBuilder.length) active = [...fromBuilder];

        const envActive = process.env.BLUE_PROFILES_ACTIVE;
        if (envActive) active = splitProfiles(envActive);

        const cli = parsed as Record<string, unknown>;
        const cliProfiles = (parsed as { profiles?: Record<string, unknown> }).profiles;
        const cliActive = typeof cliProfiles?.active === 'string' ? cliProfiles.active : undefined;
        if (cliActive) active = splitProfiles(cliActive);

        if (active) {
            environment.activeProfiles = active;
        } else if (this.#profiles.length === 0) {
            // No explicit activation anywhere → defaults may apply (P0 set).
            // The env's own defaultProfiles (if set) are consulted by gates.
        }

        // Defaults as config (profiles.default / BLUE_PROFILES_DEFAULT).
        const envDefault = process.env.BLUE_PROFILES_DEFAULT;
        if (envDefault) defaults = splitProfiles(envDefault);
        const cliDefault = typeof cliProfiles?.default === 'string' ? cliProfiles.default : undefined;
        if (cliDefault) defaults = splitProfiles(cliDefault);
        if (defaults) environment.defaultProfiles = defaults;

        // Profile groups: activating a group activates its members.
        const groups = this.#profileGroups(cli);
        if (groups.size && active) {
            const expanded = new Set<string>();
            for (const profile of active) {
                expanded.add(profile);
                for (const member of groups.get(profile) ?? []) expanded.add(member);
            }
            environment.activeProfiles = [...expanded];
        }
    }

    /**
     * Reads profile group mappings from CLI `--profiles.group.<name>=…` and
     * env `BLUE_PROFILES_GROUPS` (comma-separated `name=members` pairs).
     *
     * @param cli - The parsed CLI arguments.
     * @returns The group name → member-profiles map.
     */
    #profileGroups(cli: Record<string, unknown>): Map<string, string[]> {
        const groups = new Map<string, string[]>();
        const cliGroup = (cli as { profiles?: { group?: Record<string, unknown> } }).profiles?.group;
        if (cliGroup) {
            for (const [name, members] of Object.entries(cliGroup)) {
                if (typeof members === 'string') groups.set(name, splitProfiles(members));
            }
        }
        const envGroups = process.env.BLUE_PROFILES_GROUPS;
        if (envGroups) {
            // Pairs are `;`-separated; members within a pair are `,`-separated
            // (`short=dev,test;other=prod`) — a bare `,` is ambiguous as both
            // pair and member separator.
            for (const pair of envGroups.split(';')) {
                const eq = pair.indexOf('=');
                if (eq === -1) continue;
                groups.set(pair.slice(0, eq).trim(), splitProfiles(pair.slice(eq + 1)));
            }
        }
        return groups;
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
            acceptsProfiles: (expression: string) => environment.acceptsProfiles(expression),
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
