/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getMapping, parameters, pathVariable, requestMapping, matrixParamCondition } from '@blue/dispatcher';

/**
 * Demonstration controller for matrix-parameter routing.
 * Handles product routes under /api/products.
 */
@requestMapping('/api/products')
export class ProductController {
    /**
     * Returns product info, filtered by matrix param 'color'.
     * Only matches when the 'color' matrix parameter is present.
     * GET /api/products/:id;color=<value>
     */
    @getMapping({ value: '/:id', matrixParams: matrixParamCondition('color'), private: false })
    @parameters({ id: pathVariable('id') })
    getProduct(id: string) {
        return { product: { id, color: 'matched via matrix param' } };
    }

    /**
     * Returns product info without matrix-param filtering.
     * GET /api/products/:id  (fallback when no color matrix param)
     */
    @getMapping('/:id')
    @parameters({ id: pathVariable('id') })
    getProductPlain(id: string) {
        return { product: { id, color: null } };
    }
}
