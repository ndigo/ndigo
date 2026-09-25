/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    ConfigurableApplicationContext,
    ConfigurableEnvironment,
    Emitter,
    MetadataConfigApplicationContext,
    StandardEnvironment,
    CONFIG_REFRESH_EVENT,
    getScope,
    RemotePropertySource,
    RemoteSourceOptions,
} from '@blue/context';
import type { SecretDecryptor } from '@blue/context';
import { IllegalStateError, JSONObject } from '@blue/core';
import { RouteRegistry } from '@blue/router';
import { isActive } from '@blue/core';
import { parseCommandLineArgs, getEnvironmentSchema, validateEnvironment } from '@blue/context';
import { applyCustomizers } from '@blue/context';
import type { EnvironmentCustomizer } from '@blue/context';
import { z } from 'zod';
import { StandardConfigFileLoader } from './config-file-loader';
import { isConfigurationProperties, resolveConfigurationProperties } from './configuration-properties';

/**
 * Derives the entry bean name from a class name (`ServerConfig` →
 * `serverConfig` — the repo's `@entry serverConfig()` bean idiom).
 */
const camelCaseName = (className: string): string => className.charAt(0).toLowerCase() + className.slice(1);

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
    #refreshEnvironment: ConfigurableEnvironment | null = null;
    #refreshListener: (() => void) | null = null;
    #refreshFailHandler: ((error: Error) => void) | null = null;
    #name: string | null = null;
    #secretDecryptor: SecretDecryptor | null = null;
    #configServer: RemoteSourceOptions | null = null;
    #configServerSource: RemotePropertySource | null = null;
    #profiles: string[];
    #properties: JSONObject | null = null;
    #defaults: JSONObject | null = null;
    #configFileLoader: StandardConfigFileLoader | null = null;
    #customizers: EnvironmentCustomizer[] = [];
    #schema: z.ZodType | null = null;
    #sources: Set<Function>;

    /**
     * The active remote config source, when configured (AD-29 Wave 3).
     *
     * @returns The wired source, or `null` when no `configServer` is configured.
     */
    get configServerSource(): RemotePropertySource | null {
        return this.#configServerSource;
    }

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
            // Start remote-config polling once boot fully succeeded; stop it when
            // the returned context closes (D-6 lifecycle) so tests and shutdown
            // are clean.
            if (this.#configServerSource && this.#configServer?.pollMs) {
                this.#configServerSource.start();
                context.on('context:close', () => this.#configServerSource?.stop());
            }
            this.emit('started', context);
            return context;
        } catch (error: unknown) {
            // A polling source started before a later boot failure has no context
            // to stop it — tear it down here to avoid dangling intervals.
            this.#configServerSource?.stop();
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
     * Registers environment customizers, applied in registration order after
     * the environment is prepared and before the context reads it.
     *
     * @param customizers - The customizers to run.
     */
    setCustomizers(customizers: readonly EnvironmentCustomizer[]): void {
        this.#customizers = [...customizers];
    }

    /**
     * Sets a zod schema the prepared environment must satisfy (fail-loud boot).
     *
     * @param schema - The zod object schema of the environment's shape.
     */
    setValidationSchema(schema: z.ZodType): void {
        this.#schema = schema;
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
     * Attaches an at-rest secret decryptor (AD-29 Wave 2).
     *
     * Applied to the prepared environment in `_prepareEnvironment` (before the
     * context reads it), so `{cipher:...}` values resolve to plaintext for
     * `@configurationProperties` binding and every environment lookup.
     *
     * @param decryptor - The secret decryptor (e.g. a `SecretSchemeRegistry`).
     */
    setSecretDecryptor(decryptor: SecretDecryptor | null): void {
        this.#secretDecryptor = decryptor;
    }

    /**
     * Configures a remote config source (AD-29 Wave 3).
     *
     * Fetch-once at boot and optional polling of a JSON document, merged into
     * the environment at the documented `configServer` precedence slot. When
     * `pollMs` is set, boot starts polling and stops it when the returned
     * context closes.
     *
     * @param options - The remote source configuration, or `null` to disable.
     */
    setConfigServerOptions(options: RemoteSourceOptions | null): void {
        this.#configServer = options;
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
        const sources = environment.getPropertySources();
        if (this.#properties) {
            // `boot` sits directly BELOW `commandLine` and ABOVE every other
            // source (PrecedenceDoc: commandLine > boot > systemEnvironment >
            // dotenv > application > defaults). `systemEnvironment` registers at
            // platform construction, so insert AHEAD of it; without it, append
            // (boot is then the highest non-CLI source, as nothing above it is
            // present yet — defaults registers at the absolute end).
            if (sources.contains('systemEnvironment')) {
                sources.addBefore('systemEnvironment', 'boot', this.#properties);
            } else {
                sources.addLast('boot', this.#properties);
            }
        }
        const parsed = parseCommandLineArgs(args);
        if (Object.keys(parsed).length) {
            sources.addFirst('commandLine', parsed);
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

        // Auto-register @configurationProperties classes as bound entry beans
        // (AD-15 D1): after refresh so the environment is fully prepared.
        for (const source of this.#sources) {
            if (isConfigurationProperties(source)) {
                const name = camelCaseName(source.name);
                // Structural cast: `source` is a ctor (decorator-verified).
                const { instance } = resolveConfigurationProperties(source as new () => unknown, context);
                context.setValue(name, instance);
            }
        }

        // AD-29 D-2: live rebind — `@refreshScope` configuration classes
        // re-bind on every environment refresh (`config:refresh` event).
        // Unmarked classes keep the boot-time instance (snapshot identity).
        const refreshScoped = [...this.#sources].filter(
            (source) => isConfigurationProperties(source) && getScope(source) === 'refresh'
        );
        if (refreshScoped.length > 0) {
            if (this.#refreshListener && this.#refreshEnvironment) {
                this.#refreshEnvironment.off(CONFIG_REFRESH_EVENT, this.#refreshListener);
            }
            if (this.#refreshFailHandler && this.#refreshEnvironment) {
                this.#refreshEnvironment.off('error', this.#refreshFailHandler);
            }
            this.#refreshEnvironment = environment;
            // Fail-loud channel (ARC-1(b)): the emitter re-dispatches listener
            // exceptions as 'error' events; with NO handler they would vanish
            // (or worse, re-throw out of refresh() leaving the poll loop
            // responsible). Surface rebind failures to the console instead.
            this.#refreshFailHandler = (error: Error) => {
                console.error(
                    '[blue-boot] config:refresh rebind failure — the refresh may have half-applied ' +
                        '(ARC-1(c)): some classes rebound, others kept stale instances. ' +
                        'Correct the refresh source; the next refresh retries.',
                    error
                );
            };
            this.#refreshListener = () => {
                for (const source of refreshScoped) {
                    const name = camelCaseName(source.name);
                    // Per-class surfacing (ARC-1(c)): an IllegalStateError
                    // mid-loop is rethrown so the emitter's fail-loud 'error'
                    // channel reports it — it must not silently half-apply.
                    // deliberately NO rollback: earlier classes in this pass
                    // stay rebound (half-refresh caveat — the fail-loud
                    // handler's message states it); the next refresh retries
                    // the full set.
                    const { instance } = resolveConfigurationProperties(source as new () => unknown, context);
                    context.setValue(name, instance);
                }
            };
            environment.on(CONFIG_REFRESH_EVENT, this.#refreshListener);
            environment.on('error', this.#refreshFailHandler);
        }

        // Validate the environment against declared schemas (AD-17 D3):
        // explicit validateWith schema first, then @environment schemas on
        // registered sources. Invalid → fail boot loudly with the report.
        const schemas: z.ZodType[] = [];
        if (this.#schema) schemas.push(this.#schema);
        for (const source of this.#sources) {
            const declared = getEnvironmentSchema(source as new () => unknown);
            if (declared) schemas.push(declared);
        }
        for (const schema of schemas) {
            const env = context.environment;
            if (!env) continue;
            const result = validateEnvironment(env, schema);
            if (!result.valid) {
                const detail = result.issues
                    .map(
                        (issue) => `  - ${issue.path}: expected ${issue.expected}, got ${JSON.stringify(issue.actual)}`
                    )
                    .join('\n');
                throw new IllegalStateError(`Environment validation failed:\n${detail}`, undefined);
            }
        }

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
        await this._configureEnvironment(env, args);
        // The `defaults` source is ALWAYS present (empty when unused) at the
        // LOWEST precedence (AD-13 Q8): registered after every other source so
        // the registry order (first = highest) matches PrecedenceDoc exactly —
        // `commandLine > boot > … > application > defaults`. Earlier placement
        // (before files/boot) inverted the chain (defaults outranked builder
        // properties). AD-29 Wave 3 hardens this with the order-assertion spec.
        if (!env.getPropertySources().contains('defaults')) {
            env.getPropertySources().addLast('defaults', this.#defaults ?? {});
        }
        // Customizers run after the fully-wired environment, before the
        // context reads it (AD-16 D2); registration order, fail-loud.
        applyCustomizers(env, this.#customizers);
        // At-rest secret decryption (AD-29 Wave 2): apply after the environment
        // is fully wired (profiles/files/CLI/customizers) so every registered
        // source — including the config-server source in Wave 3 — is covered.
        // {cipher:...} markers resolve to plaintext for binding and lookups.
        if (this.#secretDecryptor) {
            env.applySecretDecryptor(this.#secretDecryptor);
        }
        // Remote config source (AD-29 Wave 3): fetch-once (and optionally poll)
        // a JSON document into the `configServer` slot. Runs AFTER customizers
        // and the secret decryptor so remote values are covered by both — the
        // "remote values decrypt too" decision (owner-confirmed 2026-09-25).
        // `optional: false` failures fail boot here, before a context exists.
        if (this.#configServer) {
            this.#configServerSource = new RemotePropertySource(env, this.#configServer);
            await this.#configServerSource.load();
        }
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
        // ARC-6: detach the rebind listener (+ fail-loud handler) so a closed
        // application is not reachable through the environment.
        if (this.#refreshEnvironment && this.#refreshListener) {
            this.#refreshEnvironment.off(CONFIG_REFRESH_EVENT, this.#refreshListener);
        }
        if (this.#refreshEnvironment && this.#refreshFailHandler) {
            this.#refreshEnvironment.off('error', this.#refreshFailHandler);
        }
        this.#refreshEnvironment = null;
        this.#refreshListener = null;
        this.#refreshFailHandler = null;
        super.destroy();
    }
}
