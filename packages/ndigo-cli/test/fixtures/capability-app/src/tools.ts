/**
 * One dispatch handler, exposed as an MCP tool through `@toolMapping`.
 */
import '@tsmetadata/polyfill';
import { getMapping, parameters, pathVariable, requestMapping, toolMapping } from '@ndigo/dispatcher';

/**
 * The fixture's tool surface.
 */
@requestMapping('/')
export class FixtureTools {
    /**
     * Reads one order by id.
     *
     * @param id - The order id.
     * @returns The order.
     */
    @getMapping('/orders/:id')
    @parameters({ id: pathVariable('id') })
    @toolMapping({ name: 'lookup_order', readOnly: true, description: 'Read one order by id.' })
    lookupOrder(id: string): { id: string } {
        return { id };
    }
}
