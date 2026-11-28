/**
 * Renders EJS template strings to HTML with bounded include resolution.
 */
import ejs from 'ejs';
import { resolve, sep } from 'node:path';
import { FrameworkError } from '@ndigo/core';

/**
 * Raised when EJS `include(...)` recursion exceeds the depth bound, or revisits
 * a template already open in the current include chain (a cycle).
 *
 * Bounded and named so a cyclic include fails deterministically — with a
 * message naming the offending specifier — instead of overflowing the call
 * stack (`RangeError: Maximum call stack size exceeded`) and leaking stray
 * unhandled rejections.
 *
 * @example
 * ```ts
 * try {
 *     await engine.render(template, model, 'views/home');
 * } catch (error) {
 *     if (error instanceof EJSIncludeCycleError) {
 *         // cyclic include detected
 *     }
 * }
 * ```
 */
export class EJSIncludeCycleError extends FrameworkError {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "EJSIncludeCycleError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object EJSIncludeCycleError]"
     */
    get [Symbol.toStringTag](): string {
        return 'EJSIncludeCycleError';
    }

    /**
     * Creates the cycle/overflow error for the offending include specifier.
     *
     * @param specifier - The include path that closed or overflowed the chain.
     * @param depth - The include nesting depth reached.
     */
    constructor(specifier: string, depth: number) {
        super(`EJS include cycle or excessive nesting at "${specifier}" (depth ${depth}).`);
    }
}

/** Per-render include bookkeeping: true nesting depth and the open path chain. */
interface IncludeState {
    depth: number;
    open: Set<string>;
}

/**
 * Options accepted by {@link EJSTemplateEngine}.
 *
 * @example
 * ```ts
 * const engine = new EJSTemplateEngine({ options: { delimiter: '?' } });
 * ```
 */
export interface EJSTemplateEngineOptions {
    /**
     * EJS render options forwarded to `ejs.render` (delimiter, cache, root,
     * strict, etc.).
     */
    options?: ejs.Options;
}

/** Cap on concurrently compiled template sources. */
const MAX_COMPILED = 64;

/**
 * Maximum `include(...)` nesting depth. A template graph deeper than this is
 * treated as a cycle and fails fast with {@link EJSIncludeCycleError}.
 */
const MAX_INCLUDE_DEPTH = 32;

/**
 * Returns whether `candidate` is the root itself or lives beneath it. The
 * comparison is lexical (after `resolve`), matching ejs's own resolution;
 * symlinks inside the root stay trusted.
 */
function isContained(candidate: string, root: string): boolean {
    const base = resolve(root);
    const target = resolve(candidate);
    return target === base || target.startsWith(base.endsWith(sep) ? base : `${base}${sep}`);
}

/**
 * Renders EJS template strings to HTML using the `ejs` package.
 *
 * The adapter operates purely on a source string and returns a string, so it is
 * platform-agnostic: it runs identically in Node and in a browser/jsdom test
 * environment. File resolution for path-backed views is owned by an injected
 * `ResourceLoader` (see `@ndigo/context`), keeping this package free of
 * platform I/O.
 *
 * Templates are compiled in **async mode** (`async: true`): methods are async
 * by convention in Ndigo, so locale helpers like `t` resolve to promises and
 * template expressions await them (`<%= await t('key') %>`). Plain synchronous
 * interpolations are unaffected.
 *
 * Templates are **compiled once per (filename, source) key** and the compiled
 * function reused for every subsequent render — `ejs.render` re-compiles on
 * every call, and ejs's own cache requires `cache: true`. The filename is part
 * of the key because it changes how `include(...)` paths resolve. The compiled
 * cache is bounded: when it exceeds its cap it resets so long-lived processes
 * cannot grow it without limit. A template's compiled form therefore reflects
 * the first source seen for that key; inline templates are immutable strings,
 * so this is unobservable for all practical usage.
 *
 * `include(...)` targets are resolved and read from the filesystem by ejs. Each
 * render threads a guarded `include` local through the include chain, so a
 * cyclic include (a includes b includes a) fails fast with a bounded, named
 * {@link EJSIncludeCycleError} instead of overflowing the call stack. The guard
 * relies on ejs's default `with (locals)` scoping; an `options.strict: true`
 * (which disables `with`) opts out of it, as does any template that references
 * ejs's own `include` parameter directly.
 *
 * @example
 * ```ts
 * const engine = new EJSTemplateEngine();
 * const html = await engine.render('Hello <%= name %>', { name: 'world' });
 * ```
 */
