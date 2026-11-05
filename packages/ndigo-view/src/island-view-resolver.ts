/**
 * Resolver that maps a view name to an `IslandView` (AD — view resolution.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractPathBasedViewResolver } from './view-resolver.js';
import { View } from './view.js';
import { customElementNamePattern, isValidCustomElementName, IslandView } from './island-view.js';

/**
 * Configuration for {@link IslandViewResolver}.
 */
export interface IslandViewResolverOptions {
    /**
     * Name filter. When set, only names matching these patterns resolve;
     * everything else falls through the resolver chain. Defaults to the
     * {@link isValidCustomElementName} predicate so a default resolver claims
     * only valid, non-reserved custom-element tags — never every view name.
     */
    viewNames?: (string | RegExp)[];
}

/**
 * Resolves view names to `IslandView` markers.
 *
 * Only names matching {@link IslandViewResolverOptions.viewNames} (by default
 * the {@link isValidCustomElementName} predicate) resolve; every other name
 * returns `null` so the resolver chain continues (there is no implicit
 * fallback — an unmatched name is only served if a later resolver claims it,
 * otherwise the dispatcher's usual not-found path applies).
 *
 * @example
 * ```ts
 * const resolver = new IslandViewResolver();
 * const view = await resolver.resolveViewName('todo-app'); // IslandView('todo-app')
 * await resolver.resolveViewName('user'); // null — not a custom-element name
 * await resolver.resolveViewName('font-face'); // null — reserved, not claimed
 * ```
 */
export class IslandViewResolver extends AbstractPathBasedViewResolver {
    /**
     * Whether the resolver is applying its built-in custom-element predicate
     * (no explicit `viewNames` option was supplied).
     */
    readonly #usesDefaultFilter: boolean;

    /**
     * Creates an island resolver with an optional name filter.
     *
     * @param options - Name filter options.
     */
    constructor(options: IslandViewResolverOptions = {}) {
        super();
        this.viewNames = options.viewNames ?? [customElementNamePattern];
        this.#usesDefaultFilter = options.viewNames === undefined;
    }

    /**
     * Returns whether this resolver claims the given name.
     *
     * With the default filter, a name must be a valid, non-reserved
     * custom-element tag ({@link isValidCustomElementName}) — reserved names
     * like `font-face` are NOT claimed and fall through as `null` instead of
     * reaching `new IslandView(...)`, which would throw. An explicit
     * `viewNames` filter keeps its own (string/RegExp) semantics.
     *
     * @param name - The view name to test.
     * @param language - Optional locale hint (unused — tags are locale-free).
     * @returns `true` when the name should resolve to an `IslandView`.
     */
    override supports(name: string, language?: unknown): boolean {
        if (!super.supports(name, language)) {
            return false;
        }
        return this.#usesDefaultFilter ? isValidCustomElementName(name) : true;
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
