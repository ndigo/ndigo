import '@tsmetadata/polyfill';
import { getMapping, routeParams, pathValue } from '@blue/dispatcher';

/**
 * Demonstration controller for matrix-parameter routing.
 * Handles product routes under /api/products.
 */
@getMapping('/api/products')
export class ProductController {
    /**
     * Returns product info, filtered by matrix param 'color'.
     * Only matches when the 'color' matrix parameter is present.
     * GET /api/products/:id;color=<value>
     */
    @getMapping({ value: '/:id', matrixParams: 'color', private: false })
    @routeParams({ id: pathValue('id') })
    getProduct(id: string) {
        return { product: { id, color: 'matched via matrix param' } };
    }

    /**
     * Returns product info without matrix-param filtering.
     * GET /api/products/:id  (fallback when no color matrix param)
     */
    @getMapping('/:id')
    @routeParams({ id: pathValue('id') })
    getProductPlain(id: string) {
        return { product: { id, color: null } };
    }
}
