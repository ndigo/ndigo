/**
 * Concrete view resolvers: import-by-path, context lookup, and delegation.
 */
import { Null, type Constructable } from '@ndigo/core';
import { AsApplicationContextAware, likeApplicationContextAware } from '@ndigo/context';
import type { ApplicationContext } from '@ndigo/context';
import { Initializable, likeInitializable } from '@ndigo/factory';
import type { View } from './view.js';
import type { ViewResolver } from './view-resolver.js';
import { AbstractPathBasedViewResolver } from './abstract-path-based-view-resolver.js';

const { defineProperty } = Reflect;

/**
 * Resolves a view by importing the module at the resolved path.
 *
 * The view class is the module's default export; a name that escapes the
 * configured prefix is rejected by the path resolver.
 *
 * @example
 * ```ts
 * const instance = new ImportViewResolver();
 * ```
 */
export class ImportViewResolver extends AbstractPathBasedViewResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ImportViewResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ImportViewResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'ImportViewResolver';
    }

    /**
     * Loads a view module dynamically and instantiates its default export.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns A promise that resolves to the imported view instance, or `null`
     *   when the name is unsafe to import.
     */
    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
        // The module specifier is runtime-selected (a view name from the
        // application, not known at author time), so a static import cannot
        // express it. A request-derived name must never traverse out of the
        // prefix: a `..`/absolute/NUL name is unresolved (not-found), never
        // imported.
        if (!this.isSafeViewName(name)) {
            return null;
        }

        const path: string = `${this.prefix}${name}${this.suffix}`,
            ViewClass: Constructable<View> = await import(/* @vite-ignore */ path).then((module) => module.default);
        return new ViewClass();
    }
}

/**
 * A simple implementation of {@link ViewResolver|`ViewResolver`} that interprets a view name as a value in the current application context.
 *
 * This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.

 *
 * @example
 * ```ts
 * const instance = new NameViewResolver();
 * ```
 */
export class NameViewResolver extends AsApplicationContextAware(Null) implements ViewResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NameViewResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NameViewResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'NameViewResolver';
    }

    /**
     * The application context used as the view registry.
     */
    readonly applicationContext!: ApplicationContext;

    /**
     * Resolves a view from the application context by name.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns A promise that resolves to the matching view, or `null` when none is available.
     */
    async resolveViewName(name: string, language?: unknown): Promise<View | null> {
        const { applicationContext } = this;

        let view: View | null = null;

        // ApplicationContext extends ConfigurableFactory which extends Registry
        // Registry provides hasValue and getValue methods
        if (applicationContext.hasValue(name)) {
            view = applicationContext.getValue(name);
        }

        return view;
    }
}

/**
 * A {@link ViewResolver|`ViewResolver`} that delegates to others.
 *
 * @example
 * ```ts
 * const instance = new ViewResolverComposite();
 * ```
 */
export class ViewResolverComposite extends AsApplicationContextAware(Null) implements Initializable, ViewResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ViewResolverComposite".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ViewResolverComposite]"
     */
    get [Symbol.toStringTag](): string {
        return 'ViewResolverComposite';
    }

    /**
     * The ordered resolver chain consulted during lookup.
     */
    readonly viewResolvers!: ViewResolver[];

    /**
     * Creates a composite resolver with the given delegate list.
     *
     * @param viewResolvers - The resolvers to query in order.
     */
    constructor(viewResolvers: ViewResolver[] = []) {
        super();

        defineProperty(this, 'viewResolvers', {
            value: viewResolvers,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Initializes any delegates that expose the {@link Initializable} contract.
     *
     * @param args - Initialization arguments forwarded to delegates.
     */
    init(...args: unknown[]): void {
        const { viewResolvers } = this;
        const length = viewResolvers.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const viewResolver = viewResolvers[index];
                if (likeInitializable(viewResolver)) {
                    viewResolver.init(...args);
                }
            }
        }
    }

    /**
     * Resolves the requested view by querying delegates in order.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @param request - Optional per-call request forwarded to delegates that
     *   negotiate by request data.
     * @returns A promise that resolves to the first matching view, or `null` when none resolve.
     */
    async resolveViewName(name: string, language?: unknown, request?: unknown): Promise<View | null> {
        const { viewResolvers } = this;
        const length = viewResolvers.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const viewResolver = viewResolvers[index],
                    // oxlint-disable-next-line no-await-in-loop -- delegates resolve in priority order with first-match-wins; parallelizing would run every delegate and change which view is returned.
                    view = await viewResolver.resolveViewName(name, language, request);
                if (view) {
                    return view;
                }
            }
        }
        return null;
    }

    /**
     * Propagates the application context to context-aware delegates.
     *
     * @param applicationContext - The application context to share.
     */
    setApplicationContext(applicationContext: ApplicationContext) {
        const { viewResolvers } = this;
        const length = viewResolvers.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const viewResolver = viewResolvers[index];
                if (likeApplicationContextAware(viewResolver)) {
                    viewResolver.setApplicationContext(applicationContext);
                }
            }
        }
    }
}
