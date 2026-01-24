/**
 * @author Jeff Rose
 */
import { Application } from './application';
/**
 * @class module:boot.ApplicationBuilder
 */
export class ApplicationBuilder {
    #application;
    #context;
    #environment;
    #parent;
    #profiles;
    #properties;
    #running;
    #sources;
    get application() {
        return this.#application;
    }
    get context() {
        return this.#context;
    }
    constructor(sources, parent = null) {
        this.#application = new Application(sources);
        this.#parent = parent;
        this.#profiles = new Set();
        this.#running = false;
        this.#sources = new Set();
    }
    build() {
        return this.#application;
    }
    child(...sources) {
        const child = new ApplicationBuilder(sources, this);
        child.sources(sources);
        child.properties(this.#properties).environment(this.#environment);
        return child;
    }
    environment(environment) {
        this.#application.setEnvironment(environment);
        this.#environment = environment;
        return this;
    }
    parent(...sources) {
        if (this.#parent === null) {
            this.#parent = new ApplicationBuilder(sources);
        } else {
            this.#parent.sources(sources);
        }
        return this.#parent;
    }
    profiles(...profiles) {
        const length = profiles.length;
        for (let index = 0; index < length; index++) {
            this.#profiles.add(profiles[index]);
        }
        this.#application.setProfiles(...this.#profiles);
        return this;
    }
    properties(properties) {
        this.#properties = Object.assign(this.#properties, properties);
        this.#application.setProperties(this.#properties);
        if (this.#parent !== null) {
            this.#parent.properties(this.#properties);
            this.#parent.environment(this.#environment);
        }
        return this;
    }
    run(...args) {
        if (this.#running) {
            return this.#context;
        } else {
            this.#context = this.build().run(/*args*/);
        }
        return this.#context;
    }
    sources(sources) {
        const length = sources.length;
        for (let index = 0; index < length; index++) {
            this.#sources.add(sources[index]);
        }
        return this;
    }
}
//# sourceMappingURL=application-builder.js.map
