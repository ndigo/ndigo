/**
 * Blocks/Data Table — authored rows plus the block's sorting, selection, and
 * pagination glue.
 */
import { initDataTable } from '@registry/blocks/data-table/data-table';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface Invoice {
    id: string;
    customer: string;
    amount: number;
    status: 'Paid' | 'Sent' | 'Overdue';
}

interface DataTableArgs {
    /** Rows rendered into `[data-rows]`; `id` is the selection key. */
    rows: Invoice[];
    /** Rows per page (`data-page-size`). */
    pageSize: number;
    /** Applies `nd-table--striped`. */
    striped: boolean;
}

const INVOICES: Invoice[] = [
    { id: 'INV-001', customer: 'Acme', amount: 1200, status: 'Paid' },
    { id: 'INV-002', customer: 'Globex', amount: 840, status: 'Sent' },
    { id: 'INV-003', customer: 'Initech', amount: 2400, status: 'Overdue' },
    { id: 'INV-004', customer: 'Umbrella', amount: 300, status: 'Paid' },
    { id: 'INV-005', customer: 'Hooli', amount: 5600, status: 'Sent' },
    { id: 'INV-006', customer: 'Soylent', amount: 120, status: 'Overdue' },
    { id: 'INV-007', customer: 'Vehement', amount: 980, status: 'Paid' },
    { id: 'INV-008', customer: 'Massive Dynamic', amount: 4100, status: 'Sent' },
    { id: 'INV-009', customer: 'Wonka', amount: 1560, status: 'Paid' },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const meta = {
    title: 'Blocks/Data Table',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('blocks/data-table') } },
    },
    argTypes: {
        rows: { control: 'object', description: 'Authored rows; one `[data-row-id]` per invoice.' },
        pageSize: { control: { type: 'number', min: 1, max: 9, step: 1 } },
        striped: { control: 'boolean' },
    },
    args: { rows: INVOICES, pageSize: 3, striped: true },
    render: ({ rows, pageSize, striped }) => html`
        <div class="nd-data-table" data-data-table data-page-size=${String(pageSize)}>
            <div class="nd-table-wrap">
                <table class="nd-table ${striped ? 'nd-table--striped' : ''} nd-data-table__table">
                    <caption class="nd-table__caption">
                        Invoices
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col" class="nd-data-table__select">
                                <input
                                    class="nd-checkbox"
                                    type="checkbox"
                                    data-select-all
                                    aria-label="Select all rows on this page"
                                />
                            </th>
                            <th scope="col" data-sort-key="invoice" data-sort-type="text">
                                <button class="nd-table__sort" type="button">
                                    Invoice
                                    <span class="nd-table__sort-icon" aria-hidden="true">↕</span>
                                </button>
                            </th>
                            <th scope="col" data-sort-key="customer" data-sort-type="text">
                                <button class="nd-table__sort" type="button">
                                    Customer
                                    <span class="nd-table__sort-icon" aria-hidden="true">↕</span>
                                </button>
                            </th>
                            <th scope="col" data-sort-key="amount" data-sort-type="number" data-numeric>
                                <button class="nd-table__sort" type="button">
                                    Amount
                                    <span class="nd-table__sort-icon" aria-hidden="true">↕</span>
                                </button>
                            </th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody data-rows>
                        ${rows.map(
                            (invoice) =>
                                html`<tr data-row-id=${invoice.id}>
                                    <td class="nd-data-table__select">
                                        <input
                                            class="nd-checkbox"
                                            type="checkbox"
                                            data-select-row
                                            aria-label="Select ${invoice.id}"
                                        />
                                    </td>
                                    <td data-sort-value=${invoice.id}>${invoice.id}</td>
                                    <td>${invoice.customer}</td>
                                    <td data-numeric data-sort-value=${String(invoice.amount)}>
                                        ${money.format(invoice.amount)}
                                    </td>
                                    <td>${invoice.status}</td>
                                </tr>`
                        )}
                    </tbody>
                </table>
            </div>

            <div class="nd-data-table__footer">
                <p class="nd-data-table__status" data-status role="status" aria-live="polite"></p>
                <nav class="nd-pagination" data-pagination aria-label="Invoice pages"></nav>
            </div>
        </div>
    `,
} satisfies Meta<DataTableArgs>;

export default meta;
type Story = StoryObj<DataTableArgs>;

/** Nine invoices at three per page, with sorting, selection, and paging live. */
export const Default: Story = {
    play: ({ canvasElement }) => {
        initDataTable(canvasElement);
    },
};

/** The whole set on one page, so selection spans every row. */
export const SinglePage: Story = {
    args: { pageSize: 9 },
    play: ({ canvasElement }) => {
        initDataTable(canvasElement);
    },
};

/** Amount sorted descending on load, through the block's public `sort()`. */
export const SortedByAmount: Story = {
    play: ({ canvasElement }) => {
        initDataTable(canvasElement)?.sort('amount', 'descending');
    },
};
