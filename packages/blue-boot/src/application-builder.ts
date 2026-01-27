/**
 * @author Jeff Rose
 */

import { ApplicationContext, ConfigurableEnvironment } from '@blue/context';
import { JSONObject } from '@blue/core';
import { Application } from './application';

/**
 */
export class ApplicationBuilder {
    #application: Application;
    #context: ApplicationContext;
    #environment: ConfigurableEnvironment;
    #parent: ApplicationBuilder;
    #profiles: Set<string>;
    #properties: JSONObject;
    #running: boolean;
    #sources: Set<Function>;

    get application(): Application {
        return this.#application;
    }

    get context(): ApplicationContext {
        return this.#context;
    }

    constructor(sources: Function[], parent: ApplicationBuilder = null) {
        this.#application = new Application(sources);
        this.#parent = parent;
        this.#profiles = new Set<string>();
        this.#running = false;
        this.#sources = new Set<Function>();
    }

    build() {
        return this.#application;
    }

    child(...sources: Function[]): ApplicationBuilder {
        const child = new ApplicationBuilder(sources, this);
        child.sources(sources);
        child.properties(this.#properties).environment(this.#environment);
        return child;
    }

    environment(environment: ConfigurableEnvironment): ApplicationBuilder {
        this.#application.setEnvironment(environment);
        this.#environment = environment;
        return this;
    }

    parent(...sources: Function[]): ApplicationBuilder {
        if (this.#parent === null) {
            this.#parent = new ApplicationBuilder(sources);
        } else {
            this.#parent.sources(sources);
        }

        return this.#parent;
    }

    profiles(...profiles: string[]): ApplicationBuilder {
        const length = profiles.length;
        for (let index = 0; index < length; index++) {
            this.#profiles.add(profiles[index]);
        }
        this.#application.setProfiles(...this.#profiles);
        return this;
    }

    properties(properties: JSONObject): ApplicationBuilder {
        this.#properties = Object.assign(this.#properties, properties);
        this.#application.setProperties(this.#properties);
        if (this.#parent !== null) {
            this.#parent.properties(this.#properties);
            this.#parent.environment(this.#environment);
        }
        return this;
    }

    run(...args): ApplicationContext {
        if (this.#running) {
            return this.#context;
        } else {
            this.#context = this.build().run(/*args*/);
        }
        return this.#context;
    }

    sources(sources: Function[]): ApplicationBuilder {
        const length = sources.length;
        for (let index = 0; index < length; index++) {
            this.#sources.add(sources[index]);
        }
        return this;
    }
}
