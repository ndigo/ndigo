/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';
import { View } from './view';
import { ViewTarget } from './view-target';

/**
 * A ViewEngine translates a View definition and a Model into a specific format
 * (e.g., a DOM element, a React Node, an HTML string) and commits it to a ViewTarget.
 */
export interface ViewEngine {
    /**
     * Renders the view and commits the output to the target.
     */
    render(view: View, model: any, target: ViewTarget, route: Route): Promise<void>;
}
