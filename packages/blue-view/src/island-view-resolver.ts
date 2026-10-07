/**
 * Resolver that maps a view name to an `IslandView` (AD — view resolution.
 * @module blue-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractPathBasedViewResolver } from './view-resolver.js';
import { View } from './view.js';
import { customElementNamePattern, IslandView } from './island-view.js';

/**
 * Configuration for {@link IslandViewResolver}.
 */
export interface IslandViewResolverOptions {
    /**
     * Name filter. When set, only names matching these patterns resolve;
     * everything else falls through the resolver chain. Defaults to
     * {@link customElementNamePattern} so a default resolver claims only
     * names that are valid custom-element tags, never every view name.
     */
    viewNames?: (string | RegExp)[];
}

/**
 * Resolves view names to `IslandView` markers.
 *
 * Only names matching {@link IslandViewResolverOptions.viewNames} (by default
 * {@link customElementNamePattern}) resolve; every other name returns
 * `null` so the resolver chain continues (there is no implicit fallback — an
 * unmatched name is only served if a later resolver claims it, otherwise the
 * dispatcher's usual not-found path applies).
 *
 * @example
 * ```ts
 * const resolver = new IslandViewResolver();
 * const view = await resolver.resolveViewName('todo-app'); // IslandView('todo-app')
 * await resolver.resolveViewName('user'); // null — not a custom-element name
 * ```
 */
export class IslandViewResolver extends AbstractPathBasedViewResolver {
    /**
     * Creates an island resolver with an optional name filter.
     *
     * @param options - Name filter options.
     */
    constructor(options: IslandViewResolverOptions = {}) {
        super();
        this.viewNames = options.viewNames ?? [customElementNamePattern];
    }

    /**
     * Loads the `IslandView` for a name.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale hint (unused — tags are locale-free).
     * @returns The view, or `null` when filtered out.
     */
    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
        if (!this.supports(name, language)) {
            return null;
        }
        return new IslandView(name);
    }
}
