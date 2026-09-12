/**
 * @blue/view — template source resolution.
 *
 * @module
 * @since 1.0.0
 */

import { IllegalStateError } from '@blue/core';

/**
 * Resolves the raw source of a template by its logical path.
 *
 * This is the input-side platform seam for template-based views: Node supplies
 * a filesystem implementation, browser/tests supply an in-memory one. Keeping
 * resolution behind this interface leaves template engines and views free of
 * any platform I/O.
 */
export interface TemplateSourceProvider {
    /**
     * Load the template source for the given path.
     *
     * @param path - The resolved template path (prefix + name + suffix).
     * @returns The template source, or a promise resolving to it.
     */
    loadTemplate(path: string): string | Promise<string>;
}

/**
 * A {@link TemplateSourceProvider} backed by an in-memory map of path to source.
 *
 * Useful for tests, browser rendering with bundled templates, and prototypes
 * where template text is known at construction time.
 */
export class InMemoryTemplateSourceProvider implements TemplateSourceProvider {
    readonly #sources = new Map<string, string>();

    /**
     * Register a template source under the given path.
     *
     * @param path - The template path to register.
     * @param template - The template source text.
     * @returns This provider, for chaining.
     */
    set(path: string, template: string): this {
        this.#sources.set(path, template);
        return this;
    }

    /** @inheritdoc */
    loadTemplate(path: string): string {
        const source = this.#sources.get(path);
        if (source === undefined) {
            throw new IllegalStateError(`Template source not found in provider: ${path}`);
        }
        return source;
    }
}
