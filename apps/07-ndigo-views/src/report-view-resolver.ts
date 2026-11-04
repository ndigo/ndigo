/**
 * @module ndigo-views
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractPathBasedViewResolver, type View } from '@ndigo/view';

/**
 * The demo's module-on-disk resolver: resolves a name to the view class
 * exported by a sibling module (ImportViewResolver semantics — the module IS
 * the view — with a path relative to this app rather than the framework).
 * The `import()` is app-relative so Vite bundles it and loads it lazily on
 * first resolution.
 */

type ViewModule = { default?: new () => View };

const MODULES: Record<string, () => Promise<ViewModule>> = {
    report: () => import('./views/report-view'),
};

/**
 * Resolves names to views loaded from app-level view modules.
 */
export class ReportViewResolver extends AbstractPathBasedViewResolver {
    /**
     * Loads the statically analysable view-module thunk for a name and
     * instantiates its default export.
     *
     * @param name - The view name.
     * @returns The resolved view.
     */
    protected async _loadView(name: string): Promise<View | null> {
        const load = MODULES[name];
        if (!load) {
            return null;
        }
        const module = await load();
        const ViewClass = module.default;
        return ViewClass ? new ViewClass() : null;
    }
}
