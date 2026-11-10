/**
 * `GET /reports/orders`: the order report as an A2UI surface. Content
 * negotiation selects `application/a2ui+json`; JSON stays the default.
 *
 * The demo surface uses `Switch`, the simplest component the UI lab installs.
 * A2UI renders only the components an application installed, so a richer
 * surface would need those items in `ndigo.ui.json`.
 */
import { ModelAndView, getMapping, requestMapping } from '@ndigo/dispatcher';

/**
 * Builds the A2UI 1.0 messages for the order report surface.
 *
 * @returns The `createSurface` + `updateComponents` message array.
 */
export function orderSurfaceMessages(): readonly unknown[] {
    return [
        { version: '1.0', createSurface: { surfaceId: 'orders', catalogId: 'ndigo-ui' } },
        {
            version: '1.0',
            updateComponents: {
                surfaceId: 'orders',
                components: [{ id: 'root', component: 'Switch', checked: true }],
            },
        },
    ];
}

/**
 * Serves the order report in the representation the client accepts.
 */
@requestMapping('/reports')
export class ReportController {
    /**
     * @returns The `orders` logical view, negotiated as JSON or A2UI.
     */
    @getMapping('/orders')
    orders(): ModelAndView {
        return new ModelAndView('orders', orderSurfaceMessages());
    }
}
