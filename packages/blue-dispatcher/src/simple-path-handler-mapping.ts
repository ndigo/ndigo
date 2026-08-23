import { ApplicationContext } from '@blue/context';
import { isString } from '@blue/util/types';
import { AbstractPathHandlerMapping } from './abstract-path-handler-mapping';
import { doesNotStartWithSlash } from './_shared';
import type { MaybeHandler } from './_shared';

const { keys } = Object;

/**
 * Implementation of the {@link RouteHandlerMapping|HandlerMapping} interface to map from paths to handlers.
 * @extends module:dispatcher.AbstractPathHandlerMapping
 * @param {module:core.ApplicationContext} [context]
 * @param {Map<external:string, module:dispatcher.MaybeHandler>} [mappings]
 */
/**
 * Map handlers from explicit path registrations.
 */
export class SimplePathHandlerMapping extends AbstractPathHandlerMapping {
    /**
     * Explicit path-to-handler mappings.
     */
    mappings!: Map<string, MaybeHandler>;

    get [Symbol.toStringTag](): string {
        return 'SimplePathHandlerMapping';
    }

    /**
     * Create an empty explicit path mapping.
     */
    constructor() {
        super();
        this.mappings = new Map<string, MaybeHandler>();
    }

    /**
     * Store the application context and register configured mappings.
     *
     * @param context - The application context to use.
     */
    setApplicationContext(context: ApplicationContext): void {
        super.setApplicationContext(context);
        const mappings = this.mappings;
        this.registerHandlers(mappings);
    }

    /**
     * Merge explicit path mappings into the registry.
     *
     * @param mappings - The path-to-handler map to merge.
     */
    setMappings(mappings: { [path: string]: MaybeHandler }): void {
        keys(mappings).forEach((path: string) => this.mappings.set(path, mappings[path]));
    }

    /**
     * Register handlers from a map, normalizing paths and handler names.
     *
     * @param mappings - The path-to-handler map to register.
     */
    registerHandlers(mappings: Map<string, MaybeHandler>): void {
        mappings &&
            mappings.size &&
            mappings.forEach((handler: MaybeHandler, path: string) => {
                path = doesNotStartWithSlash(path) ? `/${path}` : path;
                handler = isString(handler) ? (handler as string).trim() : handler;
                this._registerHandler(path, handler);
            });
    }
}