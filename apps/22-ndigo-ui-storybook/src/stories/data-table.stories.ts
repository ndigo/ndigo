/**
 * Storybook stories for the Ndigo UI data-table component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'Blocks/Data Table',
    tags: ['autodocs'],
    render: () =>
        html`<div class="nd-data-table" data-data-table data-page-size="3">
            <div class="nd-table-wrap">
                <table class="nd-table nd-table--striped">
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
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody data-rows>
                        <tr data-row-id="INV-001">
                            <td class="nd-data-table__select">
                                <input
                                    class="nd-checkbox"
                                    type="checkbox"
                                    data-select-row
                                    aria-label="Select INV-001"
                                />
                            </td>
                            <td data-sort-value="INV-001">INV-001</td>
                            <td>Paid</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="nd-data-table__footer">
                <p class="nd-data-table__status" data-status role="status" aria-live="polite"></p>
                <nav class="nd-pagination" data-pagination aria-label="Invoice pages"></nav>
            </div>
        </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