export class EJSTemplateEngine {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "EJSTemplateEngine".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object EJSTemplateEngine]"
     */
    get [Symbol.toStringTag](): string {
        return 'EJSTemplateEngine';
    }

    readonly #options: ejs.Options;
    readonly #compiled = new Map<string, ejs.AsyncTemplateFunction>();

    constructor(options: EJSTemplateEngineOptions = {}) {
        // `async: true` is non-negotiable: locale helpers resolve to promises,
        // so `await` must be legal in template bodies.
        this.#options = { ...options.options, async: true };
    }

    /**
     * Render an EJS template string against the given model.
     *
     * @param template - The EJS template source.
     * @param model - The data model exposed to the template.
     * @param filename - Optional path of the template source. ejs uses it to
     *   resolve `include(...)` paths: a relative include resolves next to this
     *   file. Omit it for inline templates — relative includes then cannot
     *   resolve. Includes are async in this engine, so templates MUST write
     *   `<%- await include('partial') %>`; an un-awaited include interpolates a
     *   `Promise` and renders as `[object Promise]`.
     * @returns The rendered HTML string.
     */
    async render(template: string, model: object | null | undefined, filename?: string): Promise<string> {
        return this.#render(template, model, filename, { depth: 0, open: new Set<string>() });
    }

    /**
     * Renders a template with an include-chain guard threaded through its
     * locals.
     *
     * @param template - The EJS template source.
     * @param model - The data model exposed to the template.
     * @param filename - The template's filename, for relative include resolution.
     * @param state - The shared per-render include bookkeeping.
     * @returns The rendered HTML string.
     */
    async #render(
        template: string,
        model: object | null | undefined,
        filename: string | undefined,
        state: IncludeState
    ): Promise<string> {
        const locals: Record<string, unknown> = model != null ? { ...(model as object) } : {};
        // Inject a guarded `include` into the locals. ejs compiles templates
        // with `with (locals)`, so this property shadows ejs's own `include`
        // parameter and every include in the graph flows through the guard.
        locals.include = (spec: string, includeData?: unknown) =>
            this.#include(spec, includeData, filename, locals, state);
        return this.#compiledFor(template, filename)(locals);
    }

    /**
     * Returns the cached compiled form for a (template, filename) key,
     * compiling on first use.
     *
     * @param template - The EJS template source.
     * @param filename - The template's filename (part of the cache key).
     * @returns The compiled async template function.
     */
    #compiledFor(template: string, filename: string | undefined): ejs.AsyncTemplateFunction {
        const cacheKey = filename === undefined ? template : `${filename}\u0000${template}`;
        let compiled = this.#compiled.get(cacheKey);
        if (compiled === undefined) {
            const asyncOptions = {
                ...(this.#options as ejs.Options & { async: true; client?: false }),
                filename,
            };
            // Options always carry `async: true` (forced in the constructor),
            // so the compile overload resolution picks the async template fn.
            compiled = ejs.compile(template, asyncOptions) as ejs.AsyncTemplateFunction;
            if (this.#compiled.size >= MAX_COMPILED) {
                this.#compiled.clear();
            }
            this.#compiled.set(cacheKey, compiled);
        }
        return compiled;
    }

    /**
     * Resolves and renders an `include(...)` target, guarded against cycles.
     *
     * @param spec - The include specifier (relative or absolute).
     * @param includeData - Optional data merged over the parent locals.
     * @param parentFilename - The including template's filename.
     * @param parentModel - The including template's locals.
     * @param state - The shared per-render include bookkeeping.
     * @returns The rendered include output.
     * @throws When the include chain revisits a template
     *   or exceeds {@link MAX_INCLUDE_DEPTH}.
     */
    async #include(
        spec: string,
        includeData: unknown,
        parentFilename: string | undefined,
        parentModel: Record<string, unknown>,
        state: IncludeState
    ): Promise<string> {
        const resolved = this.#resolveIncludePath(spec, parentFilename);
        if (state.open.has(resolved) || state.depth >= MAX_INCLUDE_DEPTH) {
            throw new EJSIncludeCycleError(spec, state.depth);
        }

        const locals: Record<string, unknown> = { ...parentModel };
        if (includeData != null && typeof includeData === 'object') {
            Object.assign(locals, includeData);
        }
        // Rebind `include` to the child filename so the child's own relative
        // includes resolve next to it (and stay depth-scoped).
        locals.include = (childSpec: string, childData?: unknown) =>
            this.#include(childSpec, childData, resolved, locals, state);

        state.depth += 1;
        state.open.add(resolved);
        try {
            // ejs reads/compiles the file and, because the merged locals carry
            // our guarded `include`, the child's `with (locals)` scope uses it.
            return await ejs.renderFile(resolved, locals, {
                ...(this.#options as ejs.Options & { async: true }),
            });
        } finally {
            state.depth -= 1;
            state.open.delete(resolved);
        }
    }

    /**
     * Resolves an include specifier to an absolute path, mirroring ejs's
     * `getIncludePath` semantics but confining the result to `options.root`:
     * - absolute specifiers resolve against the configured roots (never the
     *   filesystem root) and must stay inside one of them;
     * - relative specifiers resolve next to the including template and, when a
     *   root is configured, must stay inside one of the roots.
     *
     * @param spec - The include specifier.
     * @param parentFilename - The including template's filename, if any.
     * @returns The resolved absolute path.
     * @throws When the include cannot be resolved or escapes the configured roots.
     */
    #resolveIncludePath(spec: string, parentFilename: string | undefined): string {
        const rootOption = this.#options.root;
        const roots = rootOption === undefined ? [] : Array.isArray(rootOption) ? rootOption : [rootOption];
        const isAbsolute = /^[A-Za-z]+:\\|^\//.test(spec);

        if (isAbsolute) {
            if (roots.length === 0) {
                throw new FrameworkError(
                    `Absolute EJS include "${spec}" requires options.root — refusing to resolve against the filesystem root.`
                );
            }
            const relative = spec.replace(/^\/*/, '');
            for (const root of roots) {
                const resolved = ejs.resolveInclude(relative, root, true);
                if (isContained(resolved, root)) {
                    return resolved;
                }
            }
            throw new FrameworkError(`EJS include "${spec}" resolves outside the configured root.`);
        }

        if (!parentFilename) {
            throw new FrameworkError(
                `Could not resolve EJS include "${spec}": no parent template filename was supplied.`
            );
        }

        const resolved = ejs.resolveInclude(spec, parentFilename);
        if (roots.length === 0 || roots.some((root) => isContained(resolved, root))) {
            return resolved;
        }
        throw new FrameworkError(`EJS include "${spec}" resolves outside the configured root.`);
    }
}
