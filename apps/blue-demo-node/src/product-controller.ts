/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { routeMapping, routeParams, pathValue } from '@blue/dispatcher';

/**
 * Demonstration controller for matrix-parameter routing.
 * Handles product routes under /api/products.
 */
@routeMapping('/api/products')
export class ProductController {
    /**
     * Returns product info, filtered by matrix param 'color'.
     * Only matches when the 'color' matrix parameter is present.
     * GET /api/products/:id;color=<value>
     */
    @routeMapping({ value: '/:id', matrixParams: 'color' })
    @routeParams({ id: pathValue('id') })
    getProduct(id: string) {
        return { product: { id, color: 'matched via matrix param' } };
    }

    /**
     * Returns product info without matrix-param filtering.
     * GET /api/products/:id  (fallback when no color matrix param)
     */
    @routeMapping('/:id')
    @routeParams({ id: pathValue('id') })
    getProductPlain(id: string) {
        return { product: { id, color: null } };
    }
}