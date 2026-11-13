/**
 * View targeters that select a destination from the view name.
 */
import type { ViewTargetSelector } from './selector-view-targeter';
import { SelectorViewTargeter, type SelectorViewTargeterOptions } from './selector-view-targeter';

/**
 * Maps a view name to a selector.
 *
 * The map form is the safe default: a view name is only a lookup key, never
 * interpolated into selector text. The function form receives the name and is
 * responsible for escaping it (`idSelector` is the short safe form).
 */
export type NameSelectorResolver = Record<string, string> | ((viewName: string) => string | null | undefined);

/**
 * Targets the element named after the rendered view.
 *
 * @example
 * ```ts
 * // explicit map — a view name is a lookup key, not selector text
 * new NameViewTargeter({ shell: '#app', footer: '#site-footer' });
 *
 * // convention: view "hello" renders into #hello
 * new NameViewTargeter(idSelector);
 * ```
 */
export class NameViewTargeter extends SelectorViewTargeter {
    /**
     * Creates a name-driven targeter.
     *
     * @param selectors - A view-name → selector map, or a selector function.
     * @param options - Mount mode, event map, and document override.
     */
    constructor(selectors: NameSelectorResolver, options: SelectorViewTargeterOptions = {}) {
        const select: ViewTargetSelector = (context) => {
            const viewName = context.viewName;
            if (!viewName) {
                return null;
            }
            return typeof selectors === 'function' ? selectors(viewName) : (selectors[viewName] ?? null);
        };

        super(select, options);
    }
}
