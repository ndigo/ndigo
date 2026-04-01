/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';
import { View } from './view';
import { ViewTarget } from './view-target';

/**
 * Translates a view and model into a rendered output for a target.
 *
 * Engines own the rendering format; targets own the destination.
 */
export interface ViewEngine {
    /**
     * Renders the view and commits the output to the target.
     *
     * @param view - The view to render.
     * @param model - The data model supplied to the view.
     * @param target - The destination that receives the rendered output.
     * @param route - The current route used during rendering.
     * @returns A promise that resolves when rendering completes.
     */
    render(view: View, model: any, target: ViewTarget, route: Route): Promise<void>;
}
