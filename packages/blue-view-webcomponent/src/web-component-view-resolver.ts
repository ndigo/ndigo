/**
 * Resolver that maps a logical view name to a `WebComponentView` (AD — view
 * resolution strategy).
 *
 * Web components self-register: `customElements.define` runs as the side
 * effect of loading the component's module. The resolver therefore never
 * registers anything — it maps a name to a thin view descriptor:
 *
 * - **Zero-config** (`name === tagName`): no registry entry needed; the
 *   resolved view is `new WebComponentView(name)`, the tag the controller
 *   (or route) already names.
 * - **Registry entries** (logical names ≠ tags, and/or lazy loading):
 *   `{ 'todo': TodoAppClass }` for already-imported component classes, or
 *   `{ 'todo': './components/todo-app.ts' }` for module paths loaded with
 *   `import()` on first resolution (the Vite code-split point). The tag is
 *   the class's `@TagMapping` metadata, falling back to the view name.
 *
 * Caching comes from `AbstractCachingViewResolver` — resolved views are
 * stateless descriptors (tag name only), safe to share across requests.
 *
 * @module
 */

import { AbstractPathBasedViewResolver, View } from '@blue/view';
import { Constructable } from '@blue/core';
import { TagMapping } from './tag-mapping';
import { WebComponentView } from './view';

/** A component module: the class export may be the default or a plain export. */
interface ComponentModule {
    default?: unknown;
    [key: string]: unknown;
}

/**
 * Configuration for {@link WebComponentViewResolver}.
 */
export interface WebComponentViewResolverOptions {
    /**
     * Optional logical-name → component mapping. Values are either a
     * component class (eager; the module is already imported) or a module
     * path string (lazy; imported on first resolution).
     */
    registry?: Record<string, Constructable<HTMLElement> | string>;
    /**
     * Optional name filter. When set, only names matching these patterns
     * resolve; everything else falls through the resolver chain.
     */
    viewNames?: (string | RegExp)[];
}

/**
 * Builds a component class's tag name from its `@TagMapping` metadata.
 *
 * @param cls - The component class, or `undefined` when no class is known.
 * @param fallback - The tag used when the class carries no metadata.
 * @returns The tag name.
 */
function tagFor(cls: unknown, fallback: string): string {
    const tag = typeof cls === 'function' ? TagMapping.get(cls as object) : undefined;
    return tag ?? fallback;
}

/**
 * Loads a component module and returns its component class, if any.
 *
 * The class may be the module's default export or a named export carrying
 * `@TagMapping` metadata. `undefined` when the module exposes neither (the
 * module's side effect — `customElements.define` — is the registration; the
 * tag falls back to the view name).
 *
 * @param path - The module specifier to import.
 * @returns The component class, or `undefined`.
 */
async function loadComponentClass(path: string): Promise<Constructable<HTMLElement> | undefined> {
    const module: ComponentModule = await import(/* @vite-ignore */ path);
    if (typeof module.default === 'function' && TagMapping.has(module.default as object)) {
        return module.default as Constructable<HTMLElement>;
    }
    for (const value of Object.values(module)) {
        if (typeof value === 'function' && TagMapping.has(value as object)) {
            return value as Constructable<HTMLElement>;
        }
    }
    return undefined;
}

/**
 * Resolves view names to `WebComponentView` descriptors.
 *
 * @example
 * ```ts
 * // zero-config: 'todo-app' → WebComponentView('todo-app')
 * const resolver = new WebComponentViewResolver();
 *
 * // registry: logical name → component class (eager) or module path (lazy)
 * const resolver = new WebComponentViewResolver({
 *     registry: { todo: TodoApp, 'legacy-list': './components/legacy-list.ts' },
 * });
 * ```
 */
export class WebComponentViewResolver extends AbstractPathBasedViewResolver {
    readonly #registry: Record<string, Constructable<HTMLElement> | string>;

    /**
     * Creates a resolver with an optional component registry.
     *
     * @param options - Registry + name filter options.
     */
    constructor(options: WebComponentViewResolverOptions = {}) {
        super();
        this.#registry = options.registry ?? {};
        this.viewNames = options.viewNames ?? null;
    }

    /**
     * Loads the `WebComponentView` for a name.
     *
     * With a registry entry the tag comes from the entry's `@TagMapping`
     * metadata (importing the module when the entry is a path); without an
     * entry the name is the tag.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale hint (unused — tags are locale-free).
     * @returns The view, or `null` when filtered out.
     */
    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
        if (this.viewNames && !this.supports(name, language)) {
            return null;
        }

        const entry: Constructable<HTMLElement> | string | undefined = this.#registry[name];
        if (entry === undefined) {
            return new WebComponentView(name);
        }

        const cls = typeof entry === 'string' ? await loadComponentClass(entry) : entry;
        return new WebComponentView(tagFor(cls, name));
    }
}
