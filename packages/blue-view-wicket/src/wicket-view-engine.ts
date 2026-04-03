/**
 * @author Jeff Rose
 */
import type { Route } from '@blue/router';
import type { View, ViewEngine, ViewTarget } from '@blue/view';
import { WicketView } from './wicket-view';

/**
 * View engine that renders Wicket-style component trees.
 *
 * Delegates to the {@link WicketView}'s `render()` method, which
 * instantiates a Page, runs its lifecycle, and commits the output
 * to the target.
 */
export class WicketViewEngine implements ViewEngine {
    get [Symbol.toStringTag](): string {
        return 'WicketViewEngine';
    }

    /**
     * Renders a Wicket view into the target.
     *
     * @param view - The view to render (must be a `WicketView`).
     * @param model - The data model supplied to the view.
     * @param target - The destination for rendered output.
     * @param route - The current route for the render pass.
     * @throws {TypeError} When `view` is not a `WicketView`.
     */
    async render(view: View, model: any, target: ViewTarget, route: Route): Promise<void> {
        if (!(view instanceof WicketView)) {
            throw new TypeError('WicketViewEngine can only render WicketView instances.');
        }

        await view.render(model, route, target);
    }
}
