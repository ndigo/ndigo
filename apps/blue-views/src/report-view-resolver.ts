import { AbstractPathBasedViewResolver, View } from '@blue/view';

/**
 * The demo's module-on-disk resolver: resolves a name to the view class
 * exported by a sibling module (ImportViewResolver semantics — the module IS
 * the view — with a path relative to this app rather than the framework).
 * The `import()` is app-relative so Vite bundles it and loads it lazily on
 * first resolution.
 */

const MODULES: Record<string, string> = {
    report: './views/report-view.ts',
};

/**
 * Resolves names to views loaded from app-level view modules.
 */
export class ReportViewResolver extends AbstractPathBasedViewResolver {
    /**
     * Dynamically imports the view module for a name and instantiates its
     * default export.
     *
     * @param name - The view name.
     * @returns The resolved view.
     */
    protected async _loadView(name: string): Promise<View | null> {
        const specifier = MODULES[name];
        if (!specifier) {
            return null;
        }
        const module = await import(/* @vite-ignore */ specifier);
        const ViewClass = (module as { default?: new () => View }).default;
        return ViewClass ? new ViewClass() : null;
    }
}
