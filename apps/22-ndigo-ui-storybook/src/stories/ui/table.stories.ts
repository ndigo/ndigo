/**
 * UI/Table — native table styles, sortable headers, and numeric alignment.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface TableArgs {
    /** Applies the zebra treatment. */
    striped: boolean;
    /** Marks the amount column with `aria-sort`. */
    sorted: boolean;
}

const meta = {
    title: 'UI/Table',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/table') } },
    },
    argTypes: {
        striped: { control: 'boolean' },
        sorted: { control: 'boolean' },
    },
    args: { striped: false, sorted: true },
    render: ({ striped, sorted }) => html`
        <div class="nd-table-wrap">
            <table class="nd-table ${striped ? 'nd-table--striped' : ''}">
                <caption class="nd-table__caption">
                    Open invoices
                </caption>
                <thead>
                    <tr>
                        <th scope="col">Invoice</th>
                        <th scope="col">Customer</th>
                        <th scope="col" aria-sort=${sorted ? 'ascending' : 'none'}>
                            <button class="nd-table__sort" type="button">
                                Amount
                                <span class="nd-table__sort-icon" aria-hidden="true">↑</span>
                            </button>
                        </th>
                        <th scope="col" data-numeric>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${[
                        { id: 'INV-001', customer: 'Acme', amount: '$1,200.00' },
                        { id: 'INV-002', customer: 'Globex', amount: '$840.00' },
                        { id: 'INV-003', customer: 'Initech', amount: '$2,400.00' },
                    ].map(
                        (invoice) =>
                            html`<tr>
                                <td>${invoice.id}</td>
                                <td>${invoice.customer}</td>
                                <td data-numeric>${invoice.amount}</td>
                                <td data-numeric>${invoice.amount}</td>
                            </tr>`
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">Total</td>
                        <td data-numeric>$4,440.00</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `,
} satisfies Meta<TableArgs>;

export default meta;
type Story = StoryObj<TableArgs>;

/** The base table with a sortable amount header and numeric alignment. */
export const Default: Story = {};

/** The striped treatment, which alternates row backgrounds. */
export const Striped: Story = {
    args: { striped: true, sorted: false },
};
