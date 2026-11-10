/**
 * The `ui://orders` MCP App: one self-contained document the host renders in a
 * sandboxed iframe after `list_orders`. `createUiResource` inlines the CSS and
 * script and rejects `</style>`/`</script>` breakouts; the demo keeps the
 * markup static, so the document never talks back to the host.
 */
import { createUiResource } from '@ndigo/mcp';

/** The order catalogue surface linked from `list_orders`. */
export const ordersUi = createUiResource({
    uri: 'ui://orders',
    name: 'Orders',
    description: 'The order catalogue rendered by an MCP Apps host.',
    title: 'Orders',
    body: `<main>
    <h1>Orders</h1>
    <table>
        <thead>
            <tr><th>Id</th><th>Customer</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
            <tr><td>a-1</td><td>Ada</td><td>42.50</td><td>open</td></tr>
            <tr><td>b-2</td><td>Grace</td><td>17.00</td><td>shipped</td></tr>
        </tbody>
    </table>
</main>`,
    css: `body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; color: #1f2328; }
h1 { font-size: 1.1rem; margin: 0 0 0.75rem; }
table { border-collapse: collapse; width: 100%; }
th, td { text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid #d0d0d0; }
th { font-weight: 600; }`,
});
