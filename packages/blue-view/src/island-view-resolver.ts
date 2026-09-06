/**
 * Resolver that maps a view name to an `IslandView` (AD — view resolution
 * strategy).
 *
 * The server-side twin of `WebComponentViewResolver`: the same logical name
 * produces the server-rendered island marker (`<tag data-blue-island
 * data-blue-model="…">`) that the client later hydrates into the live
 * component. Node has no customElements registry — the name is the tag, and
 * the component module is loaded on the client by the hydrated bundle.
 *
 * @module
 */

import { AbstractPathBasedViewResolver } from './view-resolver.js';
import { View } from './view.js';
import { IslandView } from './island-view.js';

/**
 * Configuration for {@link IslandViewResolver}.
 */
export interface IslandViewResolverOptions {
    /**
     * Optional name filter. When set, only names matching these patterns
     * resolve; everything else falls through the resolver chain.
     */
    viewNames?: (string | RegExp)[];
}

/**
 * Resolves view names to `IslandView` markers.
 *
 * @example
 * ```ts
 * const resolver = new IslandViewResolver();
 * const view = await resolver.resolveViewName('todo-app'); // IslandView('todo-app')
 * ```
 */
export class IslandViewResolver extends AbstractPathBasedViewResolver {
    readonly #viewNames: (string | RegExp)[] | null;

    /**
     * Creates an island resolver with an optional name filter.
     *
     * @param options - Name filter options.
     */
    constructor(options: IslandViewResolverOptions = {}) {
        super();
        this.#viewNames = options.viewNames ?? null;
        this.viewNames = this.#viewNames;
    }

    /**
     * Loads the `IslandView` for a name.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale hint (unused — tags are locale-free).
     * @returns The view, or `null` when filtered out.
     */
    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
        if (this.viewNames && !this.supports(name, language)) {
            return null;
        }
        return new IslandView(name);
    }
}
