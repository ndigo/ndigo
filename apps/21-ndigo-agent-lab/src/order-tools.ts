/**
 * The tool surface: the same handlers serve HTTP, the MCP server, and the
 * agent loop. `@toolMapping` is the only tool-specific declaration.
 */
import { getMapping, parameters, pathVariable, requestMapping, toolMapping } from '@ndigo/dispatcher';

/**
 * One order in the lab's in-memory catalogue.
 */
export interface Order {
    readonly id: string;
    readonly customer: string;
    readonly total: number;
    readonly status: 'open' | 'shipped';
}

const ORDERS: readonly Order[] = [
    { id: 'a-1', customer: 'Ada', total: 42.5, status: 'open' },
    { id: 'b-2', customer: 'Grace', total: 17, status: 'shipped' },
];

/**
 * Order tools exposed to HTTP clients, MCP clients, and the agent.
 */
@requestMapping('/')
export class OrderTools {
    /**
     * Reads one order by id.
     *
     * @param id - The order id.
     * @returns The order, or a not-found marker.
     */
    @getMapping('/tools/orders/:id')
    @parameters({ id: pathVariable('id') })
    @toolMapping({ name: 'lookup_order', readOnly: true, description: 'Read one order by id.' })
    lookupOrder(id: string): Order | { error: string } {
        return ORDERS.find((order) => order.id === id) ?? { error: `order '${id}' not found` };
    }

    /**
     * Lists every order.
     *
     * @returns The order catalogue.
     */
    @getMapping('/tools/orders')
    @toolMapping({ name: 'list_orders', readOnly: true, description: 'List every order.' })
    listOrders(): readonly Order[] {
        return ORDERS;
    }
}
