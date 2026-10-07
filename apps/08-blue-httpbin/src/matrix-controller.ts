/**
 * Matrix-parameter binding probe: `/matrix/{id};color={color}` with a plain
 * fallback.
 * @module blue-httpbin
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    getMapping,
    matrixParamCondition,
    parameters,
    pathVariable,
    requestMapping,
    routeValue,
} from '@blue/dispatcher';
import type { Route } from '@blue/router';

/**
 * Reads a matrix parameter from any route segment's parsed data (the per-segment
 * `data` bag the router fills from `;key=value` pairs). The framework's
 * `matrixValue()` extractor keys the segment by the mapping's own path token
 * and therefore cannot reach a parameter attached to a `:param` segment — this
 * demo reads the segment directly.
 *
 * @param route - The dispatch route.
 * @param name - The matrix-parameter name.
 * @returns The first scalar value, or `null` when absent.
 */
function matrixParameter(route: Route, name: string): string | null {
    const length = route.length ?? 0;
    for (let index = 0; index < length; index++) {
        const value = route[index]?.data?.[name];
        if (typeof value === 'string') {
            return value;
        }
        if (Array.isArray(value) && typeof value[0] === 'string') {
            return value[0];
        }
    }
    return null;
}

/**
 * Demonstrates matrix-parameter routing (RFC 3986 §3.3): the colour-aware
 * mapping only matches a segment carrying `;color=<value>`, and a second
 * mapping serves the same path without matrix parameters.
 */
@requestMapping('/matrix')
export class MatrixController {
    /**
     * GET /matrix/:id;color=<color> — matches only when the matrix parameter is
     * present; the value is read from the matched segment.
     */
    @getMapping({ value: '/:id', matrixParams: matrixParamCondition('color'), private: false })
    @parameters({ route: routeValue(), id: pathVariable('id') })
    matrix(route: Route, id: string) {
        return { id, color: matrixParameter(route, 'color') };
    }

    /**
     * GET /matrix/:id — the fallback reached when no matrix parameter is sent.
     */
    @getMapping('/:id')
    @parameters({ id: pathVariable('id') })
    matrixPlain(id: string) {
        return { id, color: null };
    }
}
