/**
 * @author Jeff Rose
 */

import { ApplicationContext, ConfigurableEnvironment, EventListener } from '@blue/context';
import { JSONObject } from '@blue/core';
import { Application } from './application';

/**
 * Builder for configuring and running an application bootstrap sequence.
 */
export class ApplicationBuilder {
    #application: Application;
    #context!: ApplicationContext;
    #environment!: ConfigurableEnvironment;
    #parent: ApplicationBuilder | null;
    #profiles: Set<string>;
    #properties: JSONObject;
    #running: boolean;
    #sources: Set<Function>;

    /**
     * Gets the configured application instance.
     *
     * @returns The application built by this builder.
     */
    get application(): Application {
        return this.#application;
    }

    /**
     * Gets the application context created by the builder after the first run.
     *
     * @returns The cached application context, if the builder has already run.
     */
    get context(): ApplicationContext {
        return this.#context;
    }

    /**
     * Creates a builder for the provided application source classes.
     *
     * @param sources - Source classes that should be included in the application.
     * @param parent - Optional parent builder used to share configuration.
     */
    constructor(sources: Function[], parent: ApplicationBuilder | null = null) {
        this.#application = new Application(sources);
        this.#parent = parent;
        this.#profiles = new Set<string>();
        this.#properties = {};
        this.#running = false;
        this.#sources = new Set<Function>();
    }

    /**
     * Builds the configured application instance.
     *
     * @returns The configured application.
     */
    build(): Application {
        return this.#application;
    }

    /**
     * Creates a child builder that inherits configuration from this builder.
     *
     * @param sources - Source classes to register on the child application.
     * @returns A child application builder.
     */
    child(...sources: Function[]): ApplicationBuilder {
        const child = new ApplicationBuilder(sources, this);
        child.properties(this.#properties);
        if (this.#environment) {
            child.environment(this.#environment);
        }
        return child;
    }

    /**
     * Creates a builder from a JSON configuration URL.
     *
     * Fetches the JSON config from the given URL and uses the top-level
     * `sources`, `profiles`, and `properties` keys to bootstrap the application.
     *
     * The `sources` array is expected to contain module specifiers that can be
     * dynamically imported as configuration classes.
     *
     * @param url - URL pointing to a JSON configuration file.
     * @returns A promise resolving to the configured builder.
     *
     * @example
     * ```ts
     * // config.json:
     * // {
     * //   "sources": ["@blue/AppConfig"],
     * //   "profiles": ["production"],
     * //   "properties": { "server.port": 8080 }
     * // }
     *
     * const app = await ApplicationBuilder.fromConfig('/config.json');
     * app.run();
     * ```
     */
    static async fromConfig(url: string | URL): Promise<ApplicationBuilder> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load config from ${url}: ${response.status}`);
        }
        const config = (await response.json()) as Record<string, unknown>;

        const sources: Function[] = [];
        const rawSources = config.sources;
        if (Array.isArray(rawSources)) {
            for (const specifier of rawSources) {
                const mod = await import(/* @vite-ignore */ specifier as string);
                const exported = (mod as Record<string, unknown>).default ?? mod;
                if (typeof exported === 'function') {
                    sources.push(exported as Function);
                }
            }
        }

        const builder = new ApplicationBuilder(sources);

        const rawProfiles = config.profiles;
        if (Array.isArray(rawProfiles)) {
            builder.profiles(...rawProfiles.map(String));
        }

        const rawProperties = config.properties;
        if (rawProperties && typeof rawProperties === 'object') {
            builder.properties(rawProperties as JSONObject);
        }

        return builder;
    }

    /**
     * Sets the environment used when the application prepares its context.
     *
     * @param environment - The environment to use for the application.
     * @returns This builder for chaining.
     */
    environment(environment: ConfigurableEnvironment): ApplicationBuilder {
        this.#application.setEnvironment(environment);
        this.#environment = environment;
        return this;
    }

    /**
     * Returns the parent builder, creating one if necessary.
     *
     * @param sources - Source classes for a newly created parent builder.
     * @returns The parent builder.
     */
    parent(...sources: Function[]): ApplicationBuilder {
        if (this.#parent === null) {
            this.#parent = new ApplicationBuilder(sources);
        }

        return this.#parent;
    }

    /**
     * Adds active profiles to the application configuration.
     *
     * @param profiles - Profile names to activate.
     * @returns This builder for chaining.
     */
    profiles(...profiles: string[]): ApplicationBuilder {
        const length = profiles.length;
        for (let index = 0; index < length; index++) {
            this.#profiles.add(profiles[index]);
        }
        this.#application.setProfiles(...this.#profiles);
        return this;
    }

    /**
     * Merges properties into the application configuration.
     *
     * @param properties - Property values to add to the environment.
     * @returns This builder for chaining.
     */
    properties(properties: JSONObject): ApplicationBuilder {
        properties = properties || {};
        this.#properties = Object.assign(this.#properties, properties);
        this.#application.setProperties(this.#properties);
        return this;
    }

    /**
     * Runs the configured application once and caches the resulting context.
     *
     * @param args - Command-line arguments passed to the application.
     * @returns The application context.
     */
    run(...args: string[]): ApplicationContext {
        if (this.#running) {
            return this.#context;
        } else {
            this.#context = this.build().run(...args);
            this.#running = true;
        }
        return this.#context;
    }

    /**
     * Adds source classes to the application configuration.
     *
     * @param sources - Source classes to register.
     * @returns This builder for chaining.
     */
    sources(sources: Function[]): ApplicationBuilder {
        const length = sources.length;
        for (let index = 0; index < length; index++) {
            const source = sources[index];
            this.#sources.add(source);
            this.#application.sources.add(source);
        }
        return this;
    }

    /**
     * Registers an event listener on the application, enabling lifecycle hooks.
     * Returns `this` for chaining with {@link run}.
     *
     * @param event - The event name (e.g. `'started'`, `'closed'`).
     * @param listener - The callback invoked when the event fires.
     * @returns This builder instance for chaining.
     *
     * @example
     * ```ts
     * ApplicationBuilder.from(MyConfig)
     *   .on('started', (ctx) => console.log('Ready', ctx))
     *   .run();
     * ```
     */
    on(event: string, listener: EventListener): this {
        this.#application.on(event, listener);
        return this;
    }
}
